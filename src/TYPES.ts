import user from '@Presentation/Controllers/User/types'
import mail from '@Presentation/Controllers/Mail/types'
import file from '@Presentation/Controllers/File/types'
import unsplash from '@Presentation/Controllers/Unsplash/types'
import entity from '@Presentation/Controllers/Entity/types'

let returnEntities: any = {}
const jsonConcat = (o1: any, o2: any) => {
	for (var key in o2) {
		o1[key] = o2[key]
	}
	return o1
}

returnEntities = jsonConcat(returnEntities, user)
returnEntities = jsonConcat(returnEntities, mail)
returnEntities = jsonConcat(returnEntities, file)
returnEntities = jsonConcat(returnEntities, entity)
returnEntities = jsonConcat(returnEntities, unsplash)

let TYPES = {
	SendeableMail: Symbol.for('SendeableMail'),
	Routeable: Symbol.for('Routeable'),
	Responseable: Symbol.for('Responseable'),
	Appeable: Symbol.for('Appeable'),
	Express: Symbol.for('Express'),
	Expressable: Symbol.for('Expressable'),
	Schemable: Symbol.for('Schemable'),
	ConnectionableProvider: Symbol.for('ConnectionableProvider'),
	GeteableModel: Symbol.for('GeteableModel'),
	Authenticateable: Symbol.for('Authenticateable'),
	Validateable: Symbol.for('Validateable'),
	Router: Symbol.for('Router'),
	Validable: Symbol.for('Validable'),
	ResponseableDomain: Symbol.for('ResponseableDomain'),
	Authenticable: Symbol.for('Authenticable'),
	Authorizeable: Symbol.for('Authorizeable'),
	CreateableToken: Symbol.for('CreateableToken'),
	Modelable: Symbol.for('Modelable'),

	Controlleable: Symbol.for('Controlleable'),
	Updateable: Symbol.for('Updateable'),
	Saveable: Symbol.for('Saveable'),
	GeteableAll: Symbol.for('GeteableAll'),
	Searcheable: Symbol.for('Searcheable'),

	Login: Symbol.for('Login'),
	User: Symbol.for('User'),
	Types: Symbol.for('Types'),

	UserInterface: Symbol.for('UserInterface'),

	UserServiceableDomain: Symbol.for('UserServiceableDomain'),

	Permission: Symbol.for('Permission'),
	PermissionInterface: Symbol.for('PermissionInterface'),
	PermissionServiceableDomain: Symbol.for('PermissionServiceableDomain'),

	Rol: Symbol.for('Rol'),
	RolInterface: Symbol.for('RolInterface'),
	RolServiceableDomain: Symbol.for('RolServiceableDomain'),

	Mail: Symbol.for('Mail'),
	MailInterface: Symbol.for('MailInterface'),
	MailServiceableDomain: Symbol.for('MailServiceableDomain'),

	GeteableCompanyStorage: Symbol.for('GeteableCompanyStorage'),
	GeteableAwsStorage: Symbol.for('GeteableAwsStorage'),
}

returnEntities = jsonConcat(returnEntities, TYPES)

export default returnEntities
