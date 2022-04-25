import { IsDefined, IsEmail, IsString, MinLength, ValidateIf } from 'class-validator'
import { injectable } from 'inversify'

import Validable from '@Domain/Entities/Util/Ports/Validable';
import Registrable from '@Domain/Entities/User/Ports/Registrable';

@injectable()
export default class Dto implements Validable, Registrable {

  @IsDefined()
	@ValidateIf(o => o.email !== undefined)
	@IsEmail()
	@IsString()
  public email: string;

  @IsDefined()
	@ValidateIf(o => o.password !== undefined)
	@MinLength(6)
	@IsString()
  public password: string;
}
