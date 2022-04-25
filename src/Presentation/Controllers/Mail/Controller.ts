import { Router, Response, NextFunction, Request } from 'express'
import { Model, Document } from 'mongoose'
import { injectable, inject, named } from 'inversify';

import TYPES from '@src/TYPES';
import container from '@src/inversify.config';

import Routeable from '../Ports/Routeable'
import Patheable from '../Ports/Patheable'
import Responseable from '../Responseable'
import DomainResponseable from '@Domain/Entities/Util/Ports/Responseable'

import RequestWithUser from '@Presentation/Ports/RequestWithUser'

import Authenticateable from '@Presentation/Middlewares/Ports/Authenticateable'
import Authorizeable from '@Presentation/Middlewares/Ports/Authorizeable';

import ConnectionableProvider from '@Infrastructure/Persistence/Ports/ConnectionableProvider'

import Validateable from '@Domain/Middleware/Ports/Validateable'
import Schemable from '@Domain/Entities/Util/Ports/Schemable'
import Validable from '@Domain/Entities/Util/Ports/Validable'

import Dto from '@Domain/Entities/Mail/Dto'
import ObjInterface from '@Domain/Entities/Mail/Interface'
import Serviceable from '@Domain/Entities/Mail/Ports/Serviceable'
import SendeableMail from '@Application/Mail/Ports/SendeableMail';

@injectable()
export default class Controller implements Routeable, Patheable {

	public router: Router = container.get<Router>(TYPES.Router)
	public path: string = '/mail'
	private validationProvider: Validateable = container.get<Validateable>(TYPES.Validateable)
	private authMid: Authenticateable = container.get<Authenticateable>(TYPES.Authenticateable)
	private authoMid: Authorizeable = container.get<Authorizeable>(TYPES.Authorizeable)
	@inject(TYPES.ConnectionableProvider) private connectionProvider: ConnectionableProvider
	@inject(TYPES.Responseable) private responserService: Responseable

	@inject(TYPES.Validable) @named(TYPES.Mail) private dto: Validable
	@inject(TYPES.Schemable) @named(TYPES.Mail) private schema: Schemable
	@inject(TYPES.MailServiceableDomain) private service: Serviceable
	@inject(TYPES.SendeableMail) private sendMailController: SendeableMail

	constructor() {
		this.initializeRoutes(this.validationProvider);
	}

	initializeRoutes(validationProvider: Validateable) {
		this.router
			.get(`${this.path}/withauth/:db`, [], this.getAllObjsWithoutAuth)
			.get(this.path, [this.authMid.authenticate], this.getAllObjs)
			.get(`${this.path}/:id`, [this.authMid.authenticate, validationProvider.validate(Dto, true)], this.getObjById)
			.post(`${this.path}/newsletter`, [], this.subscribeToNewsletter)
			.post(this.path, [this.authMid.authenticate, this.authoMid.authorice, validationProvider.validate(Dto)], this.saveObj)
			.put(`${this.path}/:id`, [this.authMid.authenticate, this.authoMid.authorice, validationProvider.validate(Dto, true)], this.updateObj)
			.delete(`${this.path}/:id`, [this.authMid.authenticate, this.authoMid.authorice ], this.deleteObj);
	}

	private subscribeToNewsletter = async (request: Request, response: Response, next: NextFunction) => {

		let from: string ='test.dicode@gmail.com'
		let to: string = 'matias1.santillan@gmail.com'
		let pass: string = "testdicode20221"

		try {
			
			const sendMailResponse = await this.sendMailController.sendMail(to, "Prueba nodemailer", from, pass, "Prueba Nodemailer Base Api")
			if(sendMailResponse.result !== undefined){
				this.responserService.res = {
					result: sendMailResponse.result,
					message: sendMailResponse.message,
					error: sendMailResponse.error,
					status: sendMailResponse.status
				}
			}

		} catch (error) {
			console.log(error.message);
			this.responserService.res = {
					result: [],
					message: error.message,
					error: error,
					status: 500
				}
		}


		response.status(this.responserService.res.status).send(this.responserService.res)
	}

	private getAllObjsWithoutAuth = async (request: Request, response: Response, next: NextFunction) => {
		const model: Model<Document, {}> = await this.connectionProvider.getModel(
			request.params.db,
			this.schema.name,
			this.schema
		)

		let aggregations: any = request.query.aggregations || {}

		if (request.query) {
			if (request.query.aggregations) { try { aggregations = JSON.parse(aggregations); } catch (error) { error = error; } }
		}

		try {
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
			response.status(500).send({ error })
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
			const match = {
				_id: { $oid: id },

			}

			const aggregations = {
				match,
				limit: 1,
				skip: 0
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

			const match = {
				_id: { $oid: id },

			}

			const aggregations = {
				match,
				limit: 1,
				skip: 0
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

			const match = {
				_id: { $oid: id },

			}

			const aggregations = {
				match,
				limit:1,
				skip:0
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
