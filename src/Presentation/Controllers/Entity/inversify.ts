import TYPES from '@src/TYPES'
import { Container } from "inversify";
import "reflect-metadata";

import Schemable from '@Domain/Entities/Util/Ports/Schemable'
import Validable from '@Domain/Entities/Util/Ports/Validable'
import Routeable from '@Presentation/Controllers/Ports/Routeable'

import EntityServiceableDomain from '@Domain/Entities/Entity/Ports/Serviceable'
import EntityInterface from '@Domain/Entities/Entity/Interface'
import EntityModel from '@Domain/Entities/Entity/Model'
import EntityServiceDomain from '@Domain/Entities/Entity/Controller'
import EntityDto from '@Domain/Entities/Entity/Dto'
import EntityServicePresentation from '@Presentation/Controllers/Entity/Controller'

var container = new Container()
container.bind<Schemable>(TYPES.Schemable).toConstantValue(new EntityModel).whenTargetNamed(TYPES.Entity)
container.bind<Validable>(TYPES.Validable).to(EntityDto).whenTargetNamed(TYPES.Entity)
container.bind<EntityInterface>(TYPES.EntityInterface).toConstantValue(new EntityDto)
container.bind<EntityServiceableDomain>(TYPES.EntityServiceableDomain).to(EntityServiceDomain)
container.bind<Routeable>(TYPES.Routeable).to(EntityServicePresentation)

export default container
