import { NextFunction, Response } from 'express'
import { Model, Document} from 'mongoose'
import { injectable} from 'inversify';
import * as jwt from 'jsonwebtoken'

import RequestWithUser from '@Presentation/Ports/RequestWithUser'

import DataStoredInTokenable from '@Presentation/Middlewares/Ports/DataStoredInTokenable'
import config from '@src/Utils/config'


import Authenticateable from './Ports/Authenticateable'
import Controlleable from '@Domain/Entities/Util/Ports/Controlleable'

import Schemable from '@Domain/Entities/Util/Model'
import User from '@Domain/Entities/User/Model'


import ConnectionProvider from '@Infrastructure/Persistence/ConnectionProvider'

import UserInterface from '@Domain/Entities/User/Interface'
import Responser from '@Presentation/Controllers/Util/Responser'

import ControllerService from '@Domain/Entities/Util/Controller'
@injectable()
export default class Authentication implements Authenticateable {
	
	public async authenticate(request: RequestWithUser, response: Response, next: NextFunction): Promise<void> {

		let responserService = new Responser()
		let nextBool: boolean = false

		if (request.headers && request.headers.authorization) {
			//validation of jwt
			let token = request.headers.authorization.replace(/['"]+/g, '');
			const secret = config?.TOKEN_SECRET;
			try {
				let verificationResponse: DataStoredInTokenable = await jwt.verify(token, secret) as DataStoredInTokenable;
				if(verificationResponse?._id && verificationResponse?.database) {	
					
					const id = verificationResponse?._id;
					const database: string = verificationResponse?.database;
					const userSchema: Schemable = new User()
					
					let userModel: Model<Document, {}> = await new ConnectionProvider().getModel(database, userSchema.name, userSchema)
				
					let controllerService: Controlleable = new ControllerService()
					
					//Get user 
					let limit = 1
					let skip = 0
					let match = {
						_id: {$oid: id }
					}

					let aggregations = {
						match,
						limit,
						skip
					}
					
					const controllerResponse = await controllerService.getAll(userModel, aggregations)
					
					if(Object.entries(controllerResponse?.result).length > 0){
						let userInterface: UserInterface = controllerResponse?.result

						if(userInterface?.enabled){

							request.user = userInterface
							request.database = database
							nextBool = true

							next()
						} else {
							responserService.res = {
								result: 'Nop',
								message: 'Usuario bloqueado',
								error: 'El usuario con el que intenta ingresar no se encuentra habilitado.',
								status: 423
							}
						}
					} else {
						responserService.res = { 
							result: [], 
							message: controllerResponse.message, 
							error: controllerResponse.error, 
							status: controllerResponse.status 
						}
					}

				} else {
					responserService.res = {
						result: 'Nop',
						message: 'Credenciales inválidas',
						error: 'La credenciales se encuentran vencidas.',
						status: 401
					}
				}
			} catch (error) {
				responserService.res = {
					result: 'No',
					message: error.message,
					error: error,
					status: 401
				}
			}
			
		} else {
			responserService.res = {
				result: 'No',
				message: 'Vuelva a iniciar sesión',
				error: 'Credenciales no provistas',
				status: 401
			}
		}

		if(!nextBool) {
			response.status(responserService.res.status).send(responserService.res)
		}
	}
}
