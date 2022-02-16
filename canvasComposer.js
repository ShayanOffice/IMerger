import Skia from "skia-canvas";
import { promises as fs } from "fs";
// import { Canvas } from "skia-canvas/lib";

const destination = "./built/";
const baseImgAddress = "./Traits/02-Body/01-Back/General.png";
const overlayImgAddress =
  "./Traits/02-Body/02-SkinPatterns/BrightReptile_Screen.png";

const readImg = async (address) =>
  await Skia.loadImage(address)
    .then((image) => image)
    .catch((err) => {
      console.error(err);
    });

const parseCanvasBlendingMode = (Hierarchy) => {
  var blendingModeName = Hierarchy.blendingMode.toLowerCase();
  var BlendingMode;
  switch (blendingModeName) {
    case "normal":
      BlendingMode = "source-over";
      break;
    case "multiply":
      BlendingMode = "multiply";
      break;
    case "screen":
      BlendingMode = "screen";
      break;
    case "overlay":
      BlendingMode = "overlay";
      break;
    case "darken":
      BlendingMode = "darken";
      break;
    case "lighten":
      BlendingMode = "lighten";
      break;
    case "hardlight":
      BlendingMode = "hard-light";
      break;
    case "difference":
      BlendingMode = "difference";
      break;
    case "exclusion":
      BlendingMode = "exclusion";
      break;
    default:
      BlendingMode = "source-over";
      break;
  }
  return BlendingMode;
};

const compositeProbs = async (AllImagesTraits = [], size) => {
  for (const singleImgTraits of AllImagesTraits) {
    var loadedImgsArray = [];
    var loadedBlendingMs = [];
    var loadedHueShiftobjs = [];
    for (const Hierarchy of singleImgTraits) {
      const Img = await readImg(Hierarchy.address);
      
      loadedImgsArray.push(Img);
      loadedBlendingMs.push(parseCanvasBlendingMode(Hierarchy));
      loadedHueShiftobjs.push(Hierarchy.hueVariant);
    }
    let canvas = new Skia.Canvas(size, size);
    let ctx = canvas.getContext("2d");

    for (let index = 0; index < loadedImgsArray.length; index++) {
      const Img = loadedImgsArray[index];
      const blendingMode = loadedBlendingMs[index];
      const hueShiftObj = loadedHueShiftobjs[index];
      ctx.filter = `hue-rotate(0deg)`;
      if (hueShiftObj.hue) {
        var colorName = hueShiftObj.colorName;
        var hueAmount = -parseInt(hueShiftObj.hue);
        // console.log('coloring "' + Hierarchy.address + '" => ' + colorName);
        ctx.filter = `hue-rotate(${hueAmount}deg)`;
        // console.log("Done");
      }
      ctx.globalCompositeOperation = blendingMode;
      ctx.drawImage(Img, 0, 0, size, size);
    }
    const buff = await canvas.toBuffer("image/png");
    await fs.writeFile("./test.png", buff);
  }
};

export const compose = async (AllImagesTraits = [], size) => {
  try {
    const img = await compositeProbs(AllImagesTraits, size);
  } catch (err) {
    console.log(err);
  }
};

// compose();

//   "source-over",
//   "source-in",
//   "source-out",
//   "source-atop",
//   "destination-over",
//   "destination-in",
//   "destination-out",
//   "destination-atop",
//   "lighter",
//   "copy",
//   "xor",
//   "multiply",
//   "screen",
//   "overlay",
//   "darken",
//   "lighten",
//   "color-dodge",
//   "color-burn",
//   "hard-light",
//   "soft-light",
//   "difference",
//   "exclusion",
//   "hue",
//   "saturation",
//   "color",
//   "luminosity"
