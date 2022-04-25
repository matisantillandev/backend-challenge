import { Model, Document } from 'mongoose'

export default interface IsableEnable {
	isEnable(
		id: string,
		model: Model<Document, {}>
	): Promise<Boolean>
}
