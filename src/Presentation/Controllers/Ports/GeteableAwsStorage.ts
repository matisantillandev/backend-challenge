import { String } from 'aws-sdk/clients/acm'
import * as multer from 'multer'

export default interface GeteableAwsStorage {
	getAwsStorage(): multer.StorageEngine
	getAwsImage(filename: String): string
}
