import * as multer from 'multer'

export default interface GeteableAgreementStorage {
	getAgreementStorage(): multer.StorageEngine
}
