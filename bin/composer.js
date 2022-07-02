import Skia from "skia-canvas";
import sha1 from "sha1";
import { ImageFilters } from "./canvas-filters/imagefilters.js";
import { MakeACopyOfObj, Output } from "./fileHandler.js";
import { ImgType,Displace } from "../config.js";
import { parseParentMetaName } from "./stringParser.js";
// import { Canvas } from "skia-canvas/lib";
var ChoicesMade = { data: [] };
const metaTemplate = {
  name: "Your Collection #1",
  description: "Friendly OpenSea Creature that enjoys long swims in the ocean.",
  image: "ipfs://NewUriToReplace/1.png",
  dna: "e84638f79025d035e7495d471bd5c87c748c7296",
  date: 1645178495607,
  attributes: [],
  compiler: "BOOMHUNK's Generative Art Algo",
  external_url: "https://openseacreatures.io/3",
  youtube_url: "https://openseacreatures.io/3",
};

const attribTemplate = {
  trait_type: "",
  value: "",
};

const readImg = async (address) => {
  try {
    //config//////////////////////// console.log('reading trait: "' + address + '"');
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
    case "sourceover":
      BlendingMode = "source-over";
      break;
    case "sourcein":
      BlendingMode = "source-in";
      break;
    case "sourceout":
      BlendingMode = "source-out";
      break;
    case "sourceatop":
      BlendingMode = "source-atop";
      break;
    case "destinationover":
      BlendingMode = "destination-over";
      break;
    case "destinationin":
      BlendingMode = "destination-in";
      break;
    case "destinationout":
      BlendingMode = "destination-out";
      break;
    case "destinationatop":
      BlendingMode = "destination-atop";
      break;
    case "lighter":
      BlendingMode = "lighter";
      break;
    case "copy":
      BlendingMode = "copy";
      break;
    case "xor":
      BlendingMode = "xor";
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
    case "colordodge":
      BlendingMode = "color-dodge";
      break;
    case "colorburn":
      BlendingMode = "color-burn";
      break;
    case "hardlight":
      BlendingMode = "hard-light";
      break;
    case "softlight":
      BlendingMode = "soft-light";
      break;
    case "difference":
      BlendingMode = "difference";
      break;
    case "exclusion":
      BlendingMode = "exclusion";
      break;
    case "hue":
      BlendingMode = "hue";
      break;
    case "saturation":
      BlendingMode = "saturation";
      break;
    case "color":
      BlendingMode = "color";
      break;
    case "luminosity":
      BlendingMode = "luminosity";
      break;
    default:
      BlendingMode = "source-over";
      break;
  }
  return BlendingMode;
};

const compositeProbs = async (
  AllImagesTraits = [],
  AllImgAttributes = [],
  AllMaskablesNames,
  size
) => {
  for (let index = 0; index < AllImagesTraits.length; index++) {
    const singleImgTraits = AllImagesTraits[index];
    var canvasArray = [];
    var loadedBlendingMs = [];
    var allMasksAddressesForThisHr = {};
    var combinedMaskCanvasesForThisHr = {};
    await readAllApplyFX(singleImgTraits, canvasArray, loadedBlendingMs, size);

    //  Initiate allMasks with valid keys(all target images).
    for (let i = 0; i < AllMaskablesNames.length; i++) {
      const MaskableParentName = AllMaskablesNames[i];
      if (!Object.keys(allMasksAddressesForThisHr).includes(MaskableParentName))
        allMasksAddressesForThisHr[MaskableParentName] = [];
    }

    for (let j = 0; j < singleImgTraits.length; j++) {
      const traitMasks = singleImgTraits[j].masks;
      if (traitMasks && Object.keys(traitMasks).length > 0) {
        for (const maskableParentName of Object.keys(traitMasks)) {
          var maskAddress = traitMasks[maskableParentName];

          if (
            Object.keys(allMasksAddressesForThisHr).includes(maskableParentName)
          )
            allMasksAddressesForThisHr[maskableParentName].push(maskAddress);
          else
            console.warn(
              "Coresponding mask key wans't added initialy into allMasksAderesses from AllMaskedNames. MaskedImageName: ",
              maskableParentName
            );
        }
      } else
        for (const key of Object.keys(allMasksAddressesForThisHr)) {
          allMasksAddressesForThisHr[key].push("subtract");
        }
      // let canvas = new Skia.Canvas(size, size);
      // let ctx = canvas.getContext("2d");
    }
    // at this point we have allMaskAddresses sorted in coresponding key(targetParentName)/Value(array of all coresponding masks addresses) pairs.

    for (const maskableParentName of Object.keys(allMasksAddressesForThisHr)) {
      var eachMaskablesAddressesArray =
        allMasksAddressesForThisHr[maskableParentName];

      var maskDatas = [];
      for (const address of eachMaskablesAddressesArray) {
        if (address !== "subtract") {
          var maskSkiaImg = await readImg(address);
          var maskData = getImageData(size, maskSkiaImg);
          maskDatas.push(maskData);
        } else maskDatas.push("subtract");
      }

      var combinedMaskData = await combineMasksData(
        maskDatas,
        singleImgTraits,
        size,
        maskableParentName
      );
      var maskCanvas = alphaCanvasFromGreyscale(combinedMaskData, size);
      combinedMaskCanvasesForThisHr[maskableParentName] = maskCanvas;
    }

    let canvas = overlayAllImages(
      canvasArray,
      singleImgTraits,
      combinedMaskCanvasesForThisHr,
      loadedBlendingMs,
      size
    );

    var namesCombined = "";
    for (const trait of singleImgTraits) {
      if (!trait.ignoreMeta) namesCombined += trait.metaName;
    }
    var sha = sha1(namesCombined);
    const buff = await canvas.toBuffer(ImgType);

    await Output(ChoicesMade, sha, AllImgAttributes[index], singleImgTraits, buff);
  }
};

