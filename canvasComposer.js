import Skia from "skia-canvas";
import { promises as fs } from "fs";
import ImageFilters from "canvas-filters";
// import { Canvas } from "skia-canvas/lib";

const destination = "./built/";
const baseImgAddress = "./Traits/02-Body/01-Back/General.png";
const overlayImgAddress =
  "./Traits/02-Body/02-SkinPatterns/BrightReptile_Screen.png";

const readImg = async (address) => {
  try {
    console.log('reading trait: "' + address + '"');
    return await Skia.loadImage(address);
  } catch (err) {
    console.error(err);
  }
};

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
    var loadedImgDataArray = [];
    var loadedBlendingMs = [];

    for (const Hierarchy of singleImgTraits) {
      const Img = await readImg(Hierarchy.address);
      let canvas = new Skia.Canvas(size, size);
      let ctx = canvas.getContext("2d");
      ctx.drawImage(Img, 0, 0, size, size);
      var imageData = ctx.getImageData(0, 0, size, size);
      if (Hierarchy.hueVariant.colorName) {
        console.log('coloring "' + Hierarchy.address + '" => ' + colorName);
        var colorName = Hierarchy.hueVariant.colorName;
        var hueAmount = parseInt(Hierarchy.hueVariant.hue);

        var imageData = await ImageFilters.HSLAdjustment(
          imageData,
          hueAmount,
          0,
          0
        );
        ctx.putImageData(imageData, 0, 0);
        console.log("Done");
      }
      loadedImgDataArray.push(canvas);
      loadedBlendingMs.push(parseCanvasBlendingMode(Hierarchy));
    }

    
    let canvas = new Skia.Canvas(size, size);
    let ctx = canvas.getContext("2d");

    for (let index = 0; index < loadedImgDataArray.length; index++) {
      const loadedCanv = loadedImgDataArray[index];
      const blendingMode = loadedBlendingMs[index];

      ctx.globalCompositeOperation = blendingMode;
      ctx.drawCanvas(loadedCanv, 0, 0);
    }
    const buff = await canvas.toBuffer("image/png");
    await fs.writeFile(destination + "builtImage_" + Date.now() + ".jpg", buff);
  }
};

export const compose = async (AllImagesTraits = [], size) => {
  try {
    const img = await compositeProbs(AllImagesTraits, size);
  } catch (err) {
    console.log(err);
  }
};

const makeOne = async () => {
  try {
    let canvas = new Skia.Canvas(4096, 4096);
    let ctx = canvas.getContext("2d");
    let base = await Skia.loadImage(baseImgAddress);
    let over = await Skia.loadImage(overlayImgAddress);
    // ctx.filter = `hue-rotate(2700rad)`;
    ctx.drawImage(base, 0, 0, 4096, 4096);
    var imageData = ctx.getImageData(0, 0, 4096, 4096);
    var filtered = ImageFilters.HSLAdjustment(imageData, -180, 0, 0);
    ctx.putImageData(filtered, 0, 0);
    ctx.globalCompositeOperation = "screen";
    ctx.drawImage(over, 0, 0, 4096, 4096);
    const buff = await canvas.toBuffer("image/png");
    await fs.writeFile("./test.png", buff);
  } catch (err) {
    console.log(err);
  }
};

// makeOne();

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