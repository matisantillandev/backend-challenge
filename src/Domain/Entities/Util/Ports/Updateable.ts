import { Model, Document } from 'mongoose'
import Responseable from './Responseable'

export default interface Updateable {
	update(
		id: string,
		objData: {},
		model: Model<Document, {}>,
		userModel: Model<Document, {}>,
		idUser: string
	): Promise<Responseable>
}
