import { Express } from 'express'
/* import validateEntries from "../Middlewares/ValidateEntries"; */
import Routeable from '../Controllers/Ports/Routeable'
import Initiable from '../Ports/Initiable'

import * as swaggerJsDoc from 'swagger-jsdoc'
import { serve, setup } from 'swagger-ui-express'

import swagger from '@src/swagger'

export default class Router implements Initiable {
	public init(app: Express, controllers: Routeable[]) {
		controllers.forEach((controller) => {
			app.use('/', controller.router)
		})

		let options = {
			customCss: `
			.swagger-ui .topbar { background-color: #000000; border-bottom: 20px solid #5dc6d1; }`,
			customSiteTitle: ' API | Challenge',
		}

		const swaggerOptions = swaggerJsDoc(swagger.swaggerOptions)
		app.use('/api/docs', serve)
		app.get('/api/docs', setup(swaggerOptions, options))
	}
}
