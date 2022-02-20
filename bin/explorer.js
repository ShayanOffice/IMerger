import { TraitsDir } from "./config.js";
import {
  HierarchyToFile,
  readDir,
  HueVariantsFromFolder,
} from "./fileHandler.js";
import { parseFileName, parseFolderName } from "./stringParser.js";

const Hierarchy = {
  parent: "./",
  metaName: "root",
  rarity: 100,
  switchableChildren: [],
  orderedChildren: [],
  hueVariants: [],
  direntName: "",
  address: TraitsDir,
  ignoreMeta: false,
};

const createHierarchy = (
  parentH,
  metaName = "",
  rarity = 100,
  hueVariants = [],
  direntName = "",
  address = "",
  ignoreMeta = false
) => ({
  parent: parentH.address,
  metaName,
  rarity,
  switchableChildren: [],
  orderedChildren: [],
  hueVariants,
  direntName,
  address,
  ignoreMeta,
});

const BlendingImage = {
  parent: "./",
  metaName: "",
  rarity: 100,
  hueVariant: {},
  extension: "",
  direntName: "",
  address: "",
  blendingMode: "normal",
  ignoreMeta: false,
};

const createBlendingImage = (
  parentH,
  metaName = "",
  rarity = 100,
  hueVariant = {},
  extension = "",
  direntName = "",
  address = "",
  blendingMode = "normal",
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

const parseAndAddDirent = (
  directory,
  dirent,
  currentHierarchy,
  ordered = true,
  inherittedIgnoreMeta = false
) => {
  if (inherittedIgnoreMeta === true) {
    console.log("Inheritted ignoreMeta: ", currentHierarchy.metaName);
  }
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
      parsedNameObj.blendingMode,
      inherittedIgnoreMeta
    );
    if (ordered) currentHierarchy.orderedChildren.push(newImageData);
    else currentHierarchy.switchableChildren.push(newImageData);
    return null;
  } else {
    const address = directory + dirent.name + "/";
    const parsedNameObj = parseFolderName(dirent.name);
    const NewHierarchy = createHierarchy(
      currentHierarchy,
      parsedNameObj.metaName,
      parsedNameObj.rarity,
      [],
      dirent.name,
      address,
      inherittedIgnoreMeta
    );
    if (ordered) currentHierarchy.orderedChildren.push(NewHierarchy);
    else currentHierarchy.switchableChildren.push(NewHierarchy);

    return NewHierarchy;
  }
};

const cacheHierarchy = async (
  directory = TraitsDir,
  currentHierarchy = Hierarchy,
  inherittedIgnoreMeta = false
) => {
  try {
    const Dirents = await readDir(directory);
    //FindOut Which kind of Hierarchy is this also fill it in
    let hasOrderedChilds = false;
    let setOrderedOrnot = false;
    let infoFiles = [];
    for (const dirent of Dirents) {
      if (dirent.name === "hue.json") {
        const fileDir = directory + dirent.name;
        currentHierarchy.hueVariants = await HueVariantsFromFolder(fileDir);
        infoFiles.push(dirent);
      } else if (dirent.name === "unhued") {
        currentHierarchy.hueVariants = "unhued";
        infoFiles.push(dirent);
      } else if (dirent.name === "ignoremeta") {
        currentHierarchy.ignoreMeta = true;
        infoFiles.push(dirent);
      }
      if (inherittedIgnoreMeta) {
        currentHierarchy.ignoreMeta = true;
      }
      if (currentHierarchy.ignoreMeta) console.log(currentHierarchy.ignoreMeta);
      let cached;
      if (/[0-9]+-/.test(dirent.name)) {
        if (
          !hasOrderedChilds &&
          setOrderedOrnot &&
          !infoFiles.includes(dirent)
        ) {
          console.log(
            "Error: Each folder can only contain eather ordered childeren or switchable ones."
          );
          return;
        }
        if (!infoFiles.includes(dirent)) {
          hasOrderedChilds = true;
          setOrderedOrnot = true;

          cached = parseAndAddDirent(
            directory,
            dirent,
            currentHierarchy,
            true,
            currentHierarchy.ignoreMeta
          );
        }
      } else {
        if (
          hasOrderedChilds &&
          setOrderedOrnot &&
          !infoFiles.includes(dirent)
        ) {
          console.log(
            "Error: Each folder can only contain eather ordered childeren or switchable ones."
          );
          return;
        }

        if (!infoFiles.includes(dirent)) {
          hasOrderedChilds = false;
          setOrderedOrnot = true;
          cached = parseAndAddDirent(
            directory,
            dirent,
            currentHierarchy,
            false,
            currentHierarchy.ignoreMeta
          );
        }
      }

      if (cached) {
        await cacheHierarchy(
          directory + dirent.name + "/",
          cached,
          currentHierarchy.ignoreMeta
        );
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
