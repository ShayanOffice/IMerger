import { traitsDir } from "./config.js";
import { HierarchyFromFile } from "./fileHandler.js";
let allProbabilities = [];
const randomChoice = (array) => {
  const rndI = Math.floor(Math.random() * array.length);
  // console.log(array[rndI]);
  return array[rndI];
};

const selectTraits = async (
  Hierarchy,
  CurrentIterTraits,
  parentHueVariant,
  isUnhued = false
) => {
  let counter = 0;
  var currnetHueVariant;
  if (!Hierarchy.extension) {
    //it's a folder entry
    /////////////////////HandleVariant//////////////////////
    if (
      Array.isArray(Hierarchy.hueVariants) &&
      Hierarchy.hueVariants.length > 0
    )
      currnetHueVariant = randomChoice(Hierarchy.hueVariants);
    else {
      if (Hierarchy.hueVariants === "unhued") isUnhued = true;
      currnetHueVariant = parentHueVariant;
    }
    /////////////////////HandleVariant//////////////////////

    if (Hierarchy.orderedChildren.length > 0) {
      for (const hir of Hierarchy.orderedChildren)
        await selectTraits(hir, CurrentIterTraits, currnetHueVariant, isUnhued);
    } else if (Hierarchy.switchableChildren.length > 0) {
      const hir = randomChoice(Hierarchy.switchableChildren);
      await selectTraits(hir, CurrentIterTraits, currnetHueVariant, isUnhued);
    } else {
      console.error("Given Hierarchy is Empty");
      return;
    }
  } else {
    //it's a file entry
    /////////////////////HandleVariant//////////////////////
    if (!isUnhued) {
      if (parentHueVariant)
        Hierarchy.hueVariant = parentHueVariant;
    }
    /////////////////////HandleVariant//////////////////////
    CurrentIterTraits.push(Hierarchy);
  }
};

const makeProbabilities = async (rootHierarchy, Count) => {
  let currentProbability = [];
  let counter = 0;
  while (counter < Count) {
    currentProbability = [];
    let emptyHue;
    await selectTraits(rootHierarchy, currentProbability, emptyHue);
    if (!allProbabilities.includes(currentProbability)) {
      allProbabilities.push(currentProbability);
      counter++;
    }
  }
};

export const choose = async (Count) => {
  try {
    const Hierarchy = await HierarchyFromFile();
    await makeProbabilities(Hierarchy, Count);
    return allProbabilities;
  } catch (err) {
    console.log(err);
  }
};

// choose();
