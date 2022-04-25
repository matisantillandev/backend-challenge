import * as multer from 'multer'

export default interface GeteablePropertyStorage {
	getPropertyStorage(): multer.StorageEngine
}
