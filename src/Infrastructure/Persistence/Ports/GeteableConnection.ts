import DBConnection from '@Infrastructure/Persistence/DBConnection'

export default interface GeteableConnection {
	getConnection(
		database?: string,
	): DBConnection
}
