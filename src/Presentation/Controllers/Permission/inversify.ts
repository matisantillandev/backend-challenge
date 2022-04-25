import TYPES from '@src/TYPES'
import { Container } from "inversify";
import "reflect-metadata";

import Schemable from '@Domain/Entities/Util/Ports/Schemable'
import Validable from '@Domain/Entities/Util/Ports/Validable'
import Routeable from '@Presentation/Controllers/Ports/Routeable'

import PermissionServiceableDomain from '@Domain/Entities/Permission/Ports/Serviceable'
import PermissionInterface from '@Domain/Entities/Permission/Interface'
import PermissionModel from '@Domain/Entities/Permission/Model'
import PermissionServiceDomain from '@Domain/Entities/Permission/Controller'
import PermissionDto from '@Domain/Entities/Permission/Dto'
import PermissionServicePresentation from '@Presentation/Controllers/Permission/Controller'

var container = new Container()
container.bind<Schemable>(TYPES.Schemable).toConstantValue(new PermissionModel).whenTargetNamed(TYPES.Permission)
container.bind<Validable>(TYPES.Validable).to(PermissionDto).whenTargetNamed(TYPES.Permission)
container.bind<PermissionInterface>(TYPES.PermissionInterface).toConstantValue(new PermissionDto)
container.bind<PermissionServiceableDomain>(TYPES.PermissionServiceableDomain).to(PermissionServiceDomain)
container.bind<Routeable>(TYPES.Routeable).to(PermissionServicePresentation)

export default container
