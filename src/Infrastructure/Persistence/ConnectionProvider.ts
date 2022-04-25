import { Model, Document, Schema, createConnection } from 'mongoose'
import { injectable } from 'inversify';
import DBConnection from "./DBConnection";
import ConnectionableProvider from './Ports/ConnectionableProvider'

@injectable()
export default class ConnectionProvider implements ConnectionableProvider {
	
	public static connections: Array<{
		database: string,
		connection: DBConnection
	}> = [];
	
	public async connect(database: string) {
		
		let connection: DBConnection;

		if (database) {

			/* connection = this.getConnection(database); */
			
			if (!connection) {
				
				console.log('Creó conexión con base de datos: ' + database);
				// const uri: string = CONFIG.MONGO_URL + database;
				const uri: string = process.env.CLUSTER + '/' + database + '?retryWrites=true&w=majority';
				
				try {
					
					connection = createConnection(uri)
					
				} catch(e) {
					throw new Error("Fail create mongose, create connection")
				}
				
				ConnectionProvider.connections.push({ database, connection });
			}
		}
	}
	
	public getConnection(database?: string): DBConnection {
		
		let connection = null;
		
		if (ConnectionProvider.connections.length > 0) {
			if(database === undefined) {
				connection = ConnectionProvider.connections[0]
			} else {
				for (const c of ConnectionProvider.connections) {
					if (c.database === database) connection = c.connection
				}
			}
		} else {
			this.connect(process.env.DB)
		}

		return connection;
	}
	
	public async getModel(
		database: string,
		name: string,
		schema: Schema<any>
	): Promise<Model<Document, {}>> {

		var model: Model<Document, {}>

		await this.connect(database)
		const connection: DBConnection = this.getConnection(database)

		try {
			model = connection.model(name);
		} catch (e) {
			model = connection.model(name, schema);
		} finally {
			return model
		}
	}
	
}
