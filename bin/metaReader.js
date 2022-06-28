import { ReadObjFromFile } from './fileHandler.js';
async function Main() {
  const read = await ReadObjFromFile('./built/MetaDatas/0.json');
  const obj = {};
  for (let i = 0; i < read.attributes.length; i++) {
    const attrib = read.attributes[i];
    obj[attrib.trait_type] = attrib.value;
  }
  console.log(obj);
}

Main();
// Have a conversion dictionary to set each coresponding trait in the later evolution stage
// {
//   'Background=>BG':
//    [
//    'Forest=>forestPrime',
//    'Snowy=>snowyPrime',
//      .
//      .
//      .
//    ],
//    'Body':
//    [
//    .
//    .
//    .
//    ]
// }
// then read the created meta data for the generated nft
// and check if the selected trait_Type exists in our conversion dictionary.keys,
//  then => check its value if it exists in the coresponding dictionary collection
// then look for the set value, otherwise randomly select one.
