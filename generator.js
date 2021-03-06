import { promises as fs } from "fs";
import { choose } from "./bin/chooser.js";
import { choose as usePreChosen } from "./bin/chooserPrime.js";
import { compose } from "./bin/composer.js";
import {
  Size,
  ResyncBeforeStart,
  CacheBeforeStart,
  ImagesDir,
  MetaDatasDir,
  ChoicesDetailsDir,
  EvolutionDictionaryFileName,
  CacheDir,
  fromPreGenerated,
} from "./config.js";
import {
  ReSyncBuilt,
  ReadObjFromFile,
  readDir,
  HierarchyFromFile,
} from "./bin/fileHandler.js";
import { Cache, findImgHrByProperty } from "./bin/explorer.js";
import _ from "lodash";

const main = async () => {
  await makeRequiredDirectories();
  var rootHr = await HierarchyFromFile();
  if (ResyncBeforeStart) await ReSyncBuilt();
  if (CacheBeforeStart || !rootHr || rootHr == {}) rootHr = await Cache();

  var allImgProbabilities, allImgAttributes, madeChoices, allMaskedNames;
  if (fromPreGenerated) {
    var PreGenImgsArray = await getPreGenChoices(
      ChoicesDetailsDir,
      CacheDir + EvolutionDictionaryFileName,
      rootHr
    );
    const {
      AllImgProbabilities,
      AllImgAttributes,
      MadeChoices,
      AllMaskedNames,
    } = await usePreChosen(PreGenImgsArray);
    allImgProbabilities = AllImgProbabilities;
    allImgAttributes = AllImgAttributes;
    madeChoices = MadeChoices;
    allMaskedNames = AllMaskedNames;
  } else {
    const {
      AllImgProbabilities,
      AllImgAttributes,
      MadeChoices,
      AllMaskedNames,
    } = await choose();
    allImgProbabilities = AllImgProbabilities;
    allImgAttributes = AllImgAttributes;
    madeChoices = MadeChoices;
    allMaskedNames = AllMaskedNames;
  }

  await compose(
    allImgProbabilities,
    allImgAttributes,
    madeChoices,
    allMaskedNames,
    Size
  );
};
main();

async function makeRequiredDirectories() {
  await fs.mkdir(CacheDir, { recursive: true }, function (err) {
    if (err) return console.log(err);
  });
  await fs.mkdir(ImagesDir, { recursive: true }, function (err) {
    if (err) return console.log(err);
  });
  await fs.mkdir(MetaDatasDir, { recursive: true }, function (err) {
    if (err) return console.log(err);
  });
  await fs.mkdir(ChoicesDetailsDir, { recursive: true }, function (err) {
    if (err) return console.log(err);
  });
}

const getPreGenChoices = async (
  ChoicesDetailsDir,
  EvolutionDictionary,
  rootHr
) => {
  const evolutionDictionary = await ReadObjFromFile(
    CacheDir + EvolutionDictionaryFileName
  );
  const allPreChosenTraitArrays = [];

  const choicesDetails = await readDir(ChoicesDetailsDir);
  for (const chosenTraits of choicesDetails) {
    const PreChosenImgTraitsFrom = await ReadObjFromFile(
      ChoicesDetailsDir + chosenTraits.name
    );
    const PreChosenImgTraitsTo = [];
    for (const trait of PreChosenImgTraitsFrom) {
      for (const key of Object.keys(evolutionDictionary)) {
        if (key == trait.address) {
          const convertedImgHr = findImgHrByProperty(
            rootHr,
            "address",
            evolutionDictionary[key]
          );
          PreChosenImgTraitsTo.push(convertedImgHr);
          break;
        }
      }
    }
    allPreChosenTraitArrays.push(PreChosenImgTraitsTo);
  }

  return allPreChosenTraitArrays;
};
