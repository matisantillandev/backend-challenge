import Interface from '@Domain/Entities/Util/Ports/Dtoable'
import { injectable } from 'inversify'



@injectable()
class DtoUtil implements Interface {
	
	public _id: string
	public creationDate: Date
	public operationType: string
	public updateDate: Date
	public observation: string

}

export default DtoUtil
