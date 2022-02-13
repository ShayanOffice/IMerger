const Jimp = require('jimp');
const backgroundAddress = 'Traits/01-Background/Aqua.png';
const overlayAddress = 'Traits/02-Body/Alien.png';
const destination = 'built/';

const imgArray = [backgroundAddress, overlayAddress];

const readJimpImg = (address) =>
  Jimp.read(address)
    .then((image) => image)
    .catch((err) => {
      console.error(err);
    });

const compositeImgArr = async (imagesArray) => {
  var loadedJimpsArray = [];
  for (const imageAddr of imagesArray) {
    const jimpImg = await readJimpImg(imageAddr);
    loadedJimpsArray.push(jimpImg);
  }
  var finalJimp = new Jimp(2048, 2048);
  for (const jimpImg of loadedJimpsArray) {
    finalJimp = await finalJimp
      .composite(jimpImg, 0, 0, { mode: Jimp.BLEND_SOURCE_OVER })
      .quality(100);
  }
  return await finalJimp.write(destination + 'builtImage.jpg');
};

const compositeProbs = async (probabilities) => {
  var loadedJimpsArray = [];
  for (const Hierarchy of probabilities) {
    const jimpImg = await readJimpImg(Hierarchy.address);
    loadedJimpsArray.push(jimpImg);
  }
  var finalJimp = new Jimp(2048, 2048);
  for (const jimpImg of loadedJimpsArray) {
    finalJimp = await finalJimp
      .composite(jimpImg, 0, 0, { mode: Jimp.BLEND_SOURCE_OVER })
      .quality(100);
  }
  return await finalJimp.write(destination + 'builtImage.jpg');
};



export const compose = async () => {
  const img = await compositeProbs(imgArray);
};

compose();
