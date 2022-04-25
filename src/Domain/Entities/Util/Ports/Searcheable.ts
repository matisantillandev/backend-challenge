import { Model, Document } from 'mongoose'
import Responseable from './Responseable'

export default interface Searcheable {

	search(
    model: Model<Document, {}>,
    search: string
	): Promise<Responseable>

}
