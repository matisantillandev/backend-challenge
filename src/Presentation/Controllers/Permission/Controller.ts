import { Router, Response, NextFunction, Request } from 'express'
import { Model, Document } from 'mongoose'
import { injectable, inject, named } from 'inversify';

import CONFIG from '@src/config'
import TYPES from '@src/TYPES';
import container from '@src/inversify.config';

import Routeable from '../Ports/Routeable'
import Patheable from '../Ports/Patheable'
import Responseable from '../Responseable'
import DomainResponseable from '@Domain/Entities/Util/Ports/Responseable'

import RequestWithUser from '../../Ports/RequestWithUser'

import Authenticateable from '@Presentation/Middlewares/Ports/Authenticateable'
import Authorizeable from '@Presentation/Middlewares/Ports/Authorizeable';

import ConnectionableProvider from '@Infrastructure/Persistence/Ports/ConnectionableProvider'

import Validateable from '@Domain/Middleware/Ports/Validateable'
import Schemable from '@Domain/Entities/Util/Ports/Schemable'

import Dto from '@Domain/Entities/Permission/Dto'
import ObjInterface from '@Domain/Entities/Permission/Interface'
import Serviceable from '@Domain/Entities/Permission/Ports/Serviceable'

@injectable()
export default class Controller implements Routeable, Patheable {

	public router: Router = container.get<Router>(TYPES.Router)
	public path: string = '/permission'
	private validationProvider: Validateable = container.get<Validateable>(TYPES.Validateable)
	private authMid: Authenticateable = container.get<Authenticateable>(TYPES.Authenticateable)
	private authoMid: Authorizeable = container.get<Authorizeable>(TYPES.Authorizeable)
	@inject(TYPES.ConnectionableProvider) private connectionProvider: ConnectionableProvider
	@inject(TYPES.Responseable) private responserService: Responseable
	
	@inject(TYPES.Schemable) @named(TYPES.Permission) private schema: Schemable
	@inject(TYPES.Schemable) @named(TYPES.User) private userSchema: Schemable
	@inject(TYPES.PermissionServiceableDomain) private service: Serviceable

	constructor() {
		this.initializeRoutes(this.validationProvider);
	}

	initializeRoutes(validationProvider: Validateable) {

		this.router
			.get(`${this.path}`, [this.authMid.authenticate], this.getPermissions)
			.get(`${this.path}/byUser/:id`, [this.authMid.authenticate], this.getByUser)
			.get(this.path, [this.authMid.authenticate], this.getAllObjs)
			.get(`${this.path}/:id`, [this.authMid.authenticate, validationProvider.validate(Dto, true)], this.getObjById)
			.post(this.path, [this.authMid.authenticate, this.authoMid.authorice, validationProvider.validate(Dto)], this.saveObj)
			.put(`${this.path}/:id`, [this.authMid.authenticate, this.authoMid.authorice, validationProvider.validate(Dto, true)], this.updateObj)
			.delete(`${this.path}/:id`, [this.authMid.authenticate, this.authoMid.authorice,], this.deleteObj);			
	}

	private getPermissions = async (request: RequestWithUser, response: Response, next: NextFunction) => {

		this.responserService.res = {
			result: CONFIG.PERMISSIONS,
			message: '',
			status: 200,
			error: null
		}

		if(this.responserService.res.status) {
			response.status(this.responserService.res.status).send(this.responserService.res)
		} else {
			response.status(500).send(this.responserService.res)
		}
	}


	private getByUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {


		try {
			console.log(request.database)
			const model: Model<Document, {}> = await this.connectionProvider.getModel(request.database, this.schema.name, this.schema)
			const userModel: Model<Document, {}> = await this.connectionProvider.getModel(request.database, this.userSchema.name, this.userSchema)

			let id: string = request.params.id
			const permissionResponse: DomainResponseable = await this.service.getByUser(model, userModel, id)
		
			if(Object.entries(permissionResponse.result).length > 0) {
				this.responserService.res = {
					result: {
						permissionList: permissionResponse.result,
						base: CONFIG.PERMISSIONS
					},
					message: permissionResponse.message,
					status: permissionResponse.status,
					error: permissionResponse.error
				}
			} else {
				this.responserService.res = {
					result: [],
					message: permissionResponse.message,
					status: permissionResponse.status,
					error: permissionResponse.error
				}
			}
		} catch (error) {
			this.responserService.res = {
				result: [],
				message: error.message,
				status: 500,
				error: error
			}
		}
		
		

		if(this.responserService.res.status) {
			response.status(this.responserService.res.status).send(this.responserService.res)
		} else {
			response.status(500).send(this.responserService.res)
		}
	}

	private getSchema = async (request: RequestWithUser, response: Response, next: NextFunction) => {
		
		this.responserService.res = {
			result: this.schema.obj,
			message: 'Consulta exitosa',
			status: 200,
			error: ''
		}

		if(this.responserService.res.status) {
			response.status(this.responserService.res.status).send(this.responserService.res)
		} else {
			response.status(500).send(this.responserService.res)
		}
	}

