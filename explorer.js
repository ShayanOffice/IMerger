import { traitsDir } from "./config.js";
import {
  HierarchyToFile,
  readDir,
  HueVariantsFromFolder,
} from "./fileHandler.js";

let iterationsCounter = 0;

//Assuming we only have PNGs and Folders
const Hierarchy = {
  parent: "./",
  metaName: "root",
  switchableChildren: [],
  orderedChildren: [],
  hueVariants: [],
  direntName: "",
  address: traitsDir,
};

const createHierarchy = (
  parentH,
  metaName = "",
  hueVariants = [],
  direntName = "",
  address = ""
) => ({
  parent: parentH.address,
  metaName,
  switchableChildren: [],
  orderedChildren: [],
  hueVariants,
  direntName,
  address,
});

const BlendingImage = {
  parent: "./",
  metaName: "",
  hueVariant: {},
  extension: "",
  direntName: "",
  address: "",
  blendingMode: "normal",
};

const createBlendingImage = (
  parentH,
  metaName = "",
  hueVariant = {},
  extension = "",
  direntName = "",
  address = "",
  blendingMode = "normal"
) => ({
  parent: parentH.address,
  metaName,
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
    const fileName = /._.+\./.test(dirent.name)
      ? dirent.name.replace(/(.+)(_.+)(\..+)/, `$1$3`)
      : dirent.name;
    const metaName = fileName.replace(/(.+)(\..+)/, `$1`);
    const extension = fileName.replace(/(.+)\.(.+)/, `$2`);
    const blendingMode = /._.+\./.test(dirent.name)
      ? dirent.name.replace(/(.+_)(.+)(\..+)/, `$2`)
      : "normal";
    const address = directory + dirent.name;
    const newImageData = createBlendingImage(
      currentHierarchy,
      metaName,
      {},
      extension,
      dirent.name,
      address,
      blendingMode
    );
    if (ordered) currentHierarchy.orderedChildren.push(newImageData);
    else currentHierarchy.switchableChildren.push(newImageData);
    return null;
  } else {
    const address = directory + dirent.name + "/";
    const metaName = dirent.name.replace(/([0-9]+-)(.+)/, `$2`);
    const NewHierarchy = createHierarchy(
      currentHierarchy,
      metaName,
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
      let cached;
      if (/[0-9]+/.test(dirent.name)) {
        if (!hasOrderedChilds && setOrderedOrnot) {
          console.log(
            "Error: Each folder can only contain eather ordered childeren or switchable ones."
          );
          return;
        }
        hasOrderedChilds = true;
        setOrderedOrnot = true;
        cached = parseAndAddDirent(directory, dirent, currentHierarchy, true);
      } else {
        if (dirent.name === "hue.json") {
          //Exluded from children
          //add it to current Hierarchy.
          const fileDir = directory + dirent.name;
          // console.log(fileDir);
          currentHierarchy.hueVariants = await HueVariantsFromFolder(
            fileDir
          );
        } else if (dirent.name === "unhued") {
          currentHierarchy.hueVariants = "unhued";
        } else {
          if (hasOrderedChilds && setOrderedOrnot) {
            console.log(
              "Error: Each folder can only contain eather ordered childeren or switchable ones."
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
      }

      if (cached) {
        await cacheHierarchy(directory + dirent.name + "/", cached);
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
