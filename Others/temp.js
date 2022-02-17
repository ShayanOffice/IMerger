import Canvas from "canvas";
import { promises as fs } from "fs";

const readImg = (address) =>
  Jimp.read(address)
    .then((image) => image)
    .catch((err) => {
      console.error(err);
    });

const destination = "built/";
const baseImgAddress = "./Traits/02-Body/01-Back/General.png";
const overlayImgAddress =
  "./Traits/02-Body/02-SkinPatterns/BrightReptile_Screen.png";

export const compose = async () => {
  try {
    let canvas = new Skia.Canvas(4096, 4096);
    let ctx = canvas.getContext("2d");

    await Skia.loadImage(baseImgAddress).then((image) => {
      ctx.drawImage(image, 0, 0, 4096, 4096);
    });
    
    ctx.filter = "hue-rotate(66deg) blur(20px)";
    ctx.globalCompositeOperation = "source-over";

    await Skia.loadImage(overlayImgAddress).then((image) => {
      ctx.drawImage(image, 0, 0, 4096, 4096);
    });

    const buff = await canvas.toBuffer("image/png");
    fs.writeFile("./test.png", buff);

  } catch (err) {
    console.log(err);
  }
};


compose();

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
