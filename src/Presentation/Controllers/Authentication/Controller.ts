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

//import SessionInterface from '@Domain/Entities/Session/Interface'

//import SessionBuilderable from '@Domain/Entities/Session/Ports/Builderable'

//import Socketable from './../../../utils/Socketable'
//import SendeableMail from './../../../Aplication/UC/Ports/SendeableMail'
import Serviceable from '@Domain/Entities/User/Ports/Serviceable'
import LogueableWithUser from '@src/Domain/Entities/User/Ports/LogueableVerified'
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
	//@inject(TYPES.SessionServiceableDomain) private sessionService: SesssionServiceable

	@inject(TYPES.Schemable) @named(TYPES.User) private userSchema: Schemable
	/* 	@inject(TYPES.Schemable) @named(TYPES.Company) private companySchema: Schemable */
	//	@inject(TYPES.Schemable) @named(TYPES.Session) private sessionSchema: Schemable
	@inject(TYPES.Schemable) @named(TYPES.Mail) private mailSchema: Schemable
	//	@inject(TYPES.Schemable) @named(TYPES.Permission) private permissionSchema: Schemable

	@inject(TYPES.Validable) @named(TYPES.Login) private loginDto: Validable
	@inject(TYPES.Validable) @named(TYPES.User) private userDto: Validable
	//	@inject(TYPES.Validable) @named(TYPES.Session) private sessionDto: Validable

	@inject(TYPES.SendeableMail) private sendMailController: SendeableMail

	//@inject(TYPES.SessionInterface) private session: SessionInterface

	//@inject(TYPES.SessionBuilderable) private sessionBuilder: SessionBuilderable

	//@inject(TYPES.Socketable) private socket: Socketable

	constructor() {
		this.initializeRoutes(this.validationProvider)
	}

	private initializeRoutes(validationProvider: Validateable) {
		this.router.post(`${this.path}/requestReset/:db`, [], this.requestResetPass)
		this.router.post(`${this.path}/reset/:db/:user`, [], this.resetPass)
		this.router.post(`${this.path}/register/:db`, [validationProvider.validate(this.userDto)], this.registration)
		this.router.post(`${this.path}/loginverified`, [validationProvider.validate(this.loginDto)], this.loggingInVerified)
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
				//let mailModel: Model<Document, {}> = await this.connectionProvider.getModel(db, this.mailSchema.name, this.mailSchema)

				const existUser = await this.userService.existUserWithThatEmail(email, userModel)

				if (existUser) {
					const aggregations = {
						match: { email, operationType: { $ne: 'D' } },
						limit: 1,
						skip: 0,
					}
					const userResponse = await this.userService.getAll(userModel, aggregations)
					if (userResponse.result !== undefined) {
						let from = process.env.EMAIL_SENDER
						let pass = process.env.EMAIL_SENDER_SECRET
						let to: string = email

						const emailResponse = await this.sendMailController.sendMail(
							to,
							`<!DOCTYPE html>
								<html lang="en">
								<head>
									<meta charset="UTF-8">
									<meta name="viewport" content="width=device-width, initial-scale=1.0">
									<title>Challenge Backend | Recupero de contraseña</title>
								<body>
								
									<div>
										<img src="" alt="Challenge Backend - Recupero de contraseña" style="width: 100%;"/>
									</div>
								</body>
								</html>`,
							from,
							pass,
							'Challenge Backend | Recupero de contraseña',
						)

						this.responserService.res = {
							result: userResponse.result,
							message: userResponse.message,
							status: userResponse.status,
							error: userResponse.error,
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

	private resetPass = async (request: Request, response: Response, next: NextFunction) => {
		const db: string = request.params.db
		const userId: string = request.params.id
		const objData: { pass: string } = request.body

		let userModel: Model<Document, {}> = await this.connectionProvider.getModel(db, this.userSchema.name, this.userSchema)

		if (db && db != '') {
			const aggregations = {
				match: { operationType: { $ne: 'D' }, _id: { $oid: userId } },
				limit: 1,
				skip: 0,
			}

			const userResponse = await this.userService.getAll(userModel, aggregations)

			if (userResponse.result !== undefined) {
				const resetPasswordResponse = await this.authenticationService.getPass(userResponse.result.email, objData.pass, userId, userModel)
				if (resetPasswordResponse.result !== undefined) {
					this.responserService.res = {
						result: resetPasswordResponse.result,
						message: resetPasswordResponse.message,
						status: resetPasswordResponse.status,
						error: resetPasswordResponse.error,
					}
				} else {
					this.responserService.res = { result: 'Nop', message: 'La capa superior contesto undefined', error: '', status: 500 }
				}
			} else {
				this.responserService.res = {
					result: undefined,
					message: 'El e-mail no se encuentra registrado, por favor verifica que esté escrito correctamente',
					status: 404,
					error: '',
				}
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

	private registration = async (request: Request, response: Response, next: NextFunction) => {
		const userData: Registrable = request.body
		const database: any = request.params.db

		//const mailModel: Model<Document, {}> = await this.connectionProvider.getModel(database, this.mailSchema.name, this.mailSchema)
		//const sessionModel: Model<Document, {}> = await this.connectionProvider.getModel(database, this.sessionSchema.name, this.sessionSchema)
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
									<meta charset="UTF-8">
									<meta name="viewport" content="width=device-width, initial-scale=1.0">
									<title>Registro de Usuario - Challenge Backend</title>
								<body>
									
									<div>
										<img src="" alt="Registro de Usuario - Challenge Backend" style="width: 100%;"/>
									</div>
								
								</body>
								</html>`,
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

	private loggingInVerified = async (request: Request, response: Response, next: NextFunction) => {
		const logInData: LogueableWithUser = request.body
		const database: any = request.query.database

		if (database && database != '') {
			try {
				const model: Model<Document, {}> = await this.connectionProvider.getModel(database, this.userSchema.name, this.userSchema)
				const loginResponse: DomainResponseable = await this.authenticationService.loginVerified(logInData, database, model)
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
