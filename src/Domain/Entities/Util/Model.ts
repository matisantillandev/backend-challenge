import { Schema } from 'mongoose'
import { injectable } from 'inversify';

@injectable()
class ENTITY_SCHEMA extends Schema {

	public name: string

	constructor(schema: {}, schemaOptions?: {}) {

		super({
			...schema,
			observation : {
				type : String,
				typed: 'string'
			},
			creationUser: {
				ref: 'user',
				typed: 'id',
				type: Schema.Types.ObjectId,
			},
			creationDate: {
				type: Date,
				typed: 'date'
			},
			operationType: {
				type: String,
				typed: 'string'
			},
			updateDate: {
				type: Date,
				typed: 'date'
			},
			updateUser: {
				ref: 'user',
				typed: 'id',
				type: Schema.Types.ObjectId,
			}
		}, schemaOptions)

	}
}

export default ENTITY_SCHEMA;
