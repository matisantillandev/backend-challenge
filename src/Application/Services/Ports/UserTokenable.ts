import User from '@Domain/Entities/User/Interface'
import Tokenizable from './Tokenizable'

export default interface UserTokenable {
	user: User
	token: Tokenizable
}
