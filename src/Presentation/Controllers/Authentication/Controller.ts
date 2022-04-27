import { Router, Request, Response, NextFunction } from 'express'
import { Model, Document, Schema } from 'mongoose'
import { injectable, inject, named } from 'inversify'
import * as jwt from 'jsonwebtoken'

import TYPES from '@src/TYPES'
import container from '@src/inversify.config'

import Patheable from '../Ports/Patheable'
import Routeable from '../Ports/Routeable'
import Responseable from '../Responseable'
import DomainResponseable from '@Domain/Entities/Util/Ports/Responseable'

import Validateable from '@Domain/Middleware/Ports/Validateable'
import Validable from '@Domain/Entities/Util/Ports/Validable'

import Authenticable from '@src/Application/Services/Ports/Authenticable'

import Logueable from '@Domain/Entities/User/Ports/Logueable'
import Registrable from '@Domain/Entities/User/Ports/Registrable'

import Schemable from '@Domain/Entities/Util/Ports/Schemable'

import GeteableModel from '@Infrastructure/Persistence/Ports/GeteableModel'

import Serviceable from '@Domain/Entities/User/Ports/Serviceable'
import config from '@src/config'
import DataStoredInTokenable from '../../Middlewares/Ports/DataStoredInTokenable'
import User from '@Domain/Entities/User/Model'
import SendeableMail from '@src/Application/Mail/Ports/SendeableMail'

@injectable()
export default class Controller implements Routeable, Patheable {
	public router: Router = container.get<Router>(TYPES.Router)
	public path: string = '/auth'
	private validationProvider: Validateable = container.get<Validateable>(TYPES.Validateable)
	@inject(TYPES.Responseable) private responserService: Responseable

	@inject(TYPES.GeteableModel) private connectionProvider: GeteableModel
	@inject(TYPES.Authenticable) private authenticationService: Authenticable
	@inject(TYPES.UserServiceableDomain) private userService: Serviceable
	@inject(TYPES.Schemable) @named(TYPES.User) private userSchema: Schemable
	@inject(TYPES.Validable) @named(TYPES.Login) private loginDto: Validable
	@inject(TYPES.Validable) @named(TYPES.User) private userDto: Validable

	@inject(TYPES.SendeableMail) private sendMailController: SendeableMail

	constructor() {
		this.initializeRoutes(this.validationProvider)
	}

	private initializeRoutes(validationProvider: Validateable) {
		this.router.post(`${this.path}/reset/:db`, [], this.requestResetPass)
		this.router.post(`${this.path}/register/:db`, [validationProvider.validate(this.userDto)], this.registration)
		this.router.post(`${this.path}/login/:db`, [validationProvider.validate(this.loginDto)], this.loggingIn)
		this.router.post(`${this.path}/validate`, [validationProvider.validate(this.loginDto)], this.validateUser)
	}

