


const destination = "built/";
const baseImgAddress = "./Traits/02-Body/01-Back/General.png";
const overlayImgAddress = "./Traits/02-Body/02-SkinPatterns/BrightReptile_Screen.png";




// const readJimpImg = (address) =>
//   Jimp.read(address)
//     .then((image) => image)
//     .catch((err) => {
//       console.error(err);
//     });

// const parseJimpBlendingMode = (Hierarchy) => {
//   var blendingModeName = Hierarchy.blendingMode.toLowerCase();
//   var JimpBlendingMode;
//   switch (blendingModeName) {
//     case "normal":
//       JimpBlendingMode = Jimp.BLEND_SOURCE_OVER;
//       break;
//     case "multiply":
//       JimpBlendingMode = Jimp.BLEND_MULTIPLY;
//       break;
//     case "add":
//       JimpBlendingMode = Jimp.BLEND_ADD;
//       break;
//     case "screen":
//       JimpBlendingMode = Jimp.BLEND_SCREEN;
//       break;
//     case "overlay":
//       JimpBlendingMode = Jimp.BLEND_OVERLAY;
//       break;
//     case "darken":
//       JimpBlendingMode = Jimp.BLEND_DARKEN;
//       break;
//     case "lighten":
//       JimpBlendingMode = Jimp.BLEND_LIGHTEN;
//       break;
//     case "hardlight":
//       JimpBlendingMode = Jimp.BLEND_HARDLIGHT;
//       break;
//     case "difference":
//       JimpBlendingMode = Jimp.BLEND_DIFFERENCE;
//       break;
//     case "exclusion":
//       JimpBlendingMode = Jimp.BLEND_EXCLUSION;
//       break;
//     default:
//       JimpBlendingMode = Jimp.BLEND_SOURCE_OVER;
//       break;
//   }
//   return JimpBlendingMode;
// };

// const compositeProbs = async (AllImagesTraits = [], size) => {
//   for (const singleImgTraits of AllImagesTraits) {
//     var loadedJimpsArray = [];
//     var loadedJimpsBlendingMs = [];
//     for (const Hierarchy of singleImgTraits) {
//       const jimpImg = await readJimpImg(Hierarchy.address);
//       if (Hierarchy.hueVariant.hue) {
//         var colorName = Hierarchy.hueVariant.colorName;
//         var hueAmount = parseInt(Hierarchy.hueVariant.hue);
//         console.log('coloring "' + Hierarchy.address + '" => ' + colorName);
//         await jimpImg.color([{ apply: "hue", params: [hueAmount] }]);
//         console.log("Done");
//       }
//       loadedJimpsArray.push(jimpImg);
//       loadedJimpsBlendingMs.push(parseJimpBlendingMode(Hierarchy));
//     }
//     var finalJimp = new Jimp(size, size);
//     for (let index = 0; index < loadedJimpsArray.length; index++) {
//       const jimpImg = loadedJimpsArray[index];
//       const blendingMode = loadedJimpsBlendingMs[index];
//       finalJimp = await finalJimp
//         .resize(size, size)
//         .composite(jimpImg, 0, 0, { mode: blendingMode })
//         .quality(100);
//     }
//     await finalJimp.write(destination + "builtImage_" + Date.now() + ".jpg");
//     // console.log(singleImgTraits);
//   }
// };

// export const compose = async (AllImagesTraits, size) => {
//   const img = await compositeProbs(AllImagesTraits, size);
// };

export const compose = async () => {
  try {


  } catch (err) {
    console.log(err);
  }
};

compose();
