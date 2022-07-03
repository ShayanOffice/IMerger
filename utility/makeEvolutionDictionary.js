import { ReadObjFromFile, WriteObjToFile, readDir } from '../bin/fileHandler.js';
import {
  CacheDir,
  choicesDetailsDir,
  EvolutionDictionaryFileName,
} from '../config.js';

async function Main() {
  const choicesDetails = await readDir(choicesDetailsDir);
  for (const chosenTraits of choicesDetails) {
    const evolutionDictionary = await ReadObjFromFile(
      CacheDir + EvolutionDictionaryFileName
    );
    const read = await ReadObjFromFile(choicesDetailsDir + chosenTraits.name);

    const obj = evolutionDictionary ? evolutionDictionary : {};
    for (let i = 0; i < read.length; i++) {
      const address = read[i].address;
      obj[address] = address;
    }
    // console.log(obj);
    await WriteObjToFile(sortObj(obj), CacheDir + EvolutionDictionaryFileName);
  }
}

const sortObj = (obj) => {
  const arr = [];
  for (const key of Object.keys(obj)) {
    arr.push(key);
  }
  arr.sort();
  const sortedObj = {};
  for (const key of arr) {
    sortedObj[key] = key;
  }
  return sortedObj;
};

Main();
// Have a conversion dictionary to set each coresponding trait in the later evolution stage
// {
//   Background:
//    {
//    'Forest' => 'forestPrime',
//    'Snowy' => 'snowyPrime',
//      .
//      .
//      .
//    },
//    Body:
//    {
//    .
//    .
//    .
//    }
// }
// then read the created meta data for the generated nft
// and check if the selected trait_Type exists in our conversion dictionary.keys,
//  then => check its value if it exists in the coresponding dictionary collection
// then look for the set value, otherwise randomly select one.
