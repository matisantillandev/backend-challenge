import { Schema } from 'mongoose'
import { injectable } from 'inversify';

import Schemable from '@Domain/Entities/Util/Model'
import Nameable from '@Domain/Entities/Util/Ports/Nameable'

export const entity: string = 'user'
export const model = {

	name: {
		type: String,
		typed: 'string'
	},
	lastname: { 
		type: String, 
		typed: 'string' 
	},
	dni: {
		type: Number,
		typed: 'number'
	},

	enabled: { 
		type: Boolean, 
		typed: 'boolean' 
	},
	password: { 
		type: String, 
		typed: 'string' 
	},
	email: {
		type: String,
		typed: 'string',
		lowercase: true,
	},
	token: {
		type: String,
		typed: 'string'
	},

	verified: {
		type: Boolean,
		typed: 'boolean',
		default: false
	},

	rol: {
		ref: 'rol',
		typed: 'id',
		type: Schema.Types.ObjectId,
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
