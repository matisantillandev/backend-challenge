import { Router, Response, NextFunction, Request } from 'express'
import { Model, Document } from 'mongoose'
import { injectable, inject, named } from 'inversify'
import * as multer from 'multer'

import TYPES from '@src/TYPES'
import container from './../../../inversify.config'

import Routeable from '../Ports/Routeable'
import Patheable from '../Ports/Patheable'
import Responseable from '../Responseable'
import DomainResponseable from '@Domain/Entities/Util/Ports/Responseable'

import RequestWithUser from '@Presentation/Ports/RequestWithUser'

import Authenticateable from '@Presentation/Middlewares/Ports/Authenticateable'
import Authorizeable from '@Presentation/Middlewares/Ports/Authorizeable'

import ConnectionableProvider from '@Infrastructure/Persistence/Ports/ConnectionableProvider'

import Validateable from '@Domain/Middleware/Ports/Validateable'
import Schemable from '@Domain/Entities/Util/Ports/Schemable'
import Validable from '@Domain/Entities/Util/Ports/Validable'

import Dto from '@Domain/Entities/File/Dto'
import ObjInterface from '@Domain/Entities/File/Interface'
import Serviceable from '@Domain/Entities/File/Ports/Serviceable'

import GeteableCompanyStorage from '../Ports/GeteableAgreementStorage'
import GeteableAwsStorage from '../Ports/GeteableAwsStorage'

@injectable()
export default class Controller implements Routeable, Patheable {
	public router: Router = container.get<Router>(TYPES.Router)
	public path: string = '/file'
	private validationProvider: Validateable = container.get<Validateable>(TYPES.Validateable)
	private authMid: Authenticateable = container.get<Authenticateable>(TYPES.Authenticateable)
	private authoMid: Authorizeable = container.get<Authorizeable>(TYPES.Authorizeable)
	@inject(TYPES.ConnectionableProvider) private connectionProvider: ConnectionableProvider
	@inject(TYPES.Responseable) private responserService: Responseable

	@inject(TYPES.Validable) @named(TYPES.File) private dto: Validable
	@inject(TYPES.Schemable) @named(TYPES.File) private schema: Schemable
	@inject(TYPES.FileServiceableDomain) private service: Serviceable

	private storage: GeteableCompanyStorage = container.get<GeteableCompanyStorage>(TYPES.GeteableCompanyStorage)
	private storageAws: GeteableAwsStorage = container.get<GeteableAwsStorage>(TYPES.GeteableAwsStorage)

	constructor() {
		this.initializeRoutes(this.validationProvider, this.storage, this.storageAws)
	}

	initializeRoutes(validationProvider: Validateable, storage: GeteableCompanyStorage, storageAws: GeteableAwsStorage) {
		const uploadAws = multer({ storage: storageAws.getAwsStorage() })

		this.router
			.get(`${this.path}/withauth/:db`, [], this.getAllObjsWithoutAuth)
			.get(this.path, [this.authMid.authenticate], this.getAllObjs)
			.get(`${this.path}/:id`, [this.authMid.authenticate, validationProvider.validate(Dto, true)], this.getObjById)
			.post(this.path, [this.authMid.authenticate, this.authoMid.authorice, validationProvider.validate(Dto)], this.saveObj)
			.post(`${this.path}/aws`, [uploadAws.single('image')], this.uploadAws)
			.put(`${this.path}/:id`, [this.authMid.authenticate, this.authoMid.authorice, validationProvider.validate(Dto, true)], this.updateObj)
			.delete(`${this.path}/:id`, [this.authMid.authenticate, this.authoMid.authorice], this.deleteObj)
	}

	private getAllObjsWithoutAuth = async (request: Request, response: Response, next: NextFunction) => {
		const model: Model<Document, {}> = await this.connectionProvider.getModel(request.params.db, this.schema.name, this.schema)

		let aggregations: any = request.query.aggregations || {}

		if (request.query) {
			if (request.query.aggregations) {
				try {
					aggregations = JSON.parse(aggregations)
				} catch (error) {
					error = error
				}
			}
		}

		try {
			const responseService: DomainResponseable = await this.service.getAll(model, aggregations)
			if (responseService.result) {
				this.responserService.res = {
					result: responseService.result,
					message: responseService.message,
					status: responseService.status,
					error: '',
				}
			} else {
				this.responserService.res = {
					result: [],
					message: responseService.message,
					status: responseService.status,
					error: responseService.error,
				}
			}

			response.status(this.responserService.res.status).send(this.responserService.res)
		} catch (error) {
			response.status(500).send({ error })
		}
	}

