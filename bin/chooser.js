import { TraitsDir } from "./config.js";
import { HierarchyFromFile } from "./fileHandler.js";
import { parseMetaAttribute } from "./stringParser.js";
import { weightedChoose } from "./weightedChooser.js";
let AllImgProbabilities = [];
let AllImgAttributes = [];

const ContainsAttrib = (attributesArr, attribute) => {
  for (const attrib of attributesArr) {
    if (JSON.stringify(attrib) === JSON.stringify(attribute)) return true;
  }
  return false;
};

const selectTraits = async (
  Hierarchy,
  CurrentIterTraits,
  CurrentImgAttributes,
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
      currentHueVariant = weightedChoose(Hierarchy.hueVariants);
    else {
      if (Hierarchy.hueVariants === "unhued") isUnhued = true;
      currentHueVariant = parentHueVariant;
    }
    /////////////////////HandleVariant//////////////////////

    if (Hierarchy.orderedChildren.length > 0) {
      for (const hir of Hierarchy.orderedChildren)
        await selectTraits(
          hir,
          CurrentIterTraits,
          CurrentImgAttributes,
          currentHueVariant,
          isUnhued,
          Hierarchy.ignoreMeta
        );
    } else if (Hierarchy.switchableChildren.length > 0) {
      const childHr = weightedChoose(Hierarchy.switchableChildren);
      // Check the Chosen Child Type if it's numbered parse and add attrib.
      if (
        childHr.orderedChildren &&
        childHr.orderedChildren.length > 0 &&
        !Hierarchy.ignoreMeta
      ) {
        const attrib = parseMetaAttribute(childHr);
        if (!ContainsAttrib(CurrentImgAttributes, attrib) && attrib)
          CurrentImgAttributes.push(attrib);
      }
      await selectTraits(
        childHr,
        CurrentIterTraits,
        CurrentImgAttributes,
        currentHueVariant,
        isUnhued,
        Hierarchy.ignoreMeta
      );
    } else {
      console.error("Given Hierarchy is Empty");
      return;
    }
  } else {
    //it's a file entry
    /////////////////////HandleVariant//////////////////////
    if (!isUnhued) {
      if (parentHueVariant.hue) Hierarchy.hueVariant = parentHueVariant;
    }
    /////////////////////HandleVariant//////////////////////
    // add attrib.
    if (!Hierarchy.ignoreMeta) {
      const attrib = parseMetaAttribute(Hierarchy);
      if (!ContainsAttrib(CurrentImgAttributes, attrib) && attrib)
        CurrentImgAttributes.push(attrib);
    }
    await CurrentIterTraits.push(Hierarchy);
  }
};

const makeProbabilities = async (rootHierarchy, Count) => {
  let currentImgTraits = [];
  let currentImgAttributes = [];
  let counter = 0;
  while (counter < Count) {
    currentImgTraits = [];
    currentImgAttributes = [];
    let emptyHue = {};
    //make a copy so we don't touch the main object referenced.
    const defH = await JSON.parse(JSON.stringify(rootHierarchy));
    await selectTraits(defH, currentImgTraits, currentImgAttributes, emptyHue);
    if (!AllImgProbabilities.includes(currentImgTraits)) {
      AllImgProbabilities.push(currentImgTraits);
      AllImgAttributes.push(currentImgAttributes);
      counter++;
    }
  }
};

export const choose = async (Count) => {
  try {
    const Hierarchy = await HierarchyFromFile();
    await makeProbabilities(Hierarchy, Count);
    return [AllImgProbabilities, AllImgAttributes];
  } catch (err) {
    console.log(err);
  }
};

// choose();
