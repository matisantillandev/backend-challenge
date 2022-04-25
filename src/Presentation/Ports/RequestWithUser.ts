import { Request } from 'express'

interface RequestWithUser extends Request {
	user: any
	database: string
	file: any
}

export default RequestWithUser;
