import { ReadObjFromFile } from './fileHandler.js';
async function Main() {
  const meta = await ReadObjFromFile('./built/MetaDatas/0.json');
  const conversions = await ReadObjFromFile('./conversionsData.json');
  const traitsToChoose = {};
  const selectedAttribs = {};
  for (let i = 0; i < meta.attributes.length; i++) {
    const attrib = meta.attributes[i];
    selectedAttribs[attrib.trait_type] = attrib.value;
  }
  // console.log(selectedAttribs);
  // console.log(conversions);
  Object.keys(selectedAttribs).forEach((categoryName) => {
    for (let i = 0; i < Object.keys(conversions).length; i++) {
      const conversionCat = Object.keys(conversions)[i];
      var convertedCategoryName = makeConvertedString(conversionCat);
      if (categoryName === convertedCategoryName) {
        // console.log(convertedCategoryName);
        // console.log(conversions[conversionCat]);
        var thisCatConversions = conversions[conversionCat];
        for (let j = 0; j < thisCatConversions.length; j++) {
          const traitConversionString = thisCatConversions[j];
          const convertedTraitFrom = makeConvertedString(
            traitConversionString,
            true
          );
          const convertedTraitTo = makeConvertedString(
            traitConversionString,
            false
          );
          if (convertedTraitFrom === selectedAttribs[convertedCategoryName])
            traitsToChoose[convertedCategoryName] = convertedTraitTo;
        }
        break;
      }
    }
  });
  console.log(traitsToChoose);
}
const makeConvertedString = (conversionString, returnA = true) => {
  if (returnA) return conversionString.replace(/(.*)=>.*/, '$1');
  else return conversionString.replace(/.*=>(.*)/, '$1');
};
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
