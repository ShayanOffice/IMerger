var fileDirent = "SequinSnakeWholeDark_30_Overlay.png";
var folderDirent = "SequinSnakeWholeDark_30";

export const parseFolderName = (folderName) => {
    var array = folderName.split("_");
    var metaName = array[0].replace(/(.+)(\..+)/, `$1`);
    var extension = array[array.length - 1].replace(/(.+)\.(.+)/, `$2`);
    array.shift();
    var rarity = 100;
    for (const st of array) {
      if (/[0-9]+/.test(st)) {
        rarity = parseInt(st);
      }
    }

    return{
        metaName,
        rarity
    }
  };


export const parseFileName = (fileName) => {
  var array = fileName.split("_");
  var metaName = array[0].replace(/(.+)(\..+)/, `$1`);
  var extension = array[array.length - 1].replace(/(.+)\.(.+)/, `$2`);
  array[array.length - 1] = array[array.length - 1].replace(/(.+)\.(.+)/, `$1`);
  array.shift();
  var blendingMode = "normal";
  var rarity = 100;
  for (const st of array) {
    if (/[0-9]+/.test(st)) {
      rarity = parseInt(st);
    } else {
      blendingMode = st;
    }
  }
  return{
      metaName,
      blendingMode,
      rarity,
      extension
  }
};
