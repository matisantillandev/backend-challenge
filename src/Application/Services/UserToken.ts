import UserTokenable from "./Ports/UserTokenable";

import User from '@Domain/Entities/User/Interface'
import Tokenizable from './Ports/Tokenizable'

export default class UserToken implements UserTokenable {
	public user: User
	public token: Tokenizable
}
