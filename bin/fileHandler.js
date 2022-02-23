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
  const imgDirents = await readDir(ImagesDir);
  const metaDirents = await readDir(MetaDatasDir);
  for (const imgDirent of imgDirents) {
    var imgName = imgDirent.name.replace(/(.+)(\..+)/, `$1`);
    for (const metaDirent of metaDirents) {
      var hasMatch = false;
      var mDataName = metaDirent.name.replace(/(.+)(\..+)/, `$1`);
      if (imgName === mDataName) {
        hasMatch = true;
        break;
      }
    }
    if (!hasMatch) {
      await fs.rm(ImagesDir + imgDirent.name);
    }
  }

  for (const metaDirent of metaDirents) {
    var mDataName = metaDirent.name.replace(/(.+)(\..+)/, `$1`);
    for (const imgDirent of imgDirents) {
      var hasMatch = false;
      var imgName = imgDirent.name.replace(/(.+)(\..+)/, `$1`);
      if (imgName === mDataName) {
        hasMatch = true;
        break;
      }
    }
    if (!hasMatch) {
      await fs.rm(MetaDatasDir + metaDirent.name);
    }
  }
};

export const CleanUpUnmatchedCachedSha1s = async () => {
  const metaDirents = await readDir(MetaDatasDir);
  const madeChoices = await MadeChoicesFromFile();

  for (let index = madeChoices.data.length - 1; index >= 0; index--) {
    const cachedSha = madeChoices.data[index];
    for (const metaDirent of metaDirents) {
      const metaFile = await JSON.parse(
        await fs.readFile(MetaDatasDir + metaDirent.name)
      );
      const fileSha = metaFile.dna;
      var hasMatch = false;
      if (cachedSha === fileSha) {
        hasMatch = true;
        break;
      }
    }
    if (!hasMatch) madeChoices.data.splice(index, 1);
  }
  await MadeChoicesToFile(madeChoices);

  for (const metaDirent of metaDirents) {
    const metaFile = await JSON.parse(
      await fs.readFile(MetaDatasDir + metaDirent.name)
    );
    const fileSha = metaFile.dna;
    for (const cachedSha of madeChoices.data) {
      var hasMatch = false;
      if (cachedSha === fileSha) {
        hasMatch = true;
        break;
      }
    }
    if (!hasMatch) {
      await fs.rm(MetaDatasDir + metaDirent.name);
      var mDataName = metaDirent.name.replace(/(.+)(\..+)/, `$1`);
      const imgDirents = await readDir(ImagesDir);
      for (const imgDirent of imgDirents) {
        var imgName = imgDirent.name.replace(/(.+)(\..+)/, `$1`);
        if (imgName === mDataName) {
          await fs.rm(ImagesDir + imgDirent.name);
        }
      }
    }
  }
};

export const ReSyncBuilt = async () => {
  await CleanUpUnmatchedBuilds();
  await CleanUpUnmatchedCachedSha1s();
};
