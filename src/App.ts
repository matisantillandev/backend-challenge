import * as cors from 'cors'
import { Express } from 'express'
import * as express from 'express'
import { injectable, multiInject, inject } from 'inversify';
import 'reflect-metadata';


import container from '@src/inversify.config'
import TYPES from '@src/TYPES';
import Appeable from '@src/Utils/Appeable'
import Routeable from '@Presentation/Controllers/Ports/Routeable'
import Initiable from '@Presentation/Ports/Initiable'
/* import swagger from './swagger' */
/* 

import ErrorMiddleware from './Presentation/Middlewares/Error'
import Socketable from './utils/Socketable'
 */

@injectable()
export default class App implements Appeable {

	public app: Express = container.get<Express>(TYPES.Express)
	@multiInject(TYPES.Routeable) public controllers: Routeable[] = []
	/* @inject(TYPES.Socketable) private socket: Socketable */

	constructor() {
		this.initializeMiddlewares();
		this.initializeErrorHandling();
	}

	public async run(router: Initiable) {

		this.listen()
		router.init(this.app, this.controllers)



	}

	public listen(): void {
		let port: string = process.env.PORT;
		if (port === undefined || port === null) {
			port = '3030';
		}

		this.app.use((req, res, next) => {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "*");
			next();
		});

		/* console.log('Server Socket is running in port ' + port + ' + 999')

		this.socket.io.listen(parseInt(port, 10) + 999); */

		this.app.listen(parseInt(port, 10), function () {
			console.log("Server is running in port " + port)
		});
	}

	public getServer(): Express {
		return this.app
	}

	private initializeMiddlewares() {
		this.app.use(express.urlencoded({ extended: false, limit: '3gb' }))
		this.app.use(express.json({ limit: '1gb' }))
		this.app.use(express.json())
		this.app.use('*', cors())
	}

	private initializeErrorHandling() {
		/* this.app.use(ErrorMiddleware); */
	}

}
