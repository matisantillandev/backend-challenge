import * as multer from 'multer'

export default interface GeteableClaimStorage {
	getClaimStorage(): multer.StorageEngine
}
