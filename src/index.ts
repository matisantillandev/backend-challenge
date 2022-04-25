import 'dotenv/config'

import TYPES from './TYPES'
import container from './inversify.config'

import Appeable from '@src/Utils/Appeable'
import RouterApp from '@Presentation/Router/Controller'

// const dot = require('dotenv').config({ path: './env' });

const routerApp: RouterApp = new RouterApp()
const app = container.get<Appeable>(TYPES.Appeable)

app.run(routerApp);