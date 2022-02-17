var items = [
  { name: "thirty%", rarity: 30 },
  { name: "twenty%", rarity: 20 },
  { name: "ten%", rarity: 10 },
  { name: "none", rarity: 100 },
  { name: "none2", rarity: 100 },
];

const makeACopyOfObj = (obj) => {
  const clone = JSON.parse(JSON.stringify(obj));
  return clone;
};

const makeACopyOfArray = (array) => {
  var ObjCopy = makeACopyOfObj({ data: array });
  var clone = ObjCopy.data;
  return clone;
};

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

export const weightedChoose = (items) => {
  // choose a random int less than 100 ./ "fact"
  const fact = Math.floor(Math.random() * 100);
  // make a smaller item's list to choose from./  "possibleChoices"
  const possibleChoices = [];
  // compare each item's rarity with "fact" and if it's higher than the "fact", => push.
  for (const item of items) {
    if (item.rarity >= fact) possibleChoices.push(item);
  }
  // make arandom choice from "possibleChoices".
  console.log(randomChoice(possibleChoices));
  return randomChoice(possibleChoices);
};

// weightedChoose(items);
