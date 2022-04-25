import TYPES from '@src/TYPES'
import { Container } from "inversify";
import "reflect-metadata";

import Schemable from '@Domain/Entities/Util/Ports/Schemable'
import Validable from '@Domain/Entities/Util/Ports/Validable'
import Routeable from '@Presentation/Controllers/Ports/Routeable'

import MailServiceableDomain from '@Domain/Entities/Mail/Ports/Serviceable'
import MailInterface from '@Domain/Entities/Mail/Interface'
import MailModel from '@Domain/Entities/Mail/Model'
import MailServiceDomain from '@Domain/Entities/Mail/Controller'
import MailDto from '@Domain/Entities/Mail/Dto'
import MailServicePresentation from '@Presentation/Controllers/Mail/Controller'

var container = new Container()
container.bind<Schemable>(TYPES.Schemable).toConstantValue(new MailModel).whenTargetNamed(TYPES.Mail)
container.bind<Validable>(TYPES.Validable).to(MailDto).whenTargetNamed(TYPES.Mail)
container.bind<MailInterface>(TYPES.MailInterface).toConstantValue(new MailDto)
container.bind<MailServiceableDomain>(TYPES.MailServiceableDomain).to(MailServiceDomain)
container.bind<Routeable>(TYPES.Routeable).to(MailServicePresentation)

export default container