	private validateUser = async (request: Request, response: Response, next: NextFunction) => {
		try {
			let token = request.headers.authorization.replace(/['"]+/g, '')
			const secret = config?.TOKEN_SECRET
			let verificationResponse: DataStoredInTokenable = (await jwt.verify(token, secret)) as DataStoredInTokenable
			if (verificationResponse?._id && verificationResponse?.database) {
				const id = verificationResponse?._id
				const database: string = verificationResponse?.database

				const schema: Schemable = new User()
				const model: Model<Document, {}> = await this.connectionProvider.getModel(database, schema.name, schema)

				const aggregations = {
					match: {
						_id: { $oid: id },
					},
					limit: 1,
					skip: 0,
				}

				const userResponse = await this.userService.getAll(model, aggregations)
				if (userResponse.result) {
					if (userResponse.result.enabled) {
						this.responserService.res = {
							result: { user: userResponse.result, token },
							message: userResponse.message,
							status: userResponse.status,
							error: userResponse.error,
						}
					} else {
						this.responserService.res = {
							result: [],
							message: 'El usuario provisto no se encuentra habilitado.',
							status: 401,
							error: 'Usuario inhabilitado',
						}
					}
				} else {
					this.responserService.res = {
						result: [],
						message: 'El usuario provisto no se encuentra registrado.',
						status: 404,
						error: 'No se encontro el usuario',
					}
				}
			} else {
				this.responserService.res = {
					result: [],
					message: 'Sesión de usuario vencida. Ingrese nuevamente.',
					status: 401,
					error: 'Token Expired',
				}
			}
		} catch (error) {
			this.responserService.res = {
				result: [],
				message: 'Credenciales invalidas. Ingrese sesión nuevamente',
				status: 401,
				error: 'Token no provisto',
			}
		}

		if (this.responserService.res.status) {
			response.status(this.responserService.res.status).send(this.responserService.res)
		} else {
			response.status(500).send(this.responserService.res)
		}
	}

	private requestResetPass = async (request: Request, response: Response, next: NextFunction) => {
		try {
			const db: string = request.params.db
			const email = request.body.email
			if (email) {
				let userModel: Model<Document, {}> = await this.connectionProvider.getModel(db, this.userSchema.name, this.userSchema)

				const existUser = await this.userService.existUserWithThatEmail(email, userModel)

				if (existUser) {
					const aggregations = {
						match: { email, operationType: { $ne: 'D' } },
						limit: 1,
						skip: 0,
					}
					const userResponse = await this.userService.getAll(userModel, aggregations)
					if (userResponse.result !== undefined) {
						console.log({ userResponse })
						const password = await this.userService.hashPassword(userResponse.result.dni)
						const updateResonse = await this.userService.update(userResponse.result._id, { password }, userModel, userResponse.result._id)
						if (Object.keys(updateResonse.result).length > 0) {
							let from = process.env.EMAIL_SENDER
							let pass = process.env.EMAIL_SENDER_SECRET
							let to: string = email

							const emailResponse = await this.sendMailController.sendMail(
								to,
								`<!DOCTYPE html>
									<html lang="es">
										<head>
											<meta charset="UTF-8" />
											<meta name="viewport" content="width=device-width, initial-scale=1.0" />
											<meta http-equiv="X-UA-Compatible" content="ie=edge" />
											<title>Recupero de Contraseña | Challenge</title>
											<link rel="preconnect" href="https://fonts.googleapis.com" />
											<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
											<link
												href="https://fonts.googleapis.com/css2?family=Overpass:wght@200;300;500&display=swap"
												rel="stylesheet"
											/>
											<style>
												html {
													font-family: Overpass;
													font-weight: 300;
												}
											</style>
										</head>
										<body>
											<div
												style="
													width: 600px;
													height: 600px;
													border: 2px solid #000000;
													border-radius: 13.2px;
													position: relative;
												"
											>
												<div
													style="
														width: 100%;
														height: 100px;
														background: #000000;
														display: flex;
														flex-direction: row;
														justify-content: center;
														align-items: center;
													"
												>
													<img
														style="max-width: 40px; height: auto;"
														src="https://res.cloudinary.com/msantillandev-41482397/image/upload/v1651052493/logo-white_vtntlq.svg"
													/>
													<h3 style="color: #ffffff;">
														Recuperación de contraseña
													</h3>
												</div>
									
												<div style="padding: 40px; height: 320px">
													<h2>Hola ${userResponse.result.name}!</h2>
													<p>
														Haz recuperado tu contraseña correctamente. Para acceder al sitio
														nuevamente debes ingresar utilizando tu correo electronico y tu nueva
														contraseña es tu dni.
													</p>
												</div>
												<div
													style="
														width: 100%;
														height: 100px;
														background: #000000;
														position: absolute;
														bottom: 0;
														left: 0;
													"
												>
													<ul
														style="
															width: auto;
															height: 100px;
															display: flex;
															flex-direction: row;
															justify-content: space-around;
															align-items: center;
														"
													>
														<li style="list-style: none;">
															<a
																style="color: #ffffff; text-decoration: none;"
																href="https://aluxion.com/aviso-legal.html"
																target="_blank"
																>Aviso legal</a
															>
														</li>
														<li style="color: #ffffff; list-style: none;">
															<a
																style="color: #ffffff; text-decoration: none;"
																href="https://aluxion.com/aviso-cookies.html"
																target="_blank"
																>Aviso de cookies</a
															>
														</li>
														<li style="color: #ffffff; list-style: none;">
															<a
																style="color: #ffffff; text-decoration: none;"
																href="https://aluxion.com/politica-de-privacidad.html"
																target="_blank"
															>
																Política de privacidad</a
															>
														</li>
													</ul>
												</div>
											</div>
										</body>
									</html>
								`,
								from,
								pass,
								'Challenge Backend | Recupero de contraseña',
							)

							if (emailResponse.result) {
								this.responserService.res = {
									result: emailResponse.result,
									message: 'Contraseña recuperada correctamente. Te enviamos un e-mail para continuar con la validación de tu cuenta. En caso que no lo encuentres revisa tu casilla de spam.',
									status: emailResponse.status,
									error: emailResponse.error,
								}
							} else {
								this.responserService.res = {
									result: emailResponse.result,
									message: emailResponse.message,
									status: emailResponse.status,
									error: emailResponse.error,
								}
							}
						} else {
							this.responserService.res = {
								result: [],
								message: 'No se pudo actualizar el usuario',
								status: 500,
								error: 'Error al actualizar el usuario',
							}
						}
					} else {
						this.responserService.res = {
							result: userResponse.result,
							message: userResponse.message,
							status: userResponse.status,
							error: userResponse.error,
						}
					}
				} else {
					this.responserService.res = {
						result: undefined,
						message: `No tenemos registrado el email ${email}, por favor verifica que este escrito correctamente.
						Debes  estar registrado para cambiar tu contraseña.`,
						status: 500,
						error: 'Usuario no registrado',
					}
				}
			} else {
				this.responserService.res = {
					result: undefined,
					message: `El correo electrónico no fue provisto.`,
					status: 500,
					error: 'Email no provisto',
				}
			}
		} catch (error) {
			this.responserService.res = {
				result: undefined,
				message: error.message,
				status: 500,
				error: error,
			}
		}

		if (this.responserService.res.status) {
			response.status(this.responserService.res.status).send(this.responserService.res)
		} else {
			response.status(500).send(this.responserService.res)
		}
	}

	private registration = async (request: Request, response: Response, next: NextFunction) => {
		const userData = request.body
		const database: any = request.params.db

		const model: Model<Document, {}> = await this.connectionProvider.getModel(database, this.userSchema.name, this.userSchema)

		if (database && database != '') {
			try {
				const registerResponse: DomainResponseable = await this.authenticationService.register(userData, database, model)
				if (registerResponse.result !== undefined) {
					let from = process.env.EMAIL_SENDER
					let pass = process.env.EMAIL_SENDER_SECRET
					let to: string = userData.email

					const emailResponse = await this.sendMailController.sendMail(
						to,
						`<!DOCTYPE html>
							<html lang="en">
								<head>
									<meta charset="UTF-8" />
									<meta name="viewport" content="width=device-width, initial-scale=1.0" />
									<meta http-equiv="X-UA-Compatible" content="ie=edge" />
									<title>Información de cuenta | Challenge</title>
									<link rel="preconnect" href="https://fonts.googleapis.com" />
									<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
									<link
										href="https://fonts.googleapis.com/css2?family=Overpass:wght@200;300;500&display=swap"
										rel="stylesheet"
									/>
									<style>
										html {
											font-family: Overpass;
											font-weight: 300;
										}
									</style>
								</head>
								<body>
									<div
										style="
											width: 600px;
											height: 600px;
											border: 2px solid #000000;
											border-radius: 13.2px;
											position: relative;
										"
									>
										<div
											style="
												width: 100%;
												height: 100px;
												background: #000000;
												display: flex;
												flex-direction: row;
												align-items: center;
											"
										>
											<img
												style="max-width: 40px; height: auto; margin: 25px;"
												src="./logo-white.svg"
											/>
											<h3 style="color: #ffffff;">
												Información de cuenta
											</h3>
										</div>
							
										<div style="padding: 40px; height: 320px">
											<h2>Bienvenido ${userData.name}!</h2>
											<p>
												Haz creado tu usuario correctamente. Recuerda estar al tanto de los
												avisos legales y políticas de privacidad. Muchas gracias por unirte!
											</p>
										</div>
										<div
											style="
												width: 100%;
												height: 100px;
												background: #000000;
												position: absolute;
												bottom: 0;
												left: 0;
											"
										>
											<ul
												style="
													width: auto;
													height: 50%;
													display: flex;
													flex-direction: row;
													justify-content: space-around;
													align-items: center;
												"
											>
												<li style="list-style: none;">
													<a
														style="color: #ffffff; text-decoration: none;"
														href="https://aluxion.com/aviso-legal.html"
														target="_blank"
														>Aviso legal</a
													>
												</li>
												<li style="color: #ffffff; list-style: none;">
													<a
														style="color: #ffffff; text-decoration: none;"
														href="https://aluxion.com/aviso-cookies.html"
														target="_blank"
														>Aviso de cookies</a
													>
												</li>
												<li style="color: #ffffff; list-style: none;">
													<a
														style="color: #ffffff; text-decoration: none;"
														href="https://aluxion.com/politica-de-privacidad.html"
														target="_blank"
													>
														Política de privacidad</a
													>
												</li>
											</ul>
										</div>
									</div>
								</body>
							</html>
						`,
						from,
						pass,
						'Challenge Backend - Información de cuenta',
					)

					if (emailResponse.result) {
						this.responserService.res = {
							result: emailResponse.result,
							message: 'Usuario registrado correctamente. Te enviamos un e-mail para continuar con la validación de tu cuenta. En caso que no lo encuentres revisa tu casilla de spam.',
							status: emailResponse.status,
							error: emailResponse.error,
						}
					} else {
						this.responserService.res = {
							result: emailResponse.result,
							message: emailResponse.message,
							status: emailResponse.status,
							error: emailResponse.error,
						}
					}
				} else {
					this.responserService.res = {
						result: registerResponse.result,
						message: registerResponse.message,
						status: registerResponse.status,
						error: 500,
					}
				}
			} catch (error) {
				console.error(error)
				throw new Error(`Error: ${error.message}`)
			}
		} else {
			this.responserService.res = {
				result: {},
				message: 'Falta indicar a que negocio pertenece',
				status: 428,
				error: 'Agregar el negocio al cual pertenece en la consulta',
			}
		}

		if (this.responserService.res.status) {
			response.status(this.responserService.res.status).send(this.responserService.res)
		} else {
			response.status(500).send(this.responserService.res)
		}
	}

	private loggingIn = async (request: Request, response: Response, next: NextFunction) => {
		const logInData: Logueable = request.body
		const database: any = request.params.db

		if (database && database != '') {
			try {
				const model: Model<Document, {}> = await this.connectionProvider.getModel(database, this.userSchema.name, this.userSchema)
				const loginResponse: DomainResponseable = await this.authenticationService.login(logInData, database, model, model)

				if (loginResponse.result !== undefined) {
					this.responserService.res = {
						result: loginResponse.result,
						message: loginResponse.message,
						status: loginResponse.status,
						error: loginResponse.error,
					}
				} else {
					this.responserService.res = { result: 'Nop', message: 'La capa superior contesto undefined', error: '', status: 500 }
				}
			} catch (error) {
				console.error(error)
				throw new Error(`Error: ${error.message}`)
			}
		} else {
			this.responserService.res = {
				result: {},
				message: 'Indicar a que db corresponde',
				status: 428,
				error: 'No se ha indicado la db',
			}
		}

		if (this.responserService.res.status) {
			response.status(this.responserService.res.status).send(this.responserService.res)
		} else {
			response.status(500).send(this.responserService.res)
		}
	}
}
