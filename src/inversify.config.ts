import { Container } from 'inversify'
import 'reflect-metadata'
import { Router, Express } from 'express'
import TYPES from './TYPES'
import * as express from 'express'

// Containers
import EntityContainer from './Presentation/Controllers/Entity/inversify'
import PermissionContainer from '@Presentation/Controllers/Permission/inversify'
import RolContainer from '@Presentation/Controllers/Rol/inversify'
import MailContainer from '@Presentation/Controllers/Mail/inversify'
import FileContainer from '@Presentation/Controllers/File/inversify'
// containerimport

// Interfaces
import UserInterface from '@Domain/Entities/User/Interface'
// Single
import Appeable from '@src/Utils/Appeable'
import ConnectionableProvider from '@Infrastructure/Persistence/Ports/ConnectionableProvider'
import GeteableModel from '@Infrastructure/Persistence/Ports/GeteableModel'
import Responseable from '@Presentation/Controllers/Responseable'
import Updateable from '@Domain/Entities/Util/Ports/Updateable'
import GeteableAll from '@Domain/Entities/Util/Ports/GeteableAll'
import Saveable from '@Domain/Entities/Util/Ports/Saveable'
import Validateable from '@Domain/Middleware/Ports/Validateable'
import Authenticateable from '@Presentation/Middlewares/Ports/Authenticateable'
import ResponserDomain from '@Domain/Entities/Util/Responser'

// Implementations
// Single
import App from '@src/App'
import ConnectionProvider from '@Infrastructure/Persistence/ConnectionProvider'
import Responser from '@Presentation/Controllers/Util/Responser'
import Controller from '@Domain/Entities/Util/Controller'
import Validation from '@Domain/Middleware/Validation'
import Authentication from '@Presentation/Middlewares/Authentication'
import AuthenticationAplication from '@src/Application/Services/Authentication'
import TokenProvider from '@src/Application/Services/TokenProvider'
import Schemable from '@Domain/Entities/Util/Ports/Schemable'
import Controlleable from '@Domain/Entities/Util/Ports/Controlleable'
import Validable from '@Domain/Entities/Util/Ports/Validable'
import Routeable from '@Presentation/Controllers/Ports/Routeable'

// Repeat
import UserModel from '@Domain/Entities/User/Model'
import UserServiceDomain from '@Domain/Entities/User/Controller'
import UserServiceableDomain from '@Domain/Entities/User/Ports/Serviceable'
import UserServicePresentation from '@Presentation/Controllers/User/Controller'
import UserDto from '@Domain/Entities/User/Dto'

import MailServiceableDomain from '@Domain/Entities/Mail/Ports/Serviceable'
import MailInterface from '@Domain/Entities/Mail/Interface'
import MailModel from '@Domain/Entities/Mail/Model'
import MailServiceDomain from '@Domain/Entities/Mail/Controller'
import MailDto from '@Domain/Entities/Mail/Dto'
import MailServicePresentation from '@Presentation/Controllers/Mail/Controller'

import ResponseableDomain from '@Domain/Entities/Util/Ports/Responseable'
import LoginDto from '@Presentation/Controllers/Authentication/Dto'

import AuthenticationServicePresentation from '@Presentation/Controllers/Authentication/Controller'
import Authenticable from '@Application/Services/Ports/Authenticable'
import CreateableToken from '@Application/Services/Ports/CreatableToken'
import Authorizeable from '@Presentation/Middlewares/Ports/Authorizeable'
import Authorization from '@Presentation/Middlewares/Authorization'
import SendeableMail from '@Application/Mail/Ports/SendeableMail'
import SendMail from '@Application/Mail/SendMail'
import GeteableAwsStorage from '@Presentation/Controllers/Ports/GeteableAwsStorage'
import GeteableCompanyStorage from '@Presentation/Controllers/Ports/GeteableCompanyStorage'

import Storage from '@Presentation/Controllers/Util/AgreementStorage'

const router = express.Router()

var container = new Container()

container.bind<SendeableMail>(TYPES.SendeableMail).to(SendMail)
container.bind<Appeable>(TYPES.Appeable).to(App)
container.bind<Express>(TYPES.Express).toConstantValue(
	express()
		.set('port', process.env.PORT || 3030)
		.use(
			router.get('/', (req, res) => {
				res.send({ response: 'I am alive' }).status(200)
			}),
		),
)

container.bind<ConnectionableProvider>(TYPES.ConnectionableProvider).to(ConnectionProvider)
container.bind<GeteableModel>(TYPES.GeteableModel).to(ConnectionProvider)
container.bind<Responseable>(TYPES.Responseable).to(Responser)
container.bind<Updateable>(TYPES.Updateable).to(Controller)
container.bind<GeteableAll>(TYPES.GeteableAll).to(Controller)
container.bind<Saveable>(TYPES.Saveable).to(Controller)
container.bind<Router>(TYPES.Router).toConstantValue(Router())
container.bind<Validateable>(TYPES.Validateable).to(Validation)
container.bind<Authenticateable>(TYPES.Authenticateable).to(Authentication)
container.bind<Authenticable>(TYPES.Authenticable).to(AuthenticationAplication)
container.bind<CreateableToken>(TYPES.CreateableToken).to(TokenProvider)
container.bind<Authorizeable>(TYPES.Authorizeable).to(Authorization)

container.bind<Controlleable>(TYPES.Controlleable).to(Controller)
/* container.bind<Searcheable>(TYPES.Searcheable).to(Controller) */

container.bind<Schemable>(TYPES.Schemable).toConstantValue(new UserModel()).whenTargetNamed(TYPES.User)

container.bind<Validable>(TYPES.Validable).to(LoginDto).whenTargetNamed(TYPES.Login)
container.bind<Validable>(TYPES.Validable).to(UserDto).whenTargetNamed(TYPES.User)

container.bind<UserInterface>(TYPES.UserInterface).toConstantValue(new UserDto())

container.bind<UserServiceableDomain>(TYPES.UserServiceableDomain).to(UserServiceDomain)

container.bind<Routeable>(TYPES.Routeable).to(AuthenticationServicePresentation)
container.bind<Routeable>(TYPES.Routeable).to(UserServicePresentation)
container.bind<ResponseableDomain>(TYPES.ResponseableDomain).to(ResponserDomain)

container.bind<Schemable>(TYPES.Schemable).toConstantValue(new MailModel()).whenTargetNamed(TYPES.Mail)
container.bind<Validable>(TYPES.Validable).to(MailDto).whenTargetNamed(TYPES.Mail)
container.bind<MailInterface>(TYPES.MailInterface).toConstantValue(new MailDto())
container.bind<MailServiceableDomain>(TYPES.MailServiceableDomain).to(MailServiceDomain)
container.bind<Routeable>(TYPES.Routeable).to(MailServicePresentation)

container.bind<GeteableCompanyStorage>(TYPES.GeteableCompanyStorage).to(Storage)
container.bind<GeteableAwsStorage>(TYPES.GeteableAwsStorage).to(Storage)

let containerReturn = Container.merge(container, EntityContainer)
containerReturn = Container.merge(containerReturn, PermissionContainer)
containerReturn = Container.merge(containerReturn, RolContainer)
containerReturn = Container.merge(containerReturn, FileContainer)
// push

export default containerReturn
