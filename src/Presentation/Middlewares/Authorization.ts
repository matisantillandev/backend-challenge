import { NextFunction, Response } from 'express'
import { Model, Document} from 'mongoose'
import { inject, injectable} from 'inversify';

import TYPES from '@src/TYPES';

import UserInterface from '@Domain/Entities/User/Interface';
import RequestWithUser from '@Presentation/Ports/RequestWithUser'

import Controlleable from '@Domain/Entities/Util/Ports/Controlleable'
import Serviceable from '@Domain/Entities/Permission/Ports/Serviceable';

import Schemable from '@Domain/Entities/Util/Model'
import User from '@Domain/Entities/User/Model'
import Rol from '@Domain/Entities/Rol/Model'
import Permission from '@Domain/Entities/Permission/Model'

import ConnectionProvider from '@Infrastructure/Persistence/ConnectionProvider'

import Responser from '@Presentation/Controllers/Util/Responser'

import ControllerService from '@Domain/Entities/Util/Controller'
import Authorizeable from './Ports/Authorizeable';

@injectable()
export default class Authorization implements Authorizeable {


  @inject(TYPES.PermissionServiceableDomain) private permissionService: Serviceable

  async authorice(request: RequestWithUser, response: Response<any, Record<string, any>>, next: NextFunction): Promise<void> {
    let responserService = new Responser()
    let nextBool: boolean

    if(request.database && request.user){
      
      const database = request.database
      const user: UserInterface = request?.user
      const rol = user.rol
      const userId = user._id

      const userSchema: Schemable = new User()
      const rolSchema: Schemable = new Rol()
			const permissionSchema: Schemable = new Permission()

      let userModel: Model<Document, {}> = await new ConnectionProvider().getModel(database, userSchema.name, userSchema)
      let rolModel: Model<Document, {}> = await new ConnectionProvider().getModel(database, rolSchema.name, rolSchema)
      let permissionModel: Model<Document, {}> = await new ConnectionProvider().getModel(database, permissionSchema.name, permissionSchema)

      let controllerService: Controlleable = new ControllerService()


      //GET Rol
      let limit = 1
      let skip = 0
      let match = {
        _id: {$oid: rol }
      }

      let aggregations = {
        match,
        limit,
        skip
      }
      
      const rolResponse = await controllerService.getAll(rolModel, aggregations)
      /* const permissionResponse = await this.permissionService.getByUser(userModel, userModel, '615b18891327a6f9eb5b7e0d') */

     
      if(Object.entries(rolResponse.result).length > 0){
        
        request["authoriced"] = true
        request["userPermission"] = rolResponse?.result?.permission
        nextBool = true

        next()

      } else {
        responserService.res = {
          result: rolResponse.result,
          message: "No tienes autorización para realizar la acción.",
          error: "Sin permisos",
          status: rolResponse.status
        }
      }


    } else {
      responserService.res = {
				result: [],
				message: 'No tienes autorización para realizar la acción.',
				error: 'Sin permisos necesarios',
				status: 401
			}      
    }   
    
    if(!nextBool) {
			response.status(responserService.res.status).send(responserService.res)
		}
    
  }
	
	
}
