import { String } from 'aws-sdk/clients/acm'
import * as multer from 'multer'

export default interface GeteableAwsStorage {
	getAwsStorage(): multer.StorageEngine
	getAwsImage(filename: String): string
	awsChangeFilename(actualName: string, newName: string): multer.StorageEngine
	deleteAwsImage(filename: string): multer.StorageEngine
}
