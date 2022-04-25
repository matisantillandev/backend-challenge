import { injectable } from 'inversify'

import DtoUtil from '@Domain/Entities/Util/Ports/Dto'
import Interface from './Interface'
import { Schema } from 'mongoose'
import { IsDefined, IsEmail, IsNumber, isNumber, IsString, MinLength, ValidateIf } from 'class-validator'

@injectable()
export default class EntityDto extends DtoUtil implements Interface {

	@ValidateIf(o => o.name !== undefined)
	@IsString()
	public lastname: string

	@ValidateIf(o => o.name !== undefined)
	@IsString()
	public name: string

	
	@ValidateIf(o => o.dni !== undefined)
	@IsNumber({}, {
		message: "El dni debe ser un número"
	})
	public dni: number

	@IsDefined()
	@IsEmail({}, {
		message: "Se debe ingresar un email válido."
	})
	public email: string

	@ValidateIf(o => o.password !== undefined)
	@MinLength(8,{
		message: "La contraseña debe tener minimo 8 carácteres."
	})
	@IsString()
	public password: string

	@ValidateIf(o => o.password !== undefined)
	public enabled: boolean

	@ValidateIf(o => o.token !== undefined)
	@IsString()
	public token: string
	public verified: boolean
	public rol: Schema.Types.ObjectId


}
