import { traitsDir } from "./config.js";
import { readHierarchyFromFile } from "./fileHandler.js";
let allProbabilities = [];
const randomChoice = (array) => {
  const rndI = Math.floor(Math.random() * array.length);
  // console.log(array[rndI]);
  return array[rndI];
};

const selectTraits = async (Hierarchy, CurrentIterTraits) => {
  let counter = 0;
  if (!Hierarchy.extension) {
    //it's a folder entry
    if (Hierarchy.orderedChildren.length > 0) {
      for (const hir of Hierarchy.orderedChildren) await selectTraits(hir,CurrentIterTraits);
    } else if (Hierarchy.switchableChildren.length > 0) {
      const hir = randomChoice(Hierarchy.switchableChildren);
      await selectTraits(hir,CurrentIterTraits);
    } else {
      console.error("Given Hierarchy is Empty");
      return;
    }
  } else {
    //it's a file entry
    CurrentIterTraits.push(Hierarchy);
  }
};

const makeProbabilities = async (rootHierarchy, Count) => {
  let currentProbability = [];
  let counter = 0;
  while (counter < Count) {
    currentProbability = [];
    await selectTraits(rootHierarchy, currentProbability);
    if (!allProbabilities.includes(currentProbability)) {
      allProbabilities.push(currentProbability);
      counter++;
    }
  }
};

export const choose = async (Count) => {
  try {
    const Hierarchy = await readHierarchyFromFile();
    await makeProbabilities(Hierarchy, Count);
    return allProbabilities;
  } catch (err) {
    console.log(err);
  }
};

// choose();
