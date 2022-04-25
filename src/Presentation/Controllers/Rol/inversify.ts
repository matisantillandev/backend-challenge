import TYPES from '@src/TYPES'
import { Container } from "inversify";
import "reflect-metadata";

import Schemable from '@Domain/Entities/Util/Ports/Schemable'
import Validable from '@Domain/Entities/Util/Ports/Validable'
import Routeable from '@Presentation/Controllers/Ports/Routeable'

import RolServiceableDomain from '@Domain/Entities/Rol/Ports/Serviceable'
import RolInterface from '@Domain/Entities/Rol/Interface'
import RolModel from '@Domain/Entities/Rol/Model'
import RolServiceDomain from '@Domain/Entities/Rol/Controller'
import RolDto from '@Domain/Entities/Rol/Dto'
import RolServicePresentation from '@Presentation/Controllers/Rol/Controller'

var container = new Container()
container.bind<Schemable>(TYPES.Schemable).toConstantValue(new RolModel).whenTargetNamed(TYPES.Rol)
container.bind<Validable>(TYPES.Validable).to(RolDto).whenTargetNamed(TYPES.Rol)
container.bind<RolInterface>(TYPES.RolInterface).toConstantValue(new RolDto)
container.bind<RolServiceableDomain>(TYPES.RolServiceableDomain).to(RolServiceDomain)
container.bind<Routeable>(TYPES.Routeable).to(RolServicePresentation)

export default container
