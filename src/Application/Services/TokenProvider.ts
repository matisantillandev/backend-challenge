import * as jwt from 'jsonwebtoken'
import { injectable } from 'inversify'

import config from '@src/config'

import Tokenizable from './Ports/Tokenizable'
import CreateableToken from './Ports/CreateableToken'
import Identificable from '@Domain/Entities/Identificable'

@injectable()
export default class TokenProvider implements CreateableToken {

	createToken(user: Identificable, database: string): Tokenizable {
		const expiresIn: number = 600 * 600
		const secret: string = config.TOKEN_SECRET
		const data: {} = { database, _id: user._id }
		const token: Tokenizable = {
			expiresIn,
			token: jwt.sign(data, secret, { expiresIn }),
		}

		return token
	}

}
