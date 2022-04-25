import Saveable from './Saveable'
import GeteableAll from './GeteableAll'
import Updateable from './Updateable'
import GeteableByUser from './GeteableByUser';

export default interface Serviceable extends
	Saveable,
	GeteableAll,
	GeteableByUser,
	Updateable {}
