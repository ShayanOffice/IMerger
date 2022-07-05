import sha1 from 'sha1';
import { HowManyToMake } from '../config.js';
import {
  HierarchyFromFile,
  MadeChoicesFromFile,
  MakeACopyOfObj,
  MakeACopyOfArray,
} from './fileHandler.js';
import { parseMetaAttribute } from './stringParser.js';
import { weightedChoose } from './weightedChooser.js';
let AllImgProbabilities = [];
let AllMaskedNames = [];
let AllImgAttributes = [];
let MadeChoices = [];
let UnwrittenChoiceHashes = [];
let PreGenChoicesArray;
let preChoiceCurrentIndex = 0;

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
  currentMask,
  parentHueVariant,
  isUnhued = false,
  ignoreMeta = false
) => {
  var currentHueVariant;
  if (ignoreMeta) Hierarchy.ignoreMeta = true;
  if (!Hierarchy?.extension) {
    // it's a folder entry

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
    /////////////////////HandleMasks//////////////////////
    if (Hierarchy?.masks) {
      // console.log(Hierarchy.masks);
      currentMask = Hierarchy.masks;
      for (const name of Object.keys(currentMask)) {
        if (!AllMaskedNames.includes(name)) AllMaskedNames.push(name);
      }
    }
    ////////////////////////////////////////////////////////

    if (Hierarchy?.orderedChildren.length > 0) {
      const remember = Hierarchy?.remember;
      let blacklist = [];
      if (remember) {
        for (const mapping of remember.mappings) {
          if (mapping.autoMapByName) {
            console.error(
              'Hierarchy "' +
                Hierarchy.address +
                '"is with Ordered Children; thus it Can\'t Have autoMapByName=true.'
            );
          } else if (mapping.whiteList) {
            console.error(
              'Hierarchy "' +
                Hierarchy.address +
                '"is with Ordered Children; thus it Can\'t Have whitelist mappings.'
            );
          } else {
            for (const targetTraitName of mapping.chosenTraits) {
              for (const trait of CurrentIterTraits) {
                // Check if target was in our selection array
                if (trait.metaName === targetTraitName) {
                  blacklist = blacklist.concat(mapping.blacklist);
                }
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
            currentMask,
            currentHueVariant,
            isUnhued,
            Hierarchy.ignoreMeta
          );
    } else if (Hierarchy?.switchableChildren.length > 0) {
      // if it has switchable children
      let chosenHR = undefined;

      const remember = Hierarchy?.remember;
      let blacklist = [];
      let finalList = Hierarchy.switchableChildren;
      if (remember) {
        // console.log(remember);
        for (const mapping of remember.mappings) {
          if (mapping.autoMapByName) {
            // get selected child
            for (const targetTraitName of mapping.chosenTraits) {
              for (const t of CurrentIterTraits) {
                const traitParentName = t.address.replace(/.*\/(.+)\/.*/, `$1`);
                if (traitParentName === targetTraitName) {
                  // t is the selected child
                  // select the child with the same name.
                  for (const hr of Hierarchy.switchableChildren) {
                    if (hr.metaName === t.metaName) chosenHR = hr;
                  }
                }
              }
            }
          } else {
            for (const targetTraitName of mapping.chosenTraits) {
              for (const trait of CurrentIterTraits) {
                // Check if target was in our selection array then use this mapping.
                // console.log(trait.metaName);
                if (trait.metaName === targetTraitName) {
                  if (mapping.blacklist.length > 0)
                    blacklist = blacklist.concat(mapping.blacklist);
                  else if (mapping.whitelist.length > 0) {
                    for (let i = 0; i < finalList.length; i++) {
                      const child = finalList[i];
                      var isInWL = false;
                      for (const wlName of mapping.whitelist) {
                        if (wlName === child.metaName) {
                          isInWL = true;
                          break;
                        }
                      }
                      // if child wasn't in WL after we searched inside it.
                      if (!isInWL) {
                        console.log('removed', child.metaName);
                        finalList.splice(i, 1);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      // look for matching address inside of PreGenChoicesArray[preChoiceCurrentIndex] for each of childHRs
      for (const chosenImgTraits of PreGenChoicesArray[preChoiceCurrentIndex]) {
        // console.log(PreGenChoicesArray);
        for (const chosenTrait of chosenImgTraits) {
          for (const childHR of Hierarchy.switchableChildren) {
            if (chosenTrait.address.includes(childHR.address)) {
              // if found at least one, force select that child
              console.log(chosenTrait.address);
              chosenHR = childHR;
              break;
            }
          }
        }
      }

      // choose childHr if it wasn't force Chosen.
      if (!chosenHR) chosenHR = weightedChoose(finalList, blacklist);

      await handleAttributeAndIterate(chosenHR, currentMask);
    } else {
      console.error('Given Hierarchy "' + Hierarchy.address + '" is Empty');
      return;
    }
  } else {
    //it's a file entry

    /////////////////////HandleVariant//////////////////////
    if (!isUnhued) {
      if (parentHueVariant.hue) Hierarchy.hueVariant = parentHueVariant;
    }

    
    for (const chosenImgTraits of PreGenChoicesArray[preChoiceCurrentIndex]) {
      for (const chosenTrait of chosenImgTraits) {
        if (chosenTrait.address.includes(chosenTrait.address)) {
          // if found at least one, force select that child
          console.log(chosenTrait.address);
          Hierarchy.hueVariant = chosenTrait.hueVariant;
          break;
        }
      }
    }
    /////////////////////HandleMask//////////////////////
    if (currentMask) Hierarchy.masks = currentMask;
    // console.log(currentMask);
    // add attrib.
    if (!Hierarchy.ignoreMeta) {
      const attrib = parseMetaAttribute(Hierarchy);
      if (!ContainsAttrib(CurrentImgAttributes, attrib) && attrib)
        CurrentImgAttributes.push(attrib);
    }
    await CurrentIterTraits.push(Hierarchy);
  }

  async function handleAttributeAndIterate(childHr, currentMask) {
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
      currentMask,
      currentHueVariant,
      isUnhued,
      Hierarchy.ignoreMeta
    );
  }
};

const makeProbabilities = async (rootHierarchy, Count) => {
  let currentImgTraits = [];
  let currentImgAttributes = [];
  while (preChoiceCurrentIndex < Count) {
    currentImgTraits = [];
    currentImgAttributes = [];
    let emptyHue = {};
    //make a copy so we don't touch the main object referenced.
    const defH = await MakeACopyOfObj(rootHierarchy);

    await iterateAndSelectTraits(
      defH,
      currentImgTraits,
      currentImgAttributes,
      defH.masks,
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
      preChoiceCurrentIndex++;
    }
  }
};

export const choose = async (PreGenImgsArray) => {
  try {
    PreGenChoicesArray = PreGenImgsArray;
    // read already made probs if any
    const obj = await MadeChoicesFromFile();
    MadeChoices = obj.data;
    console.log(MadeChoices);
    const Hierarchy = await HierarchyFromFile();
    await makeProbabilities(Hierarchy, PreGenChoicesArray.length);

    // console.log(AllImgProbabilities);
    const allChoices = {
      AllImgProbabilities,
      AllImgAttributes,
      MadeChoices,
      AllMaskedNames,
    };
    // console.table(AllMaskedNames);
    return allChoices;
  } catch (err) {
    console.log(err);
  }
};

// choose();
// 88966131-9 ( dakheli 401 402) azimi Italya Felestin
// 677942
