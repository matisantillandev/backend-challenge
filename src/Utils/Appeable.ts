import { Express } from 'express'
import Initiable from '@Presentation/Ports/Initiable'

export default interface Appeable {
  app: Express
  run(router: Initiable): Promise<void>
  getServer(): Express
}