function overlayAllImages(
  canvasArray,
  traitsArray,
  finalMaskCanvases,
  loadedBlendingMs,
  size
) {
  let canvas = new Skia.Canvas(size, size);
  let ctx = canvas.getContext("2d");

  for (let index = 0; index < canvasArray.length; index++) {
    let loadedCanv = canvasArray[index];
    const blendingMode = loadedBlendingMs[index];
    for (const targetParentName of Object.keys(finalMaskCanvases)) {
      var currentParentName = parseParentMetaName(traitsArray[index]);
      if (targetParentName == currentParentName) {
        // console.log(
        //   "*******************************" +
        //     currentParentName +
        //     "*******************************"
        // );
        var maskCanvas = finalMaskCanvases[targetParentName];
        let maskedcanvas = new Skia.Canvas(size, size);
        let maskedCtx = maskedcanvas.getContext("2d");
        maskedCtx.drawCanvas(loadedCanv, 0, 0);
        var sourceData = maskedCtx.getImageData(0, 0, size, size);
        if (Displace) {
          var outputData = applyDisplacement(sourceData, maskCanvas, size, 30);
          maskedCtx.putImageData(outputData, 0, 0);
        }
        if (maskCanvas) {
          maskedCtx.globalCompositeOperation = "destination-in";
          maskedCtx.drawCanvas(maskCanvas, 0, 0);
          maskedCtx.globalCompositeOperation = "source-over";
          loadedCanv = maskedcanvas;
        }
      }
    }
    ctx.globalCompositeOperation = blendingMode;
    ctx.drawCanvas(loadedCanv, 0, 0);
  }
  // let maskedcanvas = new Skia.Canvas(size, size);
  // let maskedCtx = maskedcanvas.getContext("2d");
  // maskedCtx.drawCanvas(finalMaskCanvases["SkinPattern"], 0, 0);
  // return maskedcanvas;
  return canvas;
}

async function readAllApplyFX(
  singleImgTraits,
  canvasArray,
  loadedBlendingMs,
  size
) {
  for (let index = 0; index < singleImgTraits.length; index++) {
    const Hierarchy = singleImgTraits[index];
    const Img = await readImg(Hierarchy.address);
    let canvas = new Skia.Canvas(size, size);
    let ctx = canvas.getContext("2d");
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
      console.log("Done");
    }
    canvasArray.push(canvas);
    loadedBlendingMs.push(parseCanvasBlendingMode(Hierarchy));
  }
}

const getImageData = (size, img) => {
  let canvas = new Skia.Canvas(size, size);
  let ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, size, size);
  var imageData = ctx.getImageData(0, 0, size, size);
  return imageData;
};

function alphaCanvasFromGreyscale(maskData, size) {
  let canvas = new Skia.Canvas(size, size);
  let ctx = canvas.getContext("2d");
  var i = 0;
  while (i < maskData.data.length) {
    var rgb = maskData.data[i++] + maskData.data[i++] + maskData.data[i++];
    maskData.data[i++] = rgb / 3;
  }
  ctx.putImageData(maskData, 0, 0);
  return canvas;
}

