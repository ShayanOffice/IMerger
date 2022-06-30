import { promises as fs } from "fs";
import {
  CacheDir,
  TraitsDir,
  CachedHierarchyFileName,
  MadeChoicesFileName,
  ImagesDir,
  MetaDatasDir,
  MetaName,
  MetaLinkBase,
  MetaDescription,
  MetaAuthor,
  ImgType,
} from "../config.js";

export const newMetaData = (number, dna) => {
  var imageAddress = "";
  const addressEndsWithSlash = /.*\/$/.test(MetaLinkBase);

  const appendedName = !addressEndsWithSlash
    ? `/${number}.${ImgType}`
    : `${number}.${ImgType}`;
  imageAddress = MetaLinkBase + appendedName;
  return {
    name: `${MetaName} #${number}`,
    description: `${MetaDescription}`,
    image: imageAddress,
    dna,
    date: Date.now(),
    attributes: [],
    author: MetaAuthor,
  };
};

export const newMetaAttribute = (trait_type, value) => ({
  trait_type,
  value,
});

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

export const ReadObjFromFile = async (fileDir) => {
  const data = await fs.readFile(fileDir);
  return JSON.parse(data);
};

const CleanUpUnmatchedBuilds = async () => {
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

const CleanUpUnmatchedCachedSha1s = async () => {
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

export const FindNextEmptyBuildIndex = async () => {
  const metaDirents = await readDir(MetaDatasDir);
  metaDirents.sort((a, b) => {
    const aNum = parseInt(a.name.replace(/(.+)(\..+)/, `$1`));
    const bNum = parseInt(b.name.replace(/(.+)(\..+)/, `$1`));
    return aNum - bNum;
  });
  for (let index = 0; index < metaDirents.length; index++) {
    const mDirentName = metaDirents[index].name.replace(/(.+)(\..+)/, `$1`);
    if (index != parseInt(mDirentName)) {
      return index;
    }
  }
  return metaDirents.length;
};

export const Output = async (ChoicesMade, sha, attributes, imageBuffer) => {
  const fileNumber = await FindNextEmptyBuildIndex();
  const metaData = newMetaData(fileNumber, sha);
  metaData.attributes = attributes;

  const imgFileName = `${ImagesDir}${fileNumber}.${ImgType}`;
  const metaFileName = `${MetaDatasDir}${fileNumber}.json`;

  await fs.writeFile(imgFileName, imageBuffer);
  console.log("Saved Image File: ", imgFileName);
  await fs.writeFile(metaFileName, JSON.stringify(metaData, null, 2));
  console.log("Saved Meta File: ", metaFileName);
  console.log(metaData);
  ChoicesMade.data.splice(fileNumber, 0, sha);
  await MadeChoicesToFile(ChoicesMade);
};

export const MakeACopyOfObj = async (obj) => {
  const clone = JSON.parse(JSON.stringify(obj));
  return clone;
};

export const MakeACopyOfArray = async (array) => {
  var ObjCopy = MakeACopyOfObj({ data: array });
  var clone = ObjCopy.data;
  return clone;
};
