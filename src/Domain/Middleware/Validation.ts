import { plainToInstance, ClassConstructor } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'
import * as express from 'express'
import { injectable } from 'inversify';

/* import HttpException from '../../Presentation/Exceptions/HttpException' */
import Validateable from './Ports/Validateable'
import Validable from '../Entities/Util/Ports/Validable'
import Responseable from '../../Presentation/Controllers/Responseable'
import Responser from '../../Presentation/Controllers/Util/Responser'

@injectable()
export default class Validation implements Validateable {

	public responserService: Responseable;

	constructor(){
		this.responserService = new Responser
	}

	validate(type: ClassConstructor<Validable>, skip?: boolean): express.RequestHandler {

		var skipMissingProperties: boolean = false

		if(skip) skipMissingProperties = true

		return (req, res, next) => {

			if (req.body.origin === false) delete req.body.origin
			if (req.body.cashBox === false) delete req.body.cashBox
			
			validate(plainToInstance(type, req.body), { skipMissingProperties })
				.then((errors: ValidationError[]) => {
					if (errors.length > 0) {
						var message = 'Errores: '
						message = message +  errors.map(
							(error: ValidationError) => Object.values(error.constraints)
						).join(', ');
						// console.log(errors);

						this.responserService.res = {
							result: 'Nop',
							message: message,
							error: errors,
							status: 428
						}
						// console.log(this.responserService.res)
						res.status(this.responserService.res.status).send(this.responserService.res)
					} else {
						next();
					}
				}).catch((err: any) => {
					this.responserService.res = {
						result: 'Nop',
						message: 'Algo paso',
						error: err,
						status: 500
					}
					console.log('validation')
					res.status(this.responserService.res.status).send(this.responserService.res)
				});
		};
	}
	
}