	private getAllObjs = async (request: RequestWithUser, response: Response, next: NextFunction) => {
		try {
			const model: Model<Document, {}> = await this.connectionProvider.getModel(
				request.database,
				this.schema.name,
				this.schema
			)

			let aggregations: any = request.query.aggregations || {}
	

			if (request.query) {
				if (request.query.aggregations) { try { aggregations = JSON.parse(aggregations); } catch (error) { error = error; } }
			
			}

			const responseService: DomainResponseable = await this.service.getAll(model, aggregations)

			if (responseService.result) {
				this.responserService.res = {
					result: responseService.result,
					message: responseService.message,
					status: responseService.status,
					error: ''
				}
			} else {
				this.responserService.res = {
					result: [],
					message: responseService.message,
					status: responseService.status,
					error: responseService.error
				}
			}

			response.status(this.responserService.res.status).send(this.responserService.res)

		} catch (error) {
			response.status(500).send(this.responserService.res)
		}

	}

	private getObjById = async (request: RequestWithUser, response: Response, next: NextFunction) => {



		try {

			const model: Model<Document, {}> = await this.connectionProvider.getModel(
				request.database,
				this.schema.name,
				this.schema
			)

			const id: string = request.params.id;
			let aggregations = {
				match:{
					_id: { $oid: id },
				}

			}

			const serviceResponse: DomainResponseable = await this.service.getAll(model, aggregations)
			if (serviceResponse.error) {

				this.responserService.res = {
					result: serviceResponse.result,
					message: serviceResponse.message,
					status: serviceResponse.status,
					error: ''
				}
			} else {
				this.responserService.res = {
					result: [],
					message: serviceResponse.message,
					status: serviceResponse.status,
					error: serviceResponse.error
				}
			}

			return response.status(this.responserService.res.status).send(this.responserService.res)
		} catch (error) {
			response.status(500).send({ error })
		}

	}

	private saveObj = async (request: RequestWithUser, response: Response, next: NextFunction) => {

		try {
			const model: Model<Document, {}> = await this.connectionProvider.getModel(request.database, this.schema.name, this.schema)

			const objData: ObjInterface = request.body;
			const id = request.user._id

			const responseService = await this.service.save(objData, model, id)
			if (responseService.result) {
				this.responserService.res = {
					result: responseService.result,
					message: responseService.message,
					status: responseService.status,
					error: ''
				}
			} else {
				this.responserService.res = {
					result: responseService.result,
					message: responseService.message,
					error: responseService.error,
					status: responseService.status
				}
			}

			response.status(this.responserService.res.status).send(this.responserService.res)
		} catch (error) {
			response.status(500).send({ error })
		}

	}

	private updateObj = async (request: RequestWithUser, response: Response, next: NextFunction) => {
		try {
			const model: Model<Document, {}> = await this.connectionProvider.getModel(request.database, this.schema.name, this.schema)

			const id: string = request.params.id;
			const objData: ObjInterface = request.body;
			const idUser: string = request.user._id;

			let aggregations = {
				match:{
					_id: { $oid: id },
				}

			}

			const responseService: DomainResponseable = await this.service.getAll(model, aggregations)

			if (responseService.status === 200) {
				const updateResponse: DomainResponseable = await this.service.update(id, objData, model, idUser)
				this.responserService.res = {
					result: updateResponse.result,
					message: updateResponse.message,
					status: updateResponse.status,
					error: ''
				}
			} else {
				this.responserService.res = {
					result: responseService.result,
					message: responseService.message,
					error: responseService.error,
					status: responseService.status
				}
			}

			response.status(this.responserService.res.status).send(this.responserService.res)

		} catch (error) {
			response.status(500).send({ error })
		}

	}

	private deleteObj = async (request: RequestWithUser, response: Response, next: NextFunction) => {

		try {

			const model: Model<Document, {}> = await this.connectionProvider.getModel(request.database, this.schema.name, this.schema)

			const id: string = request.params.id;
			const idUser: string = request.user._id

			let aggregations = {
				match:{
					_id: { $oid: id },
				}

			}

			const responseService: DomainResponseable = await this.service.getAll(model, aggregations)
			if (responseService.result) {
				let obj = responseService.result
				obj.operationType = 'D'

				const deleteResponse = await this.service.update(id, obj, model, idUser)
				this.responserService.res = {
					result: deleteResponse.result,
					message: deleteResponse.message,
					error: deleteResponse.error,
					status: deleteResponse.status
				}

			} else {
				this.responserService.res = {
					result: responseService.result,
					message: responseService.message,
					error: responseService.error,
					status: responseService.status
				}
			}

			response.status(this.responserService.res.status).send(this.responserService.res)

		} catch (error) {
			response.status(500).send({ error })
		}

	}

}
