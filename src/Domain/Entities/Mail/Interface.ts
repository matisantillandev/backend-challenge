import InterfaceUtil from '@Domain/Entities/Util/Ports/Dtoable'

export default interface Interface extends InterfaceUtil {
	
	name: string
	from: string
	pass: string
	enabled: string
}