	private getAllObjs = async (request: RequestWithUser, response: Response, next: NextFunction) => {
		try {
			const model: Model<Document, {}> = await this.connectionProvider.getModel(request.database, this.schema.name, this.schema)

			let aggregations: any = request.query.aggregations || {}

			if (request.query) {
				if (request.query.aggregations) {
					try {
						aggregations = JSON.parse(aggregations)
					} catch (error) {
						error = error
					}
				}
			}

			const responseService: DomainResponseable = await this.service.getAll(model, aggregations)

			if (responseService.result) {
				this.responserService.res = {
					result: responseService.result,
					message: responseService.message,
					status: responseService.status,
					error: '',
				}
			} else {
				this.responserService.res = {
					result: [],
					message: responseService.message,
					status: responseService.status,
					error: responseService.error,
				}
			}

			response.status(this.responserService.res.status).send(this.responserService.res)
		} catch (error) {
			response.status(500).send(this.responserService.res)
		}
	}

	private getObjById = async (request: RequestWithUser, response: Response, next: NextFunction) => {
		try {
			const model: Model<Document, {}> = await this.connectionProvider.getModel(request.database, this.schema.name, this.schema)

			const id: string = request.params.id
			const match = {
				_id: { $oid: id },
			}

			const aggregations = {
				match,
				limit: 1,
				skip: 0,
			}

			const serviceResponse: DomainResponseable = await this.service.getAll(model, aggregations)
			if (serviceResponse.error) {
				this.responserService.res = {
					result: serviceResponse.result,
					message: serviceResponse.message,
					status: serviceResponse.status,
					error: '',
				}
			} else {
				this.responserService.res = {
					result: [],
					message: serviceResponse.message,
					status: serviceResponse.status,
					error: serviceResponse.error,
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

			const objData: ObjInterface = request.body
			const id = request.user._id

			const responseService = await this.service.save(objData, model, id)
			if (responseService.result) {
				this.responserService.res = {
					result: responseService.result,
					message: responseService.message,
					status: responseService.status,
					error: '',
				}
			} else {
				this.responserService.res = {
					result: responseService.result,
					message: responseService.message,
					error: responseService.error,
					status: responseService.status,
				}
			}

			response.status(this.responserService.res.status).send(this.responserService.res)
		} catch (error) {
			response.status(500).send({ error })
		}
	}

	private uploadAws = async (request: RequestWithUser, response: Response, next: NextFunction) => {
		if (request.file && request.file.location) {
			this.responserService.res = {
				result: request.file.location,
				message: 'Upload exitoso',
				status: 200,
				error: '',
			}
		} else {
			this.responserService.res = {
				result: [],
				message: 'No se encontró el archivo',
				status: 404,
				error: 'No se encontró el archivo y por ende, no tenemos su ubicación',
			}
		}
		if (this.responserService.res.status) {
			response.status(this.responserService.res.status).send(this.responserService.res)
		} else {
			response.status(500).send(this.responserService.res)
		}
	}

	private updateObj = async (request: RequestWithUser, response: Response, next: NextFunction) => {
		try {
			const model: Model<Document, {}> = await this.connectionProvider.getModel(request.database, this.schema.name, this.schema)

			const id: string = request.params.id
			const objData: ObjInterface = request.body
			const idUser: string = request.user._id

			const match = {
				_id: { $oid: id },
			}

			const aggregations = {
				match,
				limit: 1,
				skip: 0,
			}

			const responseService: DomainResponseable = await this.service.getAll(model, aggregations)

			if (responseService.status === 200) {
				const updateResponse: DomainResponseable = await this.service.update(id, objData, model, idUser)
				this.responserService.res = {
					result: updateResponse.result,
					message: updateResponse.message,
					status: updateResponse.status,
					error: '',
				}
			} else {
				this.responserService.res = {
					result: responseService.result,
					message: responseService.message,
					error: responseService.error,
					status: responseService.status,
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

			const id: string = request.params.id
			const idUser: string = request.user._id

			const match = {
				_id: { $oid: id },
			}

			const aggregations = {
				match,
				limit: 1,
				skip: 0,
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
					status: deleteResponse.status,
				}
			} else {
				this.responserService.res = {
					result: responseService.result,
					message: responseService.message,
					error: responseService.error,
					status: responseService.status,
				}
			}

			response.status(this.responserService.res.status).send(this.responserService.res)
		} catch (error) {
			response.status(500).send({ error })
		}
	}
}
