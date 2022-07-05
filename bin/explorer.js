import { HowManyToMake, TraitsDir } from '../config.js';
import { HierarchyToFile, readDir, ReadObjFromFile } from './fileHandler.js';
import { parseFileName, parseFolderName } from './stringParser.js';
var probabilityCount = 0;
const Hierarchy = {
  parent: './',
  metaName: 'root',
  rarity: 100,
  switchableChildren: [],
  orderedChildren: [],
  hueVariants: [],
  masks: {},
  direntName: '',
  address: TraitsDir,
  ignoreMeta: false,
};

const createHierarchy = (
  parentH,
  metaName = '',
  rarity = 100,
  hueVariants = [],
  masks = {},
  direntName = '',
  address = '',
  ignoreMeta = false
) => ({
  parent: parentH.address,
  metaName,
  rarity,
  switchableChildren: [],
  orderedChildren: [],
  hueVariants,
  masks,
  direntName,
  address,
  ignoreMeta,
});

const BlendingImage = {
  parent: './',
  metaName: '',
  rarity: 100,
  hueVariant: {},
  extension: '',
  direntName: '',
  address: '',
  blendingMode: 'normal',
  ignoreMeta: false,
};

const createBlendingImage = (
  parentH,
  metaName = '',
  rarity = 100,
  hueVariant = {},
  extension = '',
  direntName = '',
  address = '',
  blendingMode = 'normal',
  ignoreMeta = false
) => ({
  parent: parentH.address,
  metaName,
  rarity,
  hueVariant,
  extension,
  direntName,
  address,
  blendingMode,
  ignoreMeta,
});

/////////////////////////////Helper Methodes/////////////////////////////

var foundImgHrByProperty;
export const findImgHrByProperty = (rootHr, propKey, propValue) => {
  var children =
    rootHr.orderedChildren.length > 0
      ? rootHr.orderedChildren
      : rootHr.switchableChildren;
  for (const childHr of children) {
    if (!childHr.extension || childHr.extension == '') {
      findImgHrByProperty(childHr, propKey, propValue);
    } else {
      if (childHr[propKey] == propValue) {
        // console.log(childHr);
        foundImgHrByProperty = childHr;
      }
    }
  }
  while (!foundImgHrByProperty) {
    console.log('Waiting...');
  }
  return foundImgHrByProperty;
};

/////////////////////////////Helper Methodes/////////////////////////////

const parseAddHierarchy = (
  directory,
  dirent,
  currentHierarchy,
  ordered = true
) => {
  if (dirent.isFile()) {
    const parsedNameObj = parseFileName(dirent.name);
    const address = directory + dirent.name;
    const newImageData = createBlendingImage(
      currentHierarchy,
      parsedNameObj.metaName,
      parsedNameObj.rarity,
      {},
      parsedNameObj.extension,
      dirent.name,
      address,
      parsedNameObj.blendingMode
    );
    if (ordered) currentHierarchy.orderedChildren.push(newImageData);
    else currentHierarchy.switchableChildren.push(newImageData);
    return null;
  } else {
    const address = directory + dirent.name + '/';
    const parsedNameObj = parseFolderName(dirent.name);
    const NewHierarchy = createHierarchy(
      currentHierarchy,
      parsedNameObj.metaName,
      parsedNameObj.rarity,
      [],
      {},
      dirent.name,
      address
    );
    if (ordered) currentHierarchy.orderedChildren.push(NewHierarchy);
    else currentHierarchy.switchableChildren.push(NewHierarchy);

    return NewHierarchy;
  }
};

const cacheHierarchy = async (
  directory = TraitsDir,
  currentHierarchy = Hierarchy
) => {
  try {
    const Dirents = await readDir(directory);
    //FindOut Which kind of Hierarchy is this also fill it in
    let hasOrderedChilds = false;
    let hasSetOrderedOrNot = false;

    for (const dirent of Dirents) {
      if (dirent.name === 'hue.json') {
        //Exluded from children
        //add it to current Hierarchy.
        const fileDir = directory + dirent.name;
        // console.log(fileDir);
        currentHierarchy.hueVariants = await ReadObjFromFile(fileDir);
      } else if (dirent.name === 'remember.json') {
        const fileDir = directory + dirent.name;
        currentHierarchy.remember = await ReadObjFromFile(fileDir);
      } else if (dirent.name === 'unhued') {
        currentHierarchy.hueVariants = 'unhued';
      } else if (dirent.name === 'ignoremeta') {
        currentHierarchy.ignoreMeta = true;
      } else if (dirent.name.toLowerCase().includes('mask')) {
        const sourceName = dirent.name.replace(/(.*)Mask\..+/, '$1');
        if (!currentHierarchy.masks[sourceName])
          currentHierarchy.masks[sourceName] = `${directory}${dirent.name}`;

        // console.log("Found Mask: ", currentHierarchy.masks);
      } else if (dirent.name.toLowerCase().includes('debug')) {
        // Photoshop's debug.log
      } else {
        if (currentHierarchy.childCount) currentHierarchy.childCount++;
        else currentHierarchy.childCount = 1;

        let cached;
        if (/[0-9]+-/.test(dirent.name)) {
          if (!hasOrderedChilds && hasSetOrderedOrNot) {
            console.log(
              'Error: Each folder can only contain eaither ordered childeren or switchable ones.'
            );
            return;
          }
          hasOrderedChilds = true;
          hasSetOrderedOrNot = true;
          cached = parseAddHierarchy(directory, dirent, currentHierarchy, true);
        } else {
          if (hasOrderedChilds && hasSetOrderedOrNot) {
            console.log(
              'Error: Each folder can only contain eaither ordered childeren or switchable ones.'
            );
            return;
          }
          hasOrderedChilds = false;
          hasSetOrderedOrNot = true;
          cached = parseAddHierarchy(
            directory,
            dirent,
            currentHierarchy,
            false
          );
        }
        if (cached) {
          await cacheHierarchy(directory + dirent.name + '/', cached);
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export const Cache = async () => {
  try {
    await cacheHierarchy();
    await HierarchyToFile(Hierarchy);
    return Hierarchy;
    // console.log(theWritten.orderedChildren[3]);
  } catch (err) {
    console.log(err);
  }
};

// Cache();
