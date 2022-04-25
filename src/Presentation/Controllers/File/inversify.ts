import TYPES from '@src/TYPES'
import { Container } from "inversify";
import "reflect-metadata";

import Schemable from '@Domain/Entities/Util/Ports/Schemable'
import Validable from '@Domain/Entities/Util/Ports/Validable'
import Routeable from '@Presentation/Controllers/Ports/Routeable'

import FileServiceableDomain from '@Domain/Entities/File/Ports/Serviceable'
import FileInterface from '@Domain/Entities/File/Interface'
import FileModel from '@Domain/Entities/File/Model'
import FileServiceDomain from '@Domain/Entities/File/Controller'
import FileDto from '@Domain/Entities/File/Dto'
import FileServicePresentation from '@Presentation/Controllers/File/Controller'

var container = new Container()
container.bind<Schemable>(TYPES.Schemable).toConstantValue(new FileModel).whenTargetNamed(TYPES.File)
container.bind<Validable>(TYPES.Validable).to(FileDto).whenTargetNamed(TYPES.File)
container.bind<FileInterface>(TYPES.FileInterface).toConstantValue(new FileDto)
container.bind<FileServiceableDomain>(TYPES.FileServiceableDomain).to(FileServiceDomain)
container.bind<Routeable>(TYPES.Routeable).to(FileServicePresentation)

export default container
