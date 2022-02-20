import { traitsDir } from './config.js';
import {
  HierarchyToFile,
  readDir,
  HueVariantsFromFolder,
} from './fileHandler.js';
import { parseFileName, parseFolderName } from './nameParser.js';

const Hierarchy = {
  parent: './',
  metaName: 'root',
  rarity: 100,
  switchableChildren: [],
  orderedChildren: [],
  hueVariants: [],
  direntName: '',
  address: traitsDir,
};

const createHierarchy = (
  parentH,
  metaName = '',
  rarity = 100,
  hueVariants = [],
  direntName = '',
  address = ''
) => ({
  parent: parentH.address,
  metaName,
  rarity,
  switchableChildren: [],
  orderedChildren: [],
  hueVariants,
  direntName,
  address,
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
};

const createBlendingImage = (
  parentH,
  metaName = '',
  rarity = 100,
  hueVariant = {},
  extension = '',
  direntName = '',
  address = '',
  blendingMode = 'normal'
) => ({
  parent: parentH.address,
  metaName,
  rarity,
  hueVariant,
  extension,
  direntName,
  address,
  blendingMode,
});

const parseAndAddDirent = (
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
      dirent.name,
      address
    );
    if (ordered) currentHierarchy.orderedChildren.push(NewHierarchy);
    else currentHierarchy.switchableChildren.push(NewHierarchy);

    return NewHierarchy;
  }
};

const cacheHierarchy = async (
  directory = traitsDir,
  currentHierarchy = Hierarchy
) => {
  try {
    const Dirents = await readDir(directory);
    //FindOut Which kind of Hierarchy is this also fill it in
    let hasOrderedChilds = false;
    let setOrderedOrnot = false;
    for (const dirent of Dirents) {
      if (dirent.name === 'hue.json') {
        //Exluded from children
        //add it to current Hierarchy.
        const fileDir = directory + dirent.name;
        // console.log(fileDir);
        currentHierarchy.hueVariants = await HueVariantsFromFolder(fileDir);
      } else if (dirent.name === 'unhued') {
        currentHierarchy.hueVariants = 'unhued';
      } else if (dirent.name === 'ignoremeta') {
        currentHierarchy.ignoreMeta = true;
      } else {
        let cached;
        if (/[0-9]+-/.test(dirent.name)) {
          if (!hasOrderedChilds && setOrderedOrnot) {
            console.log(
              'Error: Each folder can only contain eather ordered childeren or switchable ones.'
            );
            return;
          }
          hasOrderedChilds = true;
          setOrderedOrnot = true;
          cached = parseAndAddDirent(directory, dirent, currentHierarchy, true);
        } else {
          if (hasOrderedChilds && setOrderedOrnot) {
            console.log(
              'Error: Each folder can only contain eather ordered childeren or switchable ones.'
            );
            return;
          }
          hasOrderedChilds = false;
          setOrderedOrnot = true;
          cached = parseAndAddDirent(
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

const cache = async () => {
  try {
    await cacheHierarchy();
    await HierarchyToFile(Hierarchy);
    // console.log(theWritten.orderedChildren[3]);
  } catch (err) {
    console.log(err);
  }
};

cache();
