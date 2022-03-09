import sha1 from 'sha1';
import { HowManyToMake } from '../config.js';
import { HierarchyFromFile, MadeChoicesFromFile } from './fileHandler.js';
import { parseMetaAttribute } from './stringParser.js';
import { weightedChoose } from './weightedChooser.js';
let AllImgProbabilities = [];
let AllImgAttributes = [];
let MadeChoices = [];
let UnwrittenChoiceHashes = [];
const ContainsAttrib = (attributesArr, attribute) => {
  for (const attrib of attributesArr) {
    if (JSON.stringify(attrib) === JSON.stringify(attribute)) return true;
  }
  return false;
};

const iterateAndSelectTraits = async (
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
  if (!Hierarchy?.extension) {
    //it's a folder entry
    /////////////////////HandleVariant//////////////////////
    if (
      Array.isArray(Hierarchy?.hueVariants) &&
      Hierarchy.hueVariants.length > 0
    )
      currentHueVariant = weightedChoose(Hierarchy.hueVariants);
    else {
      if (Hierarchy?.hueVariants === 'unhued') isUnhued = true;
      currentHueVariant = parentHueVariant;
    }
    ////////////////////////////////////////////////////////

    if (Hierarchy?.orderedChildren.length > 0) {
      const remember = Hierarchy?.remember;
      const blacklist = [];
      for (const mapping of remember?.mappings) {
        if (mapping.autoMapByName) {
          console.error(
            'Hierarchy "' +
              Hierarchy.metaName +
              '"is with Ordered Children; thus it Can\'t Have autoMapByName=true.'
          );
        } else {
          for (const targetTraitName of mapping.chosenTraits) {
            for (const trait of CurrentIterTraits) {
              // Check if target was in our selection array
              if (trait.metaName === targetTraitName) {
                blacklist.concat(mapping.blacklist);
              }
            }
          }
        }
      }
      for (const hir of Hierarchy.orderedChildren)
        if (!blacklist.includes(hir.metaName))
          await iterateAndSelectTraits(
            hir,
            CurrentIterTraits,
            CurrentImgAttributes,
            currentHueVariant,
            isUnhued,
            Hierarchy.ignoreMeta
          );
    } else if (Hierarchy?.switchableChildren.length > 0) {
      const remember = Hierarchy?.remember;

      // return console.error(
      //   'You must specify a target category name to "remember" into the" ' +
      //     Hierarchy.address +
      //     'remember.json"'
      // );

      const childHr = undefined;
      const blacklist = [];
      for (const mapping of remember?.mappings) {
        if (mapping.autoMapByName) {
          // get selected child
          for (const targetTraitName of mapping.chosenTraits) {
            for (const t of CurrentIterTraits) {
              const traitParentName = t.address.replace(/.*\/(.+)\/.*/, `$1`);
              if (traitParentName === targetTraitName) {
                // t is the selected child
                // select the child with the same name.
                for (const hr of Hierarchy.switchableChildren) {
                  if (hr.metaName === t.metaName) childHr = hr;
                }
              }
            }
          }
        } else {
          for (const targetTraitName of mapping.chosenTraits) {
            for (const trait of CurrentIterTraits) {
              // Check if target was in our selection array
              if (trait.metaName === targetTraitName) {
                blacklist.concat(mapping.blacklist);
              }
            }
          }
        }
      }
      if (!childHr)
        childHr = weightedChoose(Hierarchy.switchableChildren, blacklist);

      await handleAttributeAndIterate(childHr);
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
    // add attrib.
    if (!Hierarchy.ignoreMeta) {
      const attrib = parseMetaAttribute(Hierarchy);
      if (!ContainsAttrib(CurrentImgAttributes, attrib) && attrib)
        CurrentImgAttributes.push(attrib);
    }
    await CurrentIterTraits.push(Hierarchy);
  }

  async function handleAttributeAndIterate(childHr) {
    // Check the Chosen Child Type if it's numbered parse and add attrib.
    if (
      childHr?.orderedChildren &&
      childHr?.orderedChildren.length > 0 &&
      !Hierarchy.ignoreMeta
    ) {
      const attrib = parseMetaAttribute(childHr);
      if (!ContainsAttrib(CurrentImgAttributes, attrib) && attrib)
        CurrentImgAttributes.push(attrib);
    }
    await iterateAndSelectTraits(
      childHr,
      CurrentIterTraits,
      CurrentImgAttributes,
      currentHueVariant,
      isUnhued,
      Hierarchy.ignoreMeta
    );
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
    await iterateAndSelectTraits(
      defH,
      currentImgTraits,
      currentImgAttributes,
      emptyHue
    );

    //+check if already didn't made this choice
    var namesCombined = '';
    for (const trait of currentImgTraits) {
      if (!trait.ignoreMeta) namesCombined += trait.metaName;
    }
    // console.log(namesCombined);
    var sha = sha1(namesCombined);
    if (!UnwrittenChoiceHashes.includes(sha) && !MadeChoices.includes(sha)) {
      UnwrittenChoiceHashes.push(sha);
      AllImgProbabilities.push(currentImgTraits);
      AllImgAttributes.push(currentImgAttributes);
      counter++;
    }
  }
};

export const choose = async () => {
  try {
    // read already made probs if any
    const obj = await MadeChoicesFromFile();
    MadeChoices = obj.data;
    console.log(MadeChoices);
    const Hierarchy = await HierarchyFromFile();
    await makeProbabilities(Hierarchy, HowManyToMake - MadeChoices.length);
    const allChoices = { AllImgProbabilities, AllImgAttributes, MadeChoices };

    return allChoices;
  } catch (err) {
    console.log(err);
  }
};

// choose();
