figma.showUI(__html__, { height: 180, width: 180 });

let shiftEnabled = false;
let newCharacter = true;

const t9Mapping = [
  [" ", ".", "!", "?", "0"],
  ["1"],
  ["a", "b", "c", "2"],
  ["d", "e", "f", "3"],
  ["g", "h", "i", "4"],
  ["j", "k", "l", "5"],
  ["m", "n", "o", "6"],
  ["p", "q", "r", "s", "7"],
  ["t", "u", "v", "8"],
  ["w", "x", "y", "z", "9"],
];

let timeout;

figma.ui.on("message", (event) => {
  if (event.type === "NUMBER") {
    if (event.number === "backspace") {
      handleBackspace();
    } else if (event.number === "shift") {
      handleShift();
    } else {
      handleNumber(event.number);
    }
  }
});

async function handleNumber(number) {
  const node = await currentTextNode();
  if (!node) return;
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    newCharacter = true;
  }, 1000);
  node.characters = fillString(node.characters, number);
  newCharacter = false;
}

function fillString(characters, number) {
  const lastCharacter = characters.length
    ? characters.charAt(characters.length - 1)
    : "";
  if (lastCharacter) {
    // is it of the number or do we move to next index.
    const index = t9Mapping[number].indexOf(lastCharacter.toLowerCase());
    if (index !== -1 && !newCharacter) {
      return (
        characters.substring(0, characters.length - 1) +
        shiftIt(characterForNumberAtIndex(number, index + 1))
      );
    } else {
      return characters + shiftIt(characterForNumberAtIndex(number, 0));
    }
  } else {
    return characters + shiftIt(characterForNumberAtIndex(number, 0));
  }
}

function shiftIt(string) {
  if (shiftEnabled) return string.toUpperCase();
  return string.toLowerCase();
}

function characterForNumberAtIndex(number, index) {
  const item = t9Mapping[number];
  return item[index % item.length];
}

async function handleShift() {
  const node = await currentTextNode();
  if (!node) return;
  const characters = node.characters;
  shiftEnabled = !shiftEnabled;
  const lastCharacter = characters.length
    ? characters.charAt(characters.length - 1)
    : "";
  if (lastCharacter && !newCharacter) {
    node.characters =
      characters.substring(0, characters.length - 1) + shiftIt(lastCharacter);
  }
}

async function handleBackspace() {
  const node = await currentTextNode();
  if (!node) return;
  const characters = node.characters.split("");
  if (characters.length) {
    characters.pop();
    node.characters = characters.join("");
  }
}

async function currentTextNode() {
  const node = figma.currentPage.selection.find((node) => node.type === "TEXT");
  if (node) {
    // await loading fonts...
    await figma.loadFontAsync(node.fontName);
  }
  return node;
}
