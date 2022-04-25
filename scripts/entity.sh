RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

Entities="../src/Domain/Entities"
Controllers="../src/Presentation/Controllers"
scripts=$PWD

nameMinus=$1
nameMayus=${1^}

echo -e "${YELLOW}Loading entity lower case: ${GREEN}$nameMinus"
echo -e "${YELLOW}Loading entity upper case: ${GREEN}$nameMayus"

cd $Entities
mkdir $nameMayus
cp -a "./Entity/." "./${nameMayus}/"
cd $nameMayus
sed -i "s/entityname/${nameMinus}/g" Model.ts

cd $scripts

cd $Controllers
mkdir $nameMayus
cp -a "./Entity/." "./${nameMayus}/"

cd $nameMayus
sed -i "s/entity/${nameMinus}/g" Controller.ts
sed -i "s/Entity/${nameMayus}/g" Controller.ts
sed -i "s/Entity/${nameMayus}/g" types.ts
sed -i "s/Entity/${nameMayus}/g" inversify.ts

cd $scripts
cd ../src
sed -i "s+import entity from '@Presentation/Controllers/Entity/types'+import ${nameMinus} from '@Presentation/Controllers/${nameMayus}/types'\nimport entity from '@Presentation/Controllers/Entity/types'+g" TYPES.ts
sed -i "s+returnEntities = jsonConcat(returnEntities, entity);+returnEntities = jsonConcat(returnEntities, ${nameMinus});\nreturnEntities = jsonConcat(returnEntities, entity);+g" TYPES.ts

sed -i "s+// containerimport+import ${nameMayus}Container from '@Presentation/Controllers/${nameMayus}/inversify'\n// containerimport+g" inversify.config.ts
sed -i "s+// push+containerReturn = Container.merge(containerReturn, ${nameMayus}Container)\n// push+g" inversify.config.ts
#sed -i "s+import { model as entity } from '@Domain/Entities/Entity/Model'+import { model as ${nameMinus} } from '@Domain/Entities/${nameMayus}/Model'\nimport { model as entity } from '@Domain/Entities/Entity/Model'+g" swagger.ts
#sed -i "s+// newpath+'/${nameMinus}/withauth/{db}': {\n\ŧ'get': {\n\t'parameters': {\n\ŧ'in': 'path',\n'name': 'db',\n'schema': {\n\t'type': 'string'\n},\n'required': 'true'\n},\n'tags': ['${nameMayus}\+'s''],\n'summary': 'Get all ${nameMinus}\+'s' in system. Doesnt require authentication',\n'responses': {\n\t'200': {\n\t'description': 'OK',\n'schema': {\n\t'$ref': '#/definitions/${nameMayus}\+'s''\n}\n}\n}\n}\n},\n},\n\t\t\t\t// newpath+g" swagger.ts
#sed -i "s+// newdefinitions+'${nameMayus}': {\n\t'properties': ${nameMinus}\n},\n'${nameMayus}\+'s'': {\n\t'type': 'array',\n\t'$ref': '#/definitions/${nameMayus}'\n},\n\t\t\t\t// newdefinitions+g" swagger.ts

echo -e "${YELLOW}Finished Script"