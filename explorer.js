const { rename } = require("fs");
const { dirname } = require("path");

const fs = require("fs").promises;

let rootDir = "./Traits/";
let allSubFolders = [];
let allFiles = [];
let iterationsCounter = 0;

//Assuming we only have PNGs and Folders
const Hierarchy = {
  parent: null,
  switchableChildren: [],
  orderedChildren: [],
  metaName: "root",
  direntName: "",
  address: "",
};

const createHierarchy = (
  parent = Hierarchy,
  metaName = "",
  direntName = "",
  address = ""
) => ({
  parent,
  switchableChildren: [],
  orderedChildren: [],
  metaName,
  direntName,
  address,
});

const BlendingImage = {
  parent: null,
  metaName: "",
  extension: "",
  direntName: "",
  address: "",
  blendingMode: "normal",
};

const createBlendingImage = (
  parent = Hierarchy,
  metaName = "",
  extension = "",
  direntName = "",
  address = "",
  blendingMode = "normal"
) => ({
  parent,
  metaName,
  extension,
  direntName,
  address,
  blendingMode,
});

const parseDirent = (directory, dirent, currentHierarchy, ordered = true) => {
  if (dirent.isFile()) {
    const fileName = /._.+\./.test(dirent.name)
      ? dirent.name.replace(/(.+)(_.+)(\..+)/, `$1$3`)
      : dirent.name;
    const metaName = fileName.replace(/(.+)(\..+)/, `$1`);
    const extension = fileName.replace(/(.+)\.(.+)/, `$2`);
    const blendingMode = /._.+\./.test(dirent.name)
      ? dirent.name.replace(/(.+)(_.+)(\..+)/, `$2`)
      : "normal";
    const address = directory + "/" + dirent.name;
    const newImageData = createBlendingImage(
      currentHierarchy,
      metaName,
      extension,
      dirent.name,
      address,
      blendingMode
    );
    if (ordered) currentHierarchy.orderedChildren.push(newImageData);
    else currentHierarchy.switchableChildren.push(newImageData);
    return null;
  } else {
    const address = directory + dirent.name;
    const metaName = dirent.name.replace(/([0-9]+-)(.+)/, `$2`);
    const NewHierarchy = createHierarchy(
      currentHierarchy,
      metaName,
      dirent.name,
      address
    );
    const testImage = createBlendingImage(
      currentHierarchy,
      metaName,
      "wdw",
      dirent.name,
      address
    );
    if (ordered) currentHierarchy.orderedChildren.push(NewHierarchy);
    else currentHierarchy.switchableChildren.push(NewHierarchy);

    return NewHierarchy;
  }
};

// if (/._/.test(dirent.name)) {
//   const newName = dirent.name.replace(/(.*)\_/, ``)
//   await fs.rename(directory + dirent.name, directory+ newName);

// }

const cacheHierarchy = async (directory, currentHierarchy) => {
  let folders = [];
  let files = [];
  try {
    const Dirents = await fs.readdir(directory, { withFileTypes: true });

    //FindOut Which kind of Hierarchy is this also fill it in
    let hasOrderedChilds = false;
    setOrderedOrnot = false;
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
        cached = parseDirent(directory, dirent, currentHierarchy, true);
      } else {
        if (hasOrderedChilds && setOrderedOrnot) {
          console.log(
            "Error: Each folder can only contain eather ordered childeren or switchable ones."
          );
          return;
        }
        hasOrderedChilds = false;
        setOrderedOrnot = true;
        cached = parseDirent(directory, dirent, currentHierarchy, false);
      }

      if (cached) {
        await cacheHierarchy(directory + dirent.name + "/", cached);
      }
    }
    ////////////////////////////////////////////////////////
    // if (dirent.isDirectory()) folders.push(dirent.name);
    // else if (dirent.isFile()) files.push(dirent.name);
  } catch (err) {
    console.log(err);
  }
};

const Explore = async (directory) => {
  let folders = [];
  let files = [];
  const currentHierarchy = {};
  try {
    const Dirents = await fs.readdir(directory, { withFileTypes: true });
    for (const dirent of Dirents) {
      if (dirent.isDirectory()) folders.push(dirent.name);
      else if (dirent.isFile()) {
        files.push(dirent.name);
      }
    }
    allSubFolders = [...allSubFolders, ...folders];
    allFiles = [...allFiles, ...files];

    iterationsCounter++;
    // if (folders.length != 0)
    // console.log('subfolders inside "' + directory + '" are:\n' + folders);
    // if (files.length != 0)
    //   console.log('files inside "' + directory + '" are:\n' + files);
    for (const subFolder of folders) {
      await cacheHierarchy(directory + subFolder + "/");
    }
  } catch (err) {
    console.log(err);
  }
};

const Main = async () => {
  try {
    await cacheHierarchy(rootDir, Hierarchy);
    console.log(Hierarchy.orderedChildren[3]);
  } catch (err) {}
};

Main();
