import { model as entity } from '@Domain/Entities/Entity/Model'
import { model as user } from '@Domain/Entities/User/Model'
// newimport

const swagger: any = {
  swaggerOptions: {
    swaggerDefinition: {
      info: {
        title: "API Base",
        description: "API developed like base of all projects",
        contact: [
          {
            name: "@matisantillan11"
          },
        ],
        servers: [`http://localhost:${process.env.PORT}`]
      },

      "paths": {
        "/entity/withauth/{db}": {
          "get": {
            "parameters": {
              "in": "path",
              "name": "db",
              "schema": {
                "type": "string"

              },
              "required": "true"
            },
            "tags": ["Entities"],
            "summary": "Get all entities in system. Doesn't require authentication",
            "responses": {
              "200": {
                "description": "OK",
                "schema": {
                  "$ref": "#/definitions/Entities"
                }
              }
            }
          }
        },
        "/entity": {
          "get": {
            "tags": ["Entities"],
            "summary": "Get all entities in system. Require authentication",
            "responses": {
              "200": {
                "description": "OK",
                "schema": {
                  "$ref": "#/definitions/Entities"
                }
              }
            }
          },
          "post": {
            "tags": ["Entities"],
            "summary": "Create a new entity on the system. Require authentication",
            "responses": {
              "200": {
                "description": "OK",
                "schema": {
                  "$ref": "#/definitions/Entities"
                }
              }
            }
          }
        },
        "/entity/{id}": {
          "put": {
            "tags": ["Entities"],
            "summary": "Update an existent entity on the system. Require authentication",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "description": "ID of ENTITY that needs to be updated ",
                "required": true,
                "schema": {
                  "type": "string"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "schema": {
                  "$ref": "#/definitions/Entities"
                }
              }
            }
          },
          "delete": {
            "tags": ["Entities"],
            "summary": "Delete an existing entity in the system. Removed is logical not physical, that means operationType is updated to 'D'. Require authentication",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "description": "ID of ENTITY that needs to be deleted ",
                "required": true,
                "schema": {
                  "type": "string"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "schema": {
                  "$ref": "#/definitions/Entities"
                }
              }
            }
          }
        },
        "/user": {
          "get": {
            "tags": ["Users"],
            "summary": "Get all users in system",
            "responses": {
              "200": {
                "description": "OK",
                "schema": {
                  "$ref": "#/definitions/Users"
                }
              }
            }
          },
          "post": {
            "tags": ["Users"],
            "summary": "Create a new user on the system. Require authentication",
            "responses": {
              "200": {
                "description": "OK",
                "schema": {
                  "$ref": "#/definitions/Users"
                }
              }
            }
          }
        },
        "/user/{id}": {
          "put": {
            "tags": ["Users"],
            "summary": "Update an existent user on the system. Require authentication",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "description": "ID of USER that needs to be updated ",
                "required": true,
                "schema": {
                  "type": "string"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "schema": {
                  "$ref": "#/definitions/Users"
                }
              }
            }
          },
          "delete": {
            "tags": ["Users"],
            "summary": "Delete an existing user in the system. Removed is logical not physical, that means operationType is updated to 'D'. Require authentication",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "description": "ID of USER that needs to be deleted ",
                "required": true,
                "schema": {
                  "type": "string"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "OK",
                "schema": {
                  "$ref": "#/definitions/Users"
                }
              }
            }
          }
        },
        // newpath
      },
      "definitions": {
        "Entity": {
          "properties": entity
        },
        "Entities": {
          "type": "array",
          "$ref": "#/definitions/Entity"
        },
        "User": {
          "properties": user
        },
        "Users": {
          "type": "array",
          "$ref": "#/definitions/User"
        },
        // newdefinitions
      }
    },
    apis: ["./src/Presentation/Controllers/*/Controller.ts"],

  },

}

export default swagger
