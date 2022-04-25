import { Express } from 'express'
import Routeable from '@Presentation/Controllers/Ports/Routeable'

export default interface Initiable {
	init(app: Express, controllers: Routeable[]): void
}
