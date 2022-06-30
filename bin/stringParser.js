var fileDirent = "SequinSnakeWholeDark_30_Overlay.png";
var folderDirent = "03-SequinSnakeWholeDark_30";
var address = "./Traits/04-Mouth/Bored_60/04-Facials/Beard_50/Hipster_70.png";
var orderedFolderAddress = "./Traits/04-Mouth/Bored_60/04-Facials/";
var orderedFolderAddress2 =
  "./Traits/04-Mouth/Bored_60/02-Teeth/01-UpperFirstL/";
var orderedFolderAddress3 =
  "./Traits/04-Mouth/Bored_60/02-Teeth/09-Shadows.png";

const attribTemplate = {
  trait_type: "",
  value: "",
};
const newMetaAttribute = (trait_type, value) => ({
  trait_type,
  value,
});

const parseMetaAddress = (address) => {
  var array = address.split("/");
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    if (element === "" || element === ".") array.splice(index, 1);
  }
  // check if last child is a numbered fileName pop it to avoid setting it as category name.
  if (/[0-9]*-/.test(array[array.length - 1])) {
    if (/\.[a-z]+/.test(array[array.length - 1])) return;
    else array.pop();
  }

  var metaNames = [];
  for (let index = array.length - 1; index >= 0; index--) {
    const element = array[index];
    if (/[0-9]*-/.test(element)) {
      var category = element.replace(/[0-9]*-/, ``);
      // console.log(category, metaNames.join(" "));
      if (metaNames.length !== 0 && metaNames[0] !== "None")
        return newMetaAttribute(category, metaNames.join(" "));
      return;
    } else {
      var hasFileExt = false;
      var metaName = element;
      // check if it's a file
      if (/\..*/.test(metaName)) {
        metaName = metaName.replace(/\..*/, ``);
        hasFileExt = true;
      }
      // remove rarity numbers and blending mode
      metaName = metaName.replace(/_[0-9 a-z A-Z]+/g, ``);
      // if it's a folder and it doesn't begin with uppercase letters, add it to the attribute naming array
      if (!hasFileExt) {
        if (/^[A-Z].*/.test(metaName)) {
          // console.log(metaName);
          metaNames.push(metaName);
        }
      } else metaNames.push(metaName);
    }
  }
};
export const parseParentMetaName = (Hierarchy) => {
  var address = Hierarchy.address;
  var array = address.split("/");
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    if (element === "" || element === ".") array.splice(index, 1);
  }
  var parentName = array[array.length - 2];
  parentName = parentName.replace(/_[0-9 a-z A-Z]+/g, ``);
  parentName = parentName.replace(/[0-9]*-/, ``);
  parentName = parentName.replace(/\s*/, ``);
  // console.warn(parentName);
  return parentName;
};
export const parseMetaAttribute = (Hierarchy) => {
  var metaAttrib = parseMetaAddress(Hierarchy.address);
  if (
    metaAttrib?.value &&
    Hierarchy.hueVariant?.colorName &&
    Hierarchy.hueVariant !== "unhued" &&
    metaAttrib?.value !== "None"
  ) {
    metaAttrib.value = Hierarchy.hueVariant.colorName + " " + metaAttrib.value;
  }
  return metaAttrib;
};

export const parseFolderName = (folderName) => {
  var array = folderName.split("_");
  var metaName = array[0].replace(/[0-9]*-/, ``);
  var extension = array[array.length - 1].replace(/(.+)\.(.+)/, `$2`);
  array.shift();
  var rarity = 100;
  for (const st of array) {
    if (/[0-9]+/.test(st)) {
      rarity = parseInt(st);
    }
  }

  return {
    metaName,
    rarity,
  };
};

export const parseFileName = (fileName) => {
  var array = fileName.split("_");
  var metaName = array[0].replace(/(.*-+)*(.+)(\..+)/, `$2`);
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
  return {
    metaName,
    blendingMode,
    rarity,
    extension,
  };
};

// const test = () => {
//   parseMetaAddress(address);
//   // parseMetaAddress(orderedFolderAddress3);
// };
// test();
