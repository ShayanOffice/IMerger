
var items = [
  { name: 'thirty%', rarity: 30 },
  { name: 'twenty%', rarity: 20 },
  { name: 'ten%', rarity: 10 },
  { name: 'none', rarity: 100 },
  { name: 'none2', rarity: 100 },
];



const makeRarityRanksList = (arrayOfItems = []) => {
  var sortedItems = makeACopyOfArray(arrayOfItems);
  sortedItems.sort((a, b) => {
    return a.rarity - b.rarity;
  });
  const rarityRanks = [];
  for (const i of sortedItems) {
    if (!rarityRanks.includes(i.rarity)) rarityRanks.push(i.rarity);
  }
  return rarityRanks;
};

const randomChoice = (array) => {
  const rndI = Math.floor(Math.random() * array.length);
  // console.log(array[rndI]);
  return array[rndI];
};

export const weightedChoose = (hierarchies, blackList = undefined) => {
  let listToWorkWith = [];
  if (blackList && blackList.length > 0) {
    for (const hr of hierarchies) {
      if (!blackList.includes(hr.metaName)) listToWorkWith.push(hr);
    }
  } else {
    listToWorkWith = hierarchies;
  }
  // choose a random int less than 100 ./ "fact"
  const fact = Math.floor(Math.random() * 100);
  // make a smaller item's list to choose from./  "possibleChoices"
  const possibleChoices = [];
  // compare each item's rarity with "fact" and if it's higher than the "fact", => push.
  let highestRarity = 0;
  for (const item of listToWorkWith) {
    if (item.rarity > highestRarity) highestRarity = item.rarity;
    if (!item.rarity) item.rarity = 100;
    if (item.rarity >= fact) possibleChoices.push(item);
  }

  // if by accident a folder doesnt contain any item with derault(100) rarity possibility, use the items with the highest rate:
  if (highestRarity < 100) {
    for (const item of listToWorkWith) {
      if (item.rarity === highestRarity) possibleChoices.push(item);
    }
  }
  // make a random choice from "possibleChoices".
  return randomChoice(possibleChoices);
};

// weightedChoose(items);
