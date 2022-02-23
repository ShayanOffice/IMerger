import Skia from 'skia-canvas';
import sha1 from 'sha1';
import { ImageFilters } from './canvas-filters/imagefilters.js';
import {
  MetaDescription,
  MetaName,
  MetaLinkBase,
  ImagesDir,
  MetaDatasDir,
} from './config.js';
import { Output } from './fileHandler.js';
// import { Canvas } from "skia-canvas/lib";
var ChoicesMade = { data: [] };
const metaTemplate = {
  name: 'Your Collection #1',
  description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
  image: 'ipfs://NewUriToReplace/1.png',
  dna: 'e84638f79025d035e7495d471bd5c87c748c7296',
  date: 1645178495607,
  attributes: [],
  compiler: "BOOMHUNK's Generative Art Algo",
  external_url: 'https://openseacreatures.io/3',
  youtube_url: 'https://openseacreatures.io/3',
};

const attribTemplate = {
  trait_type: '',
  value: '',
};


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
    case 'normal':
      BlendingMode = 'source-over';
      break;
    case 'multiply':
      BlendingMode = 'multiply';
      break;
    case 'screen':
      BlendingMode = 'screen';
      break;
    case 'overlay':
      BlendingMode = 'overlay';
      break;
    case 'darken':
      BlendingMode = 'darken';
      break;
    case 'lighten':
      BlendingMode = 'lighten';
      break;
    case 'hardlight':
      BlendingMode = 'hard-light';
      break;
    case 'difference':
      BlendingMode = 'difference';
      break;
    case 'exclusion':
      BlendingMode = 'exclusion';
      break;
    default:
      BlendingMode = 'source-over';
      break;
  }
  return BlendingMode;
};

const compositeProbs = async (
  AllImagesTraits = [],
  AllImgAttributes = [],
  MadeChoices = [],
  size
) => {
  for (let index = 0; index < AllImagesTraits.length; index++) {
    const singleImgTraits = AllImagesTraits[index];
    var loadedImgDataArray = [];
    var loadedBlendingMs = [];

    // console.log(singleImgTraits[0].metaName);
    for (let index = 0; index < singleImgTraits.length; index++) {
      const Hierarchy = singleImgTraits[index];
      const Img = await readImg(Hierarchy.address);
      let canvas = new Skia.Canvas(size, size);
      let ctx = canvas.getContext('2d');
      ctx.drawImage(Img, 0, 0, size, size);
      var imageData = ctx.getImageData(0, 0, size, size);
      if (Hierarchy.hueVariant.colorName) {
        var colorName = Hierarchy.hueVariant.colorName;
        var hueAmount = parseInt(Hierarchy.hueVariant.hue);
        console.log('coloring "' + Hierarchy.address + '" => ' + colorName);

        var imageData = await ImageFilters.HSLAdjustment(
          imageData,
          hueAmount,
          0,
          0
        );
        ctx.putImageData(imageData, 0, 0);
        console.log('Done');
      }
      loadedImgDataArray.push(canvas);
      loadedBlendingMs.push(parseCanvasBlendingMode(Hierarchy));
      // console.warn(Hierarchy.address);
    }

    let canvas = new Skia.Canvas(size, size);
    let ctx = canvas.getContext('2d');

    for (let index = 0; index < loadedImgDataArray.length; index++) {
      const loadedCanv = loadedImgDataArray[index];
      const blendingMode = loadedBlendingMs[index];

      ctx.globalCompositeOperation = blendingMode;
      ctx.drawCanvas(loadedCanv, 0, 0);
    }
    //* //////////////////////////// Find Empty index //////////////////////////// *//
    var namesCombined = '';
    for (const trait of singleImgTraits) {
      namesCombined += trait.metaName;
    }
    // console.log(namesCombined);
    var sha = sha1(namesCombined);
    const buff = await canvas.toBuffer('jpg');

    await Output(ChoicesMade, sha, AllImgAttributes[index], buff);
  }
};

export const compose = async (
  AllImagesTraits = [],
  AllImgAttributes = [],
  MadeChoices = [],
  size
) => {
  try {
    ChoicesMade.data = await JSON.parse(JSON.stringify(MadeChoices));
    const img = await compositeProbs(
      AllImagesTraits,
      AllImgAttributes,
      MadeChoices,
      size
    );
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
