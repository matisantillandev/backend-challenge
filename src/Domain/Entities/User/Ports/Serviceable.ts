import Saveable from './Saveable'
import GeteableAll from './GeteableAll'
import Updateable from './Updateable'
import ExisteableWithEmail from './ExisteableWithEmail';
import HashablePassword from './HasheablePassword';
import GeteableUserByEmail from './GeteableByEmail';
import IsableEnable from './IsableEnable';
import IsableMatch from './IsableMatch';

export default interface Serviceable extends
	Saveable,
	GeteableAll,
	GeteableUserByEmail,
	ExisteableWithEmail,
	IsableEnable,
	IsableMatch,
	HashablePassword,
	Updateable {}
