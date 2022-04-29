# Challenge Backend

Para iniciar el proyecto por primera vez, es necesario contar con node V16 y [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#debian-stable "yarn")

Una vez contamos con Node y Yarn, procedemos a instalar las dependecias utilizando `yarn install`.

### Enviroment

```
PORT=YOUR_PORT ||  default is 3030
DB_NAME=YOUR_DB_NAME
CLUSTER=mongodb+srv://[user]:[secret]@[cluster].mongodb.net
AWS_BUCKET=YOUR_AWS_BUCKET
AWS_REGION=YOUR_AWS_REGION
AWS_PROFILE=default
EMAIL_SENDER=YOUR_EMAIL
EMAIL_SENDER_SECRET=YOUR_PASSWORD_EMAIL
UNSPLASH_ACCESS_KEY=API_KEY_UNSPLASH
```
El email debe ser GMAIL y es necesario tener activado el "acceso de aplicaciones menos seguras" en tu cuenta de gmail.
Para configurarlo debes ingresar en "gestion de tu cuenta de google", apartado de seguridad y buscar "acceso de aplicaciones menos seguras". Ingresar a dicha opción y asegurarse de que salga "activada"

Tambien es muy importante crear para la utilización de los servicios de aws, el file "credentials" en el folder ".aws" con la siguiente estructura

```
[default]
aws_access_key_id=YOUR_ACCESS_KEY_ID
aws_secret_access_key=YOUR_SECRET_ACCESS_KEY
region=YOUR_AWS_REGION
output=json
```

### Start

`yarn start:dev`
