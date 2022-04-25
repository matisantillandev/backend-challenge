import { injectable } from 'inversify'

import DtoUtil from '@Domain/Entities/Util/Ports/Dto'
import Interface from './Interface'

@injectable()
export default class EntityDto extends DtoUtil implements Interface {

	public name: string
	public number: string
}
