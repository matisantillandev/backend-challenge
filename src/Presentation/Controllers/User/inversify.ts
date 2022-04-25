import TYPES from '@src/TYPES'
import { Container } from "inversify";
import "reflect-metadata";

import Schemable from '@Domain/Entities/Util/Ports/Schemable'
import Validable from '@Domain/Entities/Util/Ports/Validable'
import Routeable from '@Presentation/Controllers/Ports/Routeable'

import UserServiceableDomain from '@Domain/Entities/User/Ports/Serviceable'
import UserInterface from '@Domain/Entities/User/Interface'
import UserModel from '@Domain/Entities/User/Model'
import UserServiceDomain from '@Domain/Entities/User/Controller'
import UserDto from '@Domain/Entities/User/Dto'
import UserServicePresentation from '@Presentation/Controllers/User/Controller'

var container = new Container()
container.bind<Schemable>(TYPES.Schemable).toConstantValue(new UserModel).whenTargetNamed(TYPES.User)
container.bind<Validable>(TYPES.Validable).to(UserDto).whenTargetNamed(TYPES.User)
container.bind<UserInterface>(TYPES.UserInterface).toConstantValue(new UserDto)
container.bind<UserServiceableDomain>(TYPES.UserServiceableDomain).to(UserServiceDomain)
container.bind<Routeable>(TYPES.Routeable).to(UserServicePresentation)

export default container
