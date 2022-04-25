scripts=$PWD
domain='../src/Domain/Entities'
presentation='../src/Presentation/Controllers'
source='../src'

nameMinus=$1
nameMayus=${1^}

cd $domain

rm -r $nameMayus

cd $scripts
cd $presentation

rm -r $nameMayus

cd $scripts

cd ../src

container='Container'
nameMayusContainer=$nameMayus$container
echo $nameMayusContainer


sed -i "/import ${nameMayusContainer} from '@Presentation\/Controllers\/${nameMayus}\/inversify'/d" inversify.config.ts
sed -i "/containerReturn = Container.merge(containerReturn, $nameMayusContainer)/d" inversify.config.ts

sed -i "/import ${nameMinus} from '@Presentation\/Controllers\/${nameMayus}\/types'/d" TYPES.ts
sed -i "/returnEntities = jsonConcat(returnEntities, $nameMinus);/d" TYPES.ts

echo 'rollback successfully'
