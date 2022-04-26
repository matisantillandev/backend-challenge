import TYPES from '@src/TYPES'
import { Container } from 'inversify'
import 'reflect-metadata'

import Schemable from '@Domain/Entities/Util/Ports/Schemable'
import Validable from '@Domain/Entities/Util/Ports/Validable'
import Routeable from '@Presentation/Controllers/Ports/Routeable'

import UnsplashServiceableDomain from '@Domain/Entities/Unsplash/Ports/Serviceable'
import UnsplashInterface from '@Domain/Entities/Unsplash/Interface'
import UnsplashModel from '@Domain/Entities/Unsplash/Model'
import UnsplashServiceDomain from '@Domain/Entities/Unsplash/Controller'
import UnsplashDto from '@Domain/Entities/Unsplash/Dto'
import UnsplashServicePresentation from '@Presentation/Controllers/Unsplash/Controller'
import GeteableAll from '@src/Domain/Entities/Entity/Ports/GeteableAll'
import UnsplashController from '@src/Domain/UnsplashProvider/search/Controller'

var container = new Container()
container.bind<Schemable>(TYPES.Schemable).toConstantValue(new UnsplashModel()).whenTargetNamed(TYPES.Unsplash)
container.bind<Validable>(TYPES.Validable).to(UnsplashDto).whenTargetNamed(TYPES.Unsplash)
container.bind<UnsplashInterface>(TYPES.UnsplashInterface).toConstantValue(new UnsplashDto())
container.bind<UnsplashServiceableDomain>(TYPES.UnsplashServiceableDomain).to(UnsplashServiceDomain)
container.bind<Routeable>(TYPES.Routeable).to(UnsplashServicePresentation)
container.bind<GeteableAll>(TYPES.GeteableAll).to(UnsplashController).whenTargetNamed(TYPES.UNSPLASH_PROVIDER)

export default container
