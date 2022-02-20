import { traitsDir } from './config.js';
import { HierarchyFromFile } from './fileHandler.js';
let allProbabilities = [];
const randomChoice = (arr) => {
  const randInd = Math.floor(Math.random() * arr.length);
  return arr[randInd];
};

const selectTraits = async (
  Hierarchy,
  CurrentIterTraits,
  parentHueVariant,
  isUnhued = false,
  ignoreMeta = false
) => {
  let counter = 0;
  var currentHueVariant;
  if (ignoreMeta) Hierarchy.ignoreMeta = true;
  if (!Hierarchy.extension) {
    //it's a folder entry
    /////////////////////HandleVariant//////////////////////
    if (
      Array.isArray(Hierarchy.hueVariants) &&
      Hierarchy.hueVariants.length > 0
    )
      currentHueVariant = randomChoice(Hierarchy.hueVariants);
    else {
      if (Hierarchy.hueVariants === 'unhued') isUnhued = true;
      currentHueVariant = parentHueVariant;
    }
    /////////////////////HandleVariant//////////////////////

    if (Hierarchy.orderedChildren.length > 0) {
      for (const hir of Hierarchy.orderedChildren)
        await selectTraits(
          hir,
          CurrentIterTraits,
          currentHueVariant,
          isUnhued,
          Hierarchy.ignoreMeta
        );
    } else if (Hierarchy.switchableChildren.length > 0) {
      const hir = randomChoice(Hierarchy.switchableChildren);
      await selectTraits(
        hir,
        CurrentIterTraits,
        currentHueVariant,
        isUnhued,
        Hierarchy.ignoreMeta
      );
    } else {
      console.error('Given Hierarchy is Empty');
      return;
    }
  } else {
    //it's a file entry
    /////////////////////HandleVariant//////////////////////
    if (!isUnhued) {
      if (parentHueVariant.hue) Hierarchy.hueVariant = parentHueVariant;
    }
    /////////////////////HandleVariant//////////////////////
    await CurrentIterTraits.push(Hierarchy);
  }
};

const makeProbabilities = async (rootHierarchy, Count) => {
  let currentProbability = [];
  let counter = 0;
  while (counter < Count) {
    currentProbability = [];
    let emptyHue = {};
    //make a copy so we don't touch the main object referenced.
    const defH = await JSON.parse(JSON.stringify(rootHierarchy));
    await selectTraits(defH, currentProbability, emptyHue);
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
