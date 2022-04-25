import * as multer from 'multer'

export default interface GeteableCompanyStorage {
	getCompanyStorage(): multer.StorageEngine
}
