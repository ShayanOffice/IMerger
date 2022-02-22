import { promises as fs } from "fs";
import {
  CacheDir,
  TraitsDir,
  CachedHierarchyFileName,
  MadeChoicesFileName,
  ImagesDir,
  MetaDatasDir,
} from "./config.js";

export const readDir = async (TraitsDir) =>
  await fs.readdir(TraitsDir, { withFileTypes: true });

export const HierarchyToFile = async (cachedHierarchy) => {
  await fs.writeFile(
    CacheDir + CachedHierarchyFileName,
    JSON.stringify(cachedHierarchy, null, 2),
    function (err) {
      if (err) console.log(err);
    }
  );
};

export const HierarchyFromFile = async () => {
  const fileDir = CacheDir + CachedHierarchyFileName;
  const data = await fs.readFile(fileDir);
  return JSON.parse(data);
};

export const MadeChoicesToFile = async (choices) => {
  await fs.writeFile(
    CacheDir + MadeChoicesFileName,
    JSON.stringify(choices, null, 2),
    function (err) {
      if (err) console.log(err);
    }
  );
};

export const MadeChoicesFromFile = async () => {
  var ChoicesMade = { data: [] };
  const Dirents = await readDir(CacheDir);
  for (const dirent of Dirents) {
    if (dirent.name === MadeChoicesFileName) {
      const string = await fs.readFile(
        CacheDir + MadeChoicesFileName,
        function (err) {
          if (err) console.log(err);
        }
      );
      ChoicesMade = await JSON.parse(string);
    }
  }

  return ChoicesMade;
};

export const HueVariantsFromFolder = async (fileDir) => {
  const data = await fs.readFile(fileDir);
  return JSON.parse(data);
};

export const CleanUpUnmatchedBuilds = async () => {
  const ImgDirents = await readDir(ImagesDir);
  const MetaDirents = await readDir(MetaDatasDir);
  for (const imgDirent of ImgDirents) {
    var imgName = imgDirent.name.replace(/(.+)(\..+)/, `$1`);
    console.log(imgName);
    for (const metaDirent of MetaDirents) {
      var hasMatch = false;
      var mDataName = metaDirent.name.replace(/(.+)(\..+)/, `$1`);
      console.log(mDataName);
      if (imgName === mDataName) {
        hasMatch = true;
        break;
      }
    }
    if (!hasMatch) {
      // console.log(ImagesDir + imgDirent.name);
      await fs.rm(ImagesDir + imgDirent.name);
    }
  }
};

CleanUpUnmatchedBuilds();
