import { Model, Document } from 'mongoose'
import Responseable from './Responseable'

export default interface GeteableAll {

	getAll(
		model: Model<Document, {}>,
		aggregations: {}
	): Promise<Responseable>

}
