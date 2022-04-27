import InterfaceUtil from '@Domain/Entities/Util/Ports/Dtoable'
import { Schema } from 'mongoose'

export default interface Interface extends InterfaceUtil {
	name: string
	lastname: string
	dni: string
	enabled: boolean
	password: string
	email: string
	token: string
	verified: boolean
	rol: Schema.Types.ObjectId
}
