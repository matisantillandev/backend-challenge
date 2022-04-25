import * as multer from 'multer'
import * as multerS3 from 'multer-s3'
import * as aws from 'aws-sdk'
import * as fs from 'fs'
import { injectable } from 'inversify'
import { v4 as uuidv4 } from 'uuid'

import GeteableCompanyStorage from '../Ports/GeteableCompanyStorage'
import GeteableAgreementStorage from '../Ports/GeteableAgreementStorage'
import GeteablePropertyStorage from '../Ports/GeteablePropertyStorage'
import GeteableClaimStorage from '../Ports/GeteableClaimStorage'
import GeteableAwsStorage from '../Ports/GeteableAwsStorage'
import RequestWithUser from '../../Ports/RequestWithUser'
import * as moment from 'moment'

const path = require('path')

@injectable()
export default class Storage implements GeteableAgreementStorage, GeteableCompanyStorage, GeteablePropertyStorage, GeteableClaimStorage, GeteableAwsStorage {
	public getAwsStorage(): multer.StorageEngine {
		const credentials = new aws.SharedIniFileCredentials({ profile: process.env.AWS_PROFILE })
		console.log(credentials)
		aws.config.credentials = credentials

		aws.config.getCredentials(function (err) {
			if (err) console.log(err.stack)
			// credentials not loaded
			else {
				console.log('Access key:', aws.config.credentials.accessKeyId)
			}
		})

		aws.config.update({ region: process.env.AWS_REGION })

		const s3 = new aws.S3({ apiVersion: '2006-03-01' })

		try {
			var storage = multerS3({
				s3: s3,
				bucket: process.env.AWS_BUCKET,
				metadata: function (req, file, cb) {
					cb(null, { fieldName: file.fieldname })
				},
				key: function (req, file, cb) {
					const name: string = moment().format('YYYY-MM-DDTHH:mm:ssZ').toString() + '-' + file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
					console.log(name)
					cb(null, name)
				},
			})
		} catch (e) {
			console.log(e)
		}

		return storage
	}

	public getAgreementStorage(): multer.StorageEngine {
		const plataform: string = process.platform
		let path: string = ''

		if (plataform === 'linux') {
			path = '/home/some'
		} else {
			if (plataform === 'win32') {
				path = 'C:/temp/some'
			} else {
				console.log('Unrecognized platform. Files cannot be stored.')
			}
		}

		const storage = multer.diskStorage({
			destination: function (req: RequestWithUser, file, cb) {
				if (plataform === 'linux') {
					path = '/home/clients'
				} else {
					if (plataform === 'win32') {
						path = 'C:/temp/clients'
					} else {
						console.log('Unrecognized platform. Files cannot be stored.')
					}
				}

				if (req.database) {
					path = path + '/' + req.database + '/agreement'
					if (req.params.id) {
						path = path + '/' + req.params.id
					}
				}

				fs.mkdirSync(path, { recursive: true })
				cb(null, path)
			},
			filename: function (req, file, cb) {
				//normalize picture name
				const name: string = moment().format('YYYY-MM-DDTHH').toString() + '-' + file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

				cb(null, name)
			},
		})

		return storage
	}

	public getCompanyStorage(): multer.StorageEngine {
		var plataform: string = process.platform
		var pathA: string = ''

		if (plataform === 'linux') {
			pathA = path.join(__dirname, './../../../../uploads')
		} else {
			if (plataform === 'win32') {
				pathA = path.join(__dirname, './../../../../uploads')
			} else {
				console.log('Unrecognized platform. Files cannot be stored.')
			}
		}

		try {
			var storage = multer.diskStorage({
				destination: (req: RequestWithUser, file, cb) => {
					if (plataform === 'linux') {
						pathA = path.join(__dirname, './../../../../uploads')
					} else {
						if (plataform === 'win32') {
							pathA = path.join(__dirname, './../../../../uploads')
						} else {
							console.log('Unrecognized platform. Files cannot be stored.')
						}
					}

					fs.mkdirSync(pathA, { recursive: true })
					cb(null, pathA)
				},
				filename: (req, file, cb) => {
					var name: string = uuidv4()

					if (file.originalname === 'blob') {
						name = name
					}

					cb(null, name)
				},
			})
		} catch (e) {
			console.log(e)
		}

		return storage
	}

	public getPropertyStorage(): multer.StorageEngine {
		var plataform: string = process.platform
		var path: string = ''

		if (plataform === 'linux') {
			path = '/home/some'
		} else {
			if (plataform === 'win32') {
				path = 'C:/temp/some'
			} else {
				console.log('Unrecognized platform. Files cannot be stored.')
			}
		}

		var storage = multer.diskStorage({
			destination: function (req: RequestWithUser, file, cb) {
				if (plataform === 'linux') {
					path = '/home/clients'
				} else {
					if (plataform === 'win32') {
						path = 'C:/temp/clients'
					} else {
						console.log('Unrecognized platform. Files cannot be stored.')
					}
				}

				if (req.database) {
					path = path + '/' + req.database + '/property'
					if (req.params.id) {
						path = path + '/' + req.params.id
					}
				}

				fs.mkdirSync(path, { recursive: true })
				cb(null, path)
			},
			filename: function (req, file, cb) {
				var name: string = moment().format('YYYY-MM-DDTHH').toString() + '-' + file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

				cb(null, name)
			},
		})

		return storage
	}

	public getClaimStorage(): multer.StorageEngine {
		var plataform: string = process.platform
		var path: string = ''

		if (plataform === 'linux') {
			path = '/home/some'
		} else {
			if (plataform === 'win32') {
				path = 'C:/temp/some'
			} else {
				console.log('Se intento uploadear un file in Claim, y...')
				console.log('Unrecognized platform. Files cannot be stored.')
			}
		}

		var storage = multer.diskStorage({
			destination: function (req: RequestWithUser, file, cb) {
				if (plataform === 'linux') {
					path = '/home/clients'
				} else {
					if (plataform === 'win32') {
						path = 'C:/temp/clients'
					} else {
						console.log('Se intento uploadear un file in Claim, y...')
						console.log('Unrecognized platform. Files cannot be stored.')
					}
				}

				if (req.database) {
					path = path + '/' + req.database + '/claim'
				}

				fs.mkdirSync(path, { recursive: true })
				cb(null, path)
			},
			filename: function (req, file, cb) {
				var name: string = moment().format('YYYY-MM-DDTHH').toString() + '-' + file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

				cb(null, name)
			},
		})

		return storage
	}

	public getTransactionStorage(): multer.StorageEngine {
		var plataform: string = process.platform
		var path: string = ''

		if (plataform === 'linux') {
			path = '/home/some'
		} else {
			if (plataform === 'win32') {
				path = 'C:/temp/some'
			} else {
				console.log('Unrecognized platform. Files cannot be stored.')
			}
		}

		var storage = multer.diskStorage({
			destination: function (req: RequestWithUser, file, cb) {
				if (plataform === 'linux') {
					path = '/home/clients'
				} else {
					if (plataform === 'win32') {
						path = 'C:/temp/clients'
					} else {
						console.log('Unrecognized platform. Files cannot be stored.')
					}
				}

				if (req.database) {
					path = path + '/' + req.database + '/transaction'
					if (req.params.folder) {
						path = path + '/' + req.params.folder
					}
				}

				fs.mkdirSync(path, { recursive: true })
				cb(null, path)
			},
			filename: function (req, file, cb) {
				// var name: string = moment().format('YYYY-MM-DDTHH').toString() + '-' + file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
				var name: string = req.params.name

				cb(null, name)
			},
		})

		return storage
	}
}
