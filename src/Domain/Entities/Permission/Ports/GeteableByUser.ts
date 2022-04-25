import { Model, Document } from 'mongoose'

import Responseable from '@Domain/Entities/Util/Ports/Responseable'

export default interface GeteableByUser {
	getByUser(
		model: Model<Document, {}>,
		userModel: Model<Document, {}>,
		userId: string
	): Promise<Responseable>
}
