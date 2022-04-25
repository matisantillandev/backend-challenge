import Identificable from '@Domain/Entities/Identificable'
import Tokenizable from './Tokenizable'

export default interface CreateableToken {
	createToken(user: Identificable, database: string): Tokenizable
}
