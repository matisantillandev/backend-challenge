import { Model, Document } from 'mongoose'

import Responseable from '@Domain/Entities/Util/Ports/Responseable'

export default interface GeteableAll {
	getAll(
		model: Model<Document, {}>,
		aggregations: {},
	): Promise<Responseable>
}
