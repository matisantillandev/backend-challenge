import { Model, Document } from 'mongoose'
import { injectable, inject } from 'inversify';
import { hash, compare } from 'bcryptjs'

import TYPES from '@src/TYPES'

import Responseable from '@Domain/Entities/Util/Ports/Responseable'

import Serviceable from './Ports/Serviceable'
import Registrable from './Ports/Registrable'

import GeteableAll from '@Domain/Entities/Util/Ports/GeteableAll'
import Saveable from '@Domain/Entities/Util/Ports/Saveable'
import Updateable from '@Domain/Entities/Util/Ports/Updateable'
import ObjInterface from '@Domain/Entities/User/Interface';

@injectable()
export default class Controller implements Serviceable {

	@inject(TYPES.Updateable) private updateableService: Updateable
	@inject(TYPES.GeteableAll) private geteableAllService: GeteableAll
	@inject(TYPES.Saveable) private saveableService: Saveable
	@inject(TYPES.ResponseableDomain) private responserService: Responseable

	public async update(
		id: string,
		data: {
			password: string
		},
		model: Model<Document, {}>,
		idUser: string
	): Promise<Responseable> {
		if (data.password !== undefined && data.password !== '') {
			data.password = await hash(data.password, 10)
		}

		return this.updateableService.update(id, data, model, model, idUser)
		
	}

	public async hashPassword(
		pass: string
	): Promise<string> {
		try{
			const passwordHashed = await hash(pass, 10)
			
			if(passwordHashed) return passwordHashed
		} catch (error){
			throw new Error(`No se pude encriptar tu contraseña. Error: ${error}`)
		}
	}

	public async isEnable(
		id: string,
		model: Model<Document, {}>
	): Promise<Boolean> {

		let isEnable: boolean = false
		let match = {
			_id:{$oid: id }
		}
		let limit = 1
		let skip = 0
		let aggregations = {
			match,
			limit,
			skip
		}

		const responseService = await this.geteableAllService.getAll(model, aggregations)
			
		if(responseService.result) {
			let user: ObjInterface = responseService.result
			if(user.enabled) {
				isEnable = true
			} else {
				isEnable = false
			}
		} 
		return isEnable
		
	}

	public async isMatch(
		loginPass: string,
		userPass: string
	): Promise<Boolean> {

		return await compare(loginPass, userPass)
				
		
	}
	
	public async getUserByEmail(
		email: string,
		model: Model<Document, {}>,
		permissionModel: Model<Document, {}>
	): Promise<Responseable> {

		let aggregations = {
			match: { email: email, operationType: { $ne: 'D' } },
			limit: 1,
			skip: 0
		}
		return this.geteableAllService.getAll(model, aggregations)
	}

	
	public async existUserWithThatEmail(
		email: string,
		model: Model<Document, {}>
	): Promise<Boolean> {

		let aggregations = {
			match: { email: email, operationType: { $ne: 'D' } },
			limit: 0,
			skip: 0
		}
			
		let exist: boolean = false
		const responseService = await this.geteableAllService.getAll(model, aggregations)
			
		if(Object.entries(responseService.result).length > 0) {
			exist = true
		} else {
			exist = false
		}

		return exist

	}

		
	public async save(
		data: Registrable,
		model: Model<Document, {}>,
		idUser?: string
	): Promise<Responseable> {

		let user: any = data
		user.enabled = true

		return this.saveableService.save(user, model, model, idUser)
	}

	

	public async getAll(
		model: Model<Document, {}>,
		aggregations: {},
	): Promise<Responseable> {
		return this.geteableAllService.getAll(model, aggregations)
	}

}
