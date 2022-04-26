import { Router, Response, NextFunction, Request } from 'express'
import { Model, Document } from 'mongoose'
import { injectable, inject, named } from 'inversify'

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

import Dto from '@Domain/Entities/Unsplash/Dto'
import ObjInterface from '@Domain/Entities/Unsplash/Interface'
import Serviceable from '@Domain/Entities/Unsplash/Ports/Serviceable'

@injectable()
export default class Controller implements Routeable, Patheable {
	public router: Router = container.get<Router>(TYPES.Router)
	public path: string = '/unsplash'
	private validationProvider: Validateable = container.get<Validateable>(TYPES.Validateable)
	private authMid: Authenticateable = container.get<Authenticateable>(TYPES.Authenticateable)
	private authoMid: Authorizeable = container.get<Authorizeable>(TYPES.Authorizeable)
	@inject(TYPES.ConnectionableProvider) private connectionProvider: ConnectionableProvider
	@inject(TYPES.Responseable) private responserService: Responseable

	@inject(TYPES.Validable) @named(TYPES.Unsplash) private dto: Validable
	@inject(TYPES.Schemable) @named(TYPES.Unsplash) private schema: Schemable
	@inject(TYPES.UnsplashServiceableDomain) private service: Serviceable

	constructor() {
		this.initializeRoutes(this.validationProvider)
	}

	initializeRoutes(validationProvider: Validateable) {
		this.router.get(this.path, [this.authMid.authenticate], this.getAllObjs)
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
}
