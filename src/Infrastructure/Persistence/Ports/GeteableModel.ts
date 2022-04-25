import { Model, Document, Schema } from 'mongoose'

export default interface GeteableModel {
	getModel(
		database: string,
		name: string,
		schema: Schema<any>
	): Promise<Model<Document, {}>>
}