async function combineMasksData(
  maskDataArr,
  traitsArr,
  size,
  maskableParentName
) {
  let canvas = new Skia.Canvas(size, size);
  let ctx = canvas.getContext("2d");

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < maskDataArr.length; i++) {
    const mData = maskDataArr[i];
    if (mData == "subtract") {
      if (parseParentMetaName(traitsArr[i]) != maskableParentName) {
        ctx.globalCompositeOperation = "darken";
        var traitImage = await readImg(traitsArr[i].address);
        var subCanvas = makeSubtractiveLayerMaskCanvas(
          getImageData(size, traitImage),
          size
        );
        ctx.drawCanvas(subCanvas, 0, 0, size, size);
      }
    } else {
      ctx.globalCompositeOperation = "lighten";
      var maskCanvas = makeCanvasFromData(mData, size);
      ctx.drawImage(maskCanvas, 0, 0);
    }
  }
  ctx.globalCompositeOperation = "source-over";
  return ctx.getImageData(0, 0, size, size);
}

function makeSubtractiveLayerMaskCanvas(subtractData, size) {
  let canvas = new Skia.Canvas(size, size);
  let ctx = canvas.getContext("2d");

  var subtractCanvas = makeCanvasFromData(subtractData, size);

  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(subtractCanvas, 0, 0);

  var subData = ctx.getImageData(0, 0, size, size);
  var i = 0;
  while (i < subData.data.length) {
    const rIndex = i;
    const gIndex = i + 1;
    const bIndex = i + 2;
    const aIndex = i + 3;
    const r = subData.data[rIndex];
    const g = subData.data[gIndex];
    const b = subData.data[bIndex];
    const a = subData.data[aIndex];

    subData.data[rIndex] = 255 - a;
    subData.data[gIndex] = 255 - a;
    subData.data[bIndex] = 255 - a;
    subData.data[aIndex] = 255;
    i += 4;
    // if (subData.data[j] === 255) console.log(subData.data[j]);
  }
  var subCanvas = makeCanvasFromData(subData, size);
  return subCanvas;
}

function makeCanvasFromData(data, size) {
  let canvas = new Skia.Canvas(size, size);
  let ctx = canvas.getContext("2d");
  ctx.putImageData(data, 0, 0);
  return canvas;
}

function applyDisplacement(sourceData, mapCanvas, size, displaceFactor = 70) {
  let canvas = new Skia.Canvas(size, size);
  let ctx = mapCanvas.getContext("2d");
  var mapData = ctx.getImageData(0, 0, size, size);
  ctx = canvas.getContext("2d");
  var outputData = ctx.createImageData(size, size);
  const dy = displaceFactor,
    dx = 0;

  for (var y = 0; y < size; y++) {
    for (var x = 0; x < size; x++) {
      // Get the greyscale value from the displacement map as a value between 0 and 1
      // 0 = black (farthest), 1 = white (nearest)
      // Higher values will be more displaced

      var pix = y * size + x,
        arrayPos = pix * 4,
        depth = (mapData.data[arrayPos] / 255) * 1;

      // Use the greyscale value as a percentage of our current drift,
      // and calculate an xy pixel offset based on that
      //   var half = size / 2;
      //   var xPos = x < half ? -1 : 1;
      //   var yPos = y < half ? -1 : 1;
      var ofs_x = Math.round(x + dx * depth),
        ofs_y = Math.round(y + dy * depth);

      // Clamp the offset to the canvas dimensions
      if (ofs_x < 0) ofs_x = 0;
      if (ofs_x > size - 1) ofs_x = size - 1;
      if (ofs_y < 0) ofs_y = 0;
      if (ofs_y > size - 1) ofs_y = size - 1;

      // Get the colour from the source image at the offset xy position,
      // and transfer it to our output at the original xy position
      outputData = sourceData;
      var targetPix = ofs_y * size + ofs_x,
        targetPos = targetPix * 4;
      outputData.data[arrayPos] = sourceData.data[targetPos];
      outputData.data[arrayPos + 1] = sourceData.data[targetPos + 1];
      outputData.data[arrayPos + 2] = sourceData.data[targetPos + 2];
      //   alpha channel displacement commented out
      // outputData.data[arrayPos + 3] = sourceData.data[targetPos + 3];
    }
  }
  return outputData;
}

export const compose = async (
  AllImagesTraits = [],
  AllImgAttributes = [],
  MadeChoices = [],
  AllMaskedNames = [],
  size
) => {
  try {
    ChoicesMade.data = await MakeACopyOfObj(MadeChoices);
    const img = await compositeProbs(
      AllImagesTraits,
      AllImgAttributes,
      AllMaskedNames,
      size
    );
  } catch (err) {
    console.log(err);
  }
};

// makeOne();
