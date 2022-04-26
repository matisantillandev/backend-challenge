import { model as entity } from '@Domain/Entities/Entity/Model'
import { model as user } from '@Domain/Entities/User/Model'
import Logueable from '@Domain/Entities/User/Ports/Logueable'
// newimport

const UserLogin: Logueable = {
	email: '',
	password: '',
}
const swagger: any = {
	swaggerOptions: {
		swaggerDefinition: {
			info: {
				title: 'API Backend Challenge',
				description: 'API developed like an challenge presented by Aluxion.',
				contact: [
					{
						name: '@matisantillan11',
					},
				],
				servers: [`http://localhost:${process.env.PORT}`],
			},

			paths: {
				'/auth/login/{db}': {
					post: {
						tags: ['Authentication'],
						summary: 'Autheticate your user and get a token for authorice and use the API.',
						parameters: [
							{
								name: 'db',
								in: 'path',
								description: 'Database where API must connect ',
								required: true,
								schema: {
									type: 'string',
								},
							},
						],
						responses: {
							'200': {
								description: 'OK',
								schema: {
									$ref: '#/definitions/Login',
								},
							},
						},
					},
				},
				'/auth/register/{db}': {
					post: {
						tags: ['Authentication'],
						summary: 'Create a new user on the system.',
						parameters: [
							{
								name: 'db',
								in: 'path',
								description: 'Database where API must connect ',
								required: true,
								schema: {
									type: 'string',
								},
							},
						],
						responses: {
							'200': {
								description: 'OK',
								schema: {
									$ref: '#/definitions/Users',
								},
							},
						},
					},
				},
				'/auth/reset/{db}/{userEmail}': {
					post: {
						tags: ['Authentication'],
						summary: 'If users forgot their password, can equest reset password here..',
						parameters: [
							{
								name: 'db',
								in: 'path',
								description: 'Database where API must connect ',
								required: true,
								schema: {
									type: 'string',
								},
							},
							{
								name: 'userEmail',
								in: 'path',
								description: 'Email of the user to recover password',
								required: true,
								schema: {
									type: 'string',
								},
							},
						],
						responses: {
							'200': {
								description: 'OK',
								schema: {
									$ref: '#/definitions/Reset',
								},
							},
						},
					},
				},
				'/user': {
					get: {
						tags: ['Users'],
						summary: 'Get all users in system',
						responses: {
							'200': {
								description: 'OK',
								schema: {
									$ref: '#/definitions/Users',
								},
							},
						},
					},
					post: {
						tags: ['Users'],
						summary: 'Create a new user on the system. Require authentication',
						responses: {
							'200': {
								description: 'OK',
								schema: {
									$ref: '#/definitions/Users',
								},
							},
						},
					},
				},
				'/user/{id}': {
					put: {
						tags: ['Users'],
						summary: 'Update an existent user on the system. Require authentication',
						parameters: [
							{
								name: 'id',
								in: 'path',
								description: 'ID of USER that needs to be updated ',
								required: true,
								schema: {
									type: 'string',
								},
							},
						],
						responses: {
							'200': {
								description: 'OK',
								schema: {
									$ref: '#/definitions/Users',
								},
							},
						},
					},
					delete: {
						tags: ['Users'],
						summary: "Delete an existing user in the system. Removed is logical not physical, that means operationType is updated to 'D'. Require authentication",
						parameters: [
							{
								name: 'id',
								in: 'path',
								description: 'ID of USER that needs to be deleted ',
								required: true,
								schema: {
									type: 'string',
								},
							},
						],
						responses: {
							'200': {
								description: 'OK',
								schema: {
									$ref: '#/definitions/Users',
								},
							},
						},
					},
				},
				'/file': {
					get: {
						tags: ['File'],
						summary: 'Get all files stored on AWS S3 service. Require authentication',
						responses: {
							'200': {
								description: 'OK',
								/* schema: {
									$ref: '#/definitions/File',
								}, */
							},
						},
					},
				},
				'/file/aws/{fileName}': {
					get: {
						tags: ['File'],
						summary: 'Get an image on AWS S3 Service by name. Must include the extension. Require authentication',
						parameters: [
							{
								name: 'fileName',
								in: 'path',
								description: 'Name of the file to search. Must include the extension. Require authentication',
								required: true,
								schema: {
									type: 'string',
								},
							},
						],
						responses: {
							'200': {
								description: 'OK',
								schema: {
									$ref: '#/definitions/Users',
								},
							},
						},
					},
				},
				'/file/aws': {
					post: {
						tags: ['File'],
						summary: 'Save a file on AWS S3 service. Require authentication',
						responses: {
							'200': {
								description: 'OK',
								schema: {
									result: { type: String, typed: 'string' },
									message: { type: String, typed: 'string' },
									error: { type: String, typed: 'string' },
									status: { type: Number, typed: 'number' },
								},
							},
						},
					},
				},
				'/file/aws/{fileName}/{newName}': {
					put: {
						tags: ['File'],
						summary: 'Update an existent image name on AWS S3 Service. Require authentication',
						parameters: [
							{
								name: 'fileName',
								in: 'path',
								description: 'Actual name of the file to update. Must include the extension. Require authentication',
								required: true,
								schema: {
									type: 'string',
								},
							},
							{
								name: 'fileName',
								in: 'path',
								description: 'New name that the file will have. Must include the extension. Require authentication',
								required: true,
								schema: {
									type: 'string',
								},
							},
						],
						responses: {
							'200': {
								description: 'OK',
								schema: {
									result: { type: String, typed: 'string' },
									message: { type: String, typed: 'string' },
									error: { type: String, typed: 'string' },
									status: { type: Number, typed: 'number' },
								},
							},
						},
					},
				},
				// newpath
			},
			definitions: {
				User: {
					properties: user,
				},
				Users: {
					type: 'array',
					$ref: '#/definitions/User',
				},
				Authentication: {
					properties: { email: { type: String, typed: 'string' }, password: { type: String, typed: 'string' } },
				},
				Login: {
					type: 'array',
					$ref: '#/definitions/Authentication',
				},
				Reset: {
					properties: { newPassword: { type: String, typed: 'string' } },
				},
				File: {},
				// newdefinitions
			},
		},
		apis: ['./src/Presentation/Controllers/*/Controller.ts'],
	},
}

export default swagger
