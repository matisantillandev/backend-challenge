import * as multer from 'multer'

export default interface GeteableAwsStorage {
	getAwsStorage(): multer.StorageEngine
}
