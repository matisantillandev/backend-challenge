import { Model, Document } from 'mongoose'
import { injectable, inject } from 'inversify';
import TYPES from '@src/TYPES'

import Responseable from '@Domain/Entities/Util/Ports/Responseable'

import Serviceable from './Ports/Serviceable'
import Registrable from './Ports/Registrable'

import GeteableAll from '@Domain/Entities/Util/Ports/GeteableAll'
import Saveable from '@Domain/Entities/Util/Ports/Saveable'
import Updateable from '@Domain/Entities/Util/Ports/Updateable'

@injectable()
export default class Controller implements Serviceable {

	@inject(TYPES.Updateable) private updateableService: Updateable
	@inject(TYPES.GeteableAll) private geteableAllService: GeteableAll
	@inject(TYPES.Saveable) private saveableService: Saveable
	
	public async getAll(
		model: Model<Document, {}>,
		aggregations: {},
	): Promise<Responseable> {	
		return this.geteableAllService.getAll(model, aggregations)
	}
	
	public async save(
		data: Registrable,
		model: Model<Document, {}>,
		idUser: string
	): Promise<Responseable> {
		return this.saveableService.save(data, model, model, idUser)
	}

	public async update(
		id: string,
		data: {},
		model: Model<Document, {}>,
		idUser: string,
	): Promise<Responseable> {
		return this.updateableService.update(id, data, model, model, idUser)
	}
}
