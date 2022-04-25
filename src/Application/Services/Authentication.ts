import { Model, Document } from 'mongoose'
import { injectable, inject } from 'inversify'
import TYPES from '@src/TYPES'

import Authenticable from './Ports/Authenticable'
import Registrable from '@Domain/Entities/User/Ports/Registrable'
import UserServiceable from '@Domain/Entities/User/Ports/Serviceable'


import CreateableToken from '@src/Application/Services/Ports/CreatableToken'
import Logueable from '@Domain/Entities/User/Ports/Logueable'
import LogueableVerified from '@Domain/Entities/User/Ports/LogueableVerified'
import Controlleable from '@Domain/Entities/Util/Ports/Controlleable'
//import SendeableMail from './../UC/Ports/SendeableMail'
import UserTokenable from '@src/Application/Services/Ports/UserTokenable'
import UserToken from './UserToken'
import Responseable from '@Domain/Entities/Util/Ports/Responseable'
import Responser from '@Domain/Entities/Util/Responser'

@injectable()
export default class Authentication implements Authenticable {

	@inject(TYPES.UserServiceableDomain) private userService: UserServiceable

	@inject(TYPES.CreateableToken) private tokenProvider: CreateableToken
	@inject(TYPES.Controlleable) private controllerService: Controlleable
	//@inject(TYPES.SendeableMail) private sendMailController: SendeableMail

	public async getPass(
		email: string,
		pass: string,
		userId: string,
		userModel: Model<Document, {}>,
	): Promise<Responseable> {

		try {
			let responserService: Responseable = new Responser()
			const existUser: Boolean = await this.userService.existUserWithThatEmail(email, userModel)

			if (existUser) {
				const hashedPassword = this.userService.hashPassword(pass)

				let aggregations = {
					match:{ operationType: { $ne: 'D' }, email },
					limit : 1,
					skip: 0
				}
				const responseService = await this.controllerService.getAll(userModel, aggregations)
				if (responseService.result) {
					let _id: string = responseService.result._id
					const updateResponse = await this.controllerService.update(_id, { password: hashedPassword }, userModel, userModel, _id)

					if (updateResponse.result) {
						responserService = {
							result: updateResponse.result,
							message: updateResponse.message,
							error: '',
							status: updateResponse.status
						}
					} else {
						responserService = {
							result: [],
							message: updateResponse.message,
							error: updateResponse.error,
							status: updateResponse.status
						}
					}

				} else {
					responserService = {
						result: [],
						message: responseService.message,
						error: responseService.error,
						status: responseService.status
					}
				}
			}else{
				responserService = {
					result: [],
					message: `No se encontró un usuario registrado con el email ${email}`,
					error: "Usuario no registrado",
					status: 404
				}
			}

			return responserService

		} catch (error) {
			throw new Error(`Se produjo un error al realizar la operación. Error: ${error}`)
		}

	}


	public async register(
		userData: Registrable,
		database: string,
		model: Model<Document, {}>,
	): Promise<Responseable> {


		let responserService: Responseable = new Responser()
		let register: UserTokenable = new UserToken()

		try {
			const existUserEmail = await this.userService.existUserWithThatEmail(userData.email, model)
			if (!existUserEmail) {
				const hashedPassword = await this.userService.hashPassword(userData.password)
				userData.password = hashedPassword

				const saveResponse = await this.userService.save(userData, model)
				if (saveResponse.result) {

					register.user = saveResponse.result
					register.user.password = undefined
					register.token = this.tokenProvider.createToken(register.user, database);

					responserService = {
						result: {
							user: register.user,
							token: register.token,

						},
						message: 'Registro exitoso',
						error: '',
						status: 200
					}

				} else {
					responserService = {
						result: [],
						message: saveResponse.message,
						error: saveResponse.error,
						status: saveResponse.status
					}
				}

			}else{
				responserService = {
					result: [],
					message: "El usuario ya se encuentra registrado.",
					error: "Usuario ya registrado.",
					status: 500
				}
			}

			return responserService
		} catch (error) {
			return responserService = {
				result: error.result,
				message: error.message,
				error: error.error,
				status: error.status
			}
		}

	}

	public async login(
		loginData: Logueable,
		database: string,
		model: Model<Document, {}>,
		permissionModel: Model<Document, {}>
	): Promise<Responseable> {

		let responserService: Responseable = new Responser()
		let login: UserTokenable = new UserToken()

		try {
			const existUserEmail = await this.userService.existUserWithThatEmail(loginData.email, model)
			if (existUserEmail) {
				const userResponse = await this.userService.getUserByEmail(loginData.email, model, permissionModel)
				if (userResponse.result) {
					login.user = userResponse.result

					const matched = await this.userService.isMatch(loginData.password, login.user.password)
					const isEnabled = await this.userService.isEnable(login.user._id, model)

					if (matched) {
						if (isEnabled) {
							login.user.password = undefined
							login.token = this.tokenProvider.createToken(login.user, database)
							responserService = {
								result: {
									user: login.user,
									token: login.token
								},
								message: 'Bienvenido ' + login.user.email,
								error: '',
								status: 200
							}
						} else {
							responserService = {
								result: [],
								message: `El usuario ${loginData.email} no se encuentra habilitado.`,
								error: '',
								status: 404
							}
						}
					} else {
						responserService = {
							result: [],
							message: 'No se pudo iniciar sesión. Credenciales inválidas',
							error: '',
							status: 404
						}
					}

				}
			} else {
				responserService = {
					result: [],
					message: `El correo ${loginData.email} no se encuetra registrado`,
					error: '',
					status: 404
				}
			}

			return responserService
		} catch (error) {
			console.log(error.message)
			throw new Error(`No se pudo iniciar sesión. Error: ${error.message}`)
		}

	}

	public async loginVerified(
		loginData: LogueableVerified,
		database: string,
		model: Model<Document, {}>
	): Promise<Responseable> {

		try {
			let responserService: Responseable = new Responser()
			let login: UserTokenable = new UserToken()

			const aggregations = {
				match: { password: loginData.password },
				limit: 1, 
				skip: 0
			}
			const serviceResponse = await this.controllerService.getAll(model, aggregations)
			if (serviceResponse.result) {
				login.user = serviceResponse.result
				const userEnabled = await this.userService.isEnable(login.user._id, model)

				if (userEnabled) {

					login.user.password = undefined
					login.token = this.tokenProvider.createToken(login.user, database)
					responserService = {
						result: {
							user: login.user,
							token: login.token
						},
						message: 'Bienvenido ' + login.user.name + ' ' + login.user.lastname,
						error: '',
						status: 200
					}

				} else {
					responserService = {
						result: [],
						message: 'El usuario no se encuentra habilitado',
						error: '',
						status: 500
					}
				}

			} else {
				responserService = {
					result: [],
					message: serviceResponse.message,
					error: serviceResponse.error,
					status: serviceResponse.status
				}
			}

			return responserService
		} catch (error) {
			throw new Error(`No se pudo iniciar sesión. Error: ${error.message}`)
		}
	}
}
