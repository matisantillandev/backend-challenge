import { Model, Document } from "mongoose";

export default interface ExisteableWithEmail {
	existUserWithThatEmail(
		email: string,
		model: Model<Document, {}>
	): Promise<Boolean> 
}