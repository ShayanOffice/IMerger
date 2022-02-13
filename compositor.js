const Jimp = require('jimp');
const backgroundAddress = 'Traits/01-Background/Aqua.png';
const overlayAddress = 'Traits/02-Body/Alien.png';
const destination = 'Built/';

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



const main = async () => {
  const arr = await compositeImages(imgArray);
};

main();
