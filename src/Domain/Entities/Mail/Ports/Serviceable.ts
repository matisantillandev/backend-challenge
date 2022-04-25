import Saveable from './Saveable'
import GeteableAll from './GeteableAll'
import Updateable from './Updateable'

export default interface Serviceable extends
	Saveable,
	GeteableAll,
	Updateable {}
