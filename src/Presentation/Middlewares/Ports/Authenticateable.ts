import { NextFunction, Response } from 'express'
import RequestWithUser from '@Presentation/Ports/RequestWithUser'

export default interface Authenticateable {
	authenticate(
		request: RequestWithUser,
		response: Response,
		next: NextFunction
	): Promise<void>
}
