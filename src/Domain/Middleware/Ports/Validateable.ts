import { RequestHandler } from 'express'
import Validable from '@Domain/Entities/Validable'
import Responseable from '@Presentation/Controllers/Responseable'

export default interface Validateable {
	responserService: Responseable
	validate(type: Validable, skip?: boolean): RequestHandler
}
