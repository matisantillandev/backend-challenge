import { Schema } from 'mongoose'
import { injectable } from 'inversify';

import Schemable from '@Domain/Entities/Util/Model'
import Nameable from '@Domain/Entities/Util/Ports/Nameable'

export const entity: string = 'mail'

export const model = {
	from: {
		type: String,
		typed: 'string'
	},
	pass: {
		type: String,
		typed: 'string'
	},
	enabled: {
		type: String,
		typed: 'string'
	},

	entity: {
		type: String,
		typed: entity
	}

}

@injectable()
export default class ENTITY_SCHEMA extends Schemable implements Nameable {

	public name: string
	'user'
	constructor() {

		super(model, {
			collection: entity
		})

		this.name = entity

	}
}
