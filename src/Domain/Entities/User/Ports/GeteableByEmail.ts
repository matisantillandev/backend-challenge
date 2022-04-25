import { Model, Document } from 'mongoose'
import Responseable from '@Domain/Entities/Util/Ports/Responseable'

export default interface GeteableUserByEmail {
	getUserByEmail(
		email: string,
		model: Model<Document, {}>,
		permissionModel: Model<Document, {}>
	): Promise<Responseable>
}
