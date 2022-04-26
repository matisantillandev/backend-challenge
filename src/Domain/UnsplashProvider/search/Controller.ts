import { Model, Document, Types } from 'mongoose'
import { injectable } from 'inversify'

import GeteableAll from '../../Entities/Util/Ports/GeteableAll'
import Responser from '../../Entities/Util/Responser'
import Responseable from '../../Entities/Util/Ports/Responseable'
import { axiosConfig } from '@src/axios.config'
import { filterSearch } from '../helper/filterSearch'

@injectable()
export default class Controller implements GeteableAll {
	private responserService: Responseable

	constructor() {
		this.responserService = new Responser()
	}

	public async getAll(model: Model<Document, {}>, aggregations: {}): Promise<Responseable> {
		return new Promise<Responseable>(async (resolve, reject) => {
			try {
				const matchAggregation = aggregations['match']
				const { query, page, per_page, collections, content_filter, orientation, ...match } = matchAggregation
				const pictureSearch = await axiosConfig.get(`/search/photos?query=${JSON.stringify(query)}`)

				if (pictureSearch.status === 200) {
					let filter
					if (Object.keys(match).length > 0) {
						filter = filterSearch(pictureSearch.data?.results, match)
					} else {
						filter = pictureSearch.data?.results
					}

					let response = { items: filter, count: pictureSearch.data?.total }

					this.responserService = {
						result: response,
						error: '',
						message: 'Consulta exitosa',
						status: pictureSearch.status,
					}
				} else {
					this.responserService = {
						result: [],
						error: 'No se pudo obtener los datos',
						message: 'No se pudo obtener los datos',
						status: 500,
					}
				}

				if (this.responserService.status === undefined) {
					this.responserService = { result: 'Nop', message: 'No se pudo realizar la consulta', error: 'Al match le falta alguno de los valos: match id o estar vacío', status: 500 }
					reject(this.responserService)
				}
				resolve(this.responserService)
			} catch (error) {
				this.responserService = { result: 'Nop', message: 'No se pudo realizar la consulta', error: 'Al match le falta alguno de los valos: match id o estar vacío', status: 500 }
				reject(this.responserService)
			}
		})
	}

	public async getById(id: string, model: Model<Document, {}>, userModel: Model<Document, {}>): Promise<Responseable> {
		throw new Error('Método no implementado ')
	}
}
