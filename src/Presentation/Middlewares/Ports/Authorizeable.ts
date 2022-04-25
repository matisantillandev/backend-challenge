import { NextFunction, Response } from 'express'
import RequestWithUser from '@Presentation/Ports/RequestWithUser'

export default interface Authorizeable {
	authorice(
		request: RequestWithUser,
		response: Response,
		next: NextFunction
	): Promise<void>
}
