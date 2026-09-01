const gameData = [
  { letter: "I", answer: "MARI" },
  { letter: "N", answer: "GERMINALAB" },
  { letter: "E", answer: "POLIMETAS" },
  { letter: "A", answer: "IRRIGAMAX" },
  { letter: "G", answer: "POTIGUAR" },
  { letter: "R", answer: "MORTA" },
  { letter: "O", answer: "PÊLO" },
  { letter: "D", answer: "COMPUTADOR" },
];

const gridElement = document.getElementById("acrostic-grid");
const letterBoxElement = document.getElementById("letter-box");
const feedbackElement = document.getElementById("feedback");

let draggedElement = null;

function createEmptySpacer() {
  const spacer = document.createElement("div");
  spacer.classList.add("cell", "spacer");
  return spacer;
}

function createFixedLetter(letter) {
  const fixed = document.createElement("div");
  fixed.classList.add("cell", "acrostic-letter");
  fixed.textContent = letter;
  return fixed;
}

function returnLetterToBox(e) {
  const cell = e.currentTarget;

  if (cell.textContent) {
    const letter = cell.textContent;
    const returnedLetterTile = createDraggableLetter(letter);

    letterBoxElement.appendChild(returnedLetterTile);

    cell.textContent = "";

    cell.style.backgroundColor = "";
  }
}

function createDropCell(rowIndex, cellIndex, side) {
  const cell = document.createElement("div");
  cell.classList.add("cell", "droppable");
  cell.setAttribute("data-row", rowIndex);
  cell.setAttribute("data-col", cellIndex);

  cell.addEventListener("dragover", (e) => e.preventDefault());
  cell.addEventListener("dragenter", (e) => cell.classList.add("drag-over"));
  cell.addEventListener("dragleave", (e) => cell.classList.remove("drag-over"));
  cell.addEventListener("drop", handleDrop);

  cell.addEventListener("click", returnLetterToBox);

  return cell;
}

function setupGame() {
  let allLetters = [];
  let centralLetters = [];
  gridElement.innerHTML = "";

  let maxCharsBeforePivot = 0;
  let maxCharsAfterPivot = 0;

  gameData.forEach((item) => {
    const answer = item.answer.toUpperCase();
    const pivotIndex = answer.indexOf(item.letter.toUpperCase());
    if (pivotIndex !== -1) {
      maxCharsBeforePivot = Math.max(maxCharsBeforePivot, pivotIndex);
      maxCharsAfterPivot = Math.max(maxCharsAfterPivot, answer.length - pivotIndex - 1);
    }
  });

  const PIVOT_COLUMN_INDEX = maxCharsBeforePivot + 1;
  const totalColumns = maxCharsBeforePivot + 1 + maxCharsAfterPivot;

  gridElement.style.gridTemplateColumns = `repeat(${totalColumns}, 35px)`;

  console.log(`Calculated PIVOT_COLUMN_INDEX: ${PIVOT_COLUMN_INDEX}`);
  console.log(`Max chars before pivot: ${maxCharsBeforePivot}, Max chars after pivot: ${maxCharsAfterPivot}`);
  console.log(`Total columns in grid: ${totalColumns}`);

  gameData.forEach((item, index) => {
    const answer = item.answer.toUpperCase();
    const rowNumber = index + 1;

    const inWhichIndexTheLetterIsInTheAnswer = answer.indexOf(item.letter);
    console.log(`Row ${rowNumber}: Letter '${item.letter}' at index ${inWhichIndexTheLetterIsInTheAnswer} in answer '${answer}'`);

    let wordStartingGridColumn = PIVOT_COLUMN_INDEX - inWhichIndexTheLetterIsInTheAnswer;
    console.log(`Row ${rowNumber}: Word starting grid column calculated as ${wordStartingGridColumn}`);

    const emptyCellsCount = wordStartingGridColumn - 1;

    allLetters = allLetters.concat(Array.from(answer));

    centralLetters.push(item.letter);

    for (let col = 1; col <= emptyCellsCount; col++) {
      const spacer = createEmptySpacer();
      spacer.style.setProperty("--start-col", col);
      spacer.style.setProperty("--start-row", rowNumber);
      gridElement.appendChild(spacer);
    }

    for (let charIndex = 0; charIndex < answer.length; charIndex++) {
      const currentLetter = answer[charIndex];
      const currentGridColumn = wordStartingGridColumn + charIndex;

      if (charIndex === inWhichIndexTheLetterIsInTheAnswer) {
        const fixedLetter = createFixedLetter(currentLetter);
        fixedLetter.style.setProperty("--start-col", currentGridColumn);
        fixedLetter.style.setProperty("--start-row", rowNumber);
        gridElement.appendChild(fixedLetter);
      } else {
        const dropCell = createDropCell(index, charIndex, "horizontal");
        dropCell.style.setProperty("--start-col", currentGridColumn);
        dropCell.style.setProperty("--start-row", rowNumber);
        gridElement.appendChild(dropCell);
      }
    }
  });

  const lettersToFilter = centralLetters.map((l) => l.toUpperCase());

  let finalLetters = [];
  let excludedCount = 0;

  allLetters.forEach((letter) => {
    const indexToExclude = lettersToFilter.indexOf(letter);
    if (indexToExclude !== -1) {
      lettersToFilter.splice(indexToExclude, 1);
      excludedCount++;
    } else {
      finalLetters.push(letter);
    }
  });

  shuffleArray(finalLetters).forEach((letter) => {
    letterBoxElement.appendChild(createDraggableLetter(letter));
  });
}

function createDraggableLetter(letter) {
  const tile = document.createElement("div");
  tile.classList.add("letter-tile");
  tile.textContent = letter;
  tile.setAttribute("draggable", true);
  tile.addEventListener("dragstart", handleDragStart);
  return tile;
}

function handleDragStart(e) {
  draggedElement = e.target;
  e.dataTransfer.setData("text/plain", e.target.textContent);
  e.dataTransfer.effectAllowed = "move";
  setTimeout(() => e.target.classList.add("hidden"), 0);
}

function handleDrop(e) {
  e.preventDefault();
  e.target.classList.remove("drag-over");
  if (e.target.classList.contains("droppable") && draggedElement) {
    if (e.target.textContent) {
      const returnedLetter = createDraggableLetter(e.target.textContent);
      letterBoxElement.appendChild(returnedLetter);
    }
    e.target.textContent = draggedElement.textContent;
    draggedElement.remove();
    draggedElement = null;
  } else {
    if (draggedElement) {
      draggedElement.classList.remove("hidden");
      draggedElement = null;
    }
  }
}

document.addEventListener("dragend", () => {
  if (draggedElement) {
    draggedElement.classList.remove("hidden");
    draggedElement = null;
  }
});

function checkAnswers() {
  let allCorrect = true;

  const rootStyle = getComputedStyle(document.documentElement);
  const correctBg = rootStyle.getPropertyValue("--correct-color");
  const errorBg = rootStyle.getPropertyValue("--error-color");
  const cellEmptyColor = rootStyle.getPropertyValue("--cell-empty-color");

  gameData.forEach((item, index) => {
    const rowCells = gridElement.querySelectorAll(`.droppable[data-row="${index}"]`);
    let playerWord = "";

    const sortedCells = Array.from(rowCells).sort((a, b) => {
      return parseInt(a.getAttribute("data-col")) - parseInt(b.getAttribute("data-col"));
    });

    sortedCells.forEach((cell) => {
      playerWord += cell.textContent || "";
    });

    const centralIndex = item.answer.toUpperCase().indexOf(item.letter);

    const fullPlayerWord = playerWord.substring(0, centralIndex) + item.letter + playerWord.substring(centralIndex);

    if (fullPlayerWord === item.answer.toUpperCase()) {
      rowCells.forEach((cell) => {
        cell.style.backgroundColor = correctBg;
      });
    } else {
      rowCells.forEach((cell) => {
        cell.style.backgroundColor = errorBg;
        setTimeout(() => (cell.style.backgroundColor = cellEmptyColor), 1500);
      });
      allCorrect = false;
    }
  });

  if (allCorrect) {
    feedbackElement.textContent = "Parabéns! Acróstico completo com sucesso!";
    feedbackElement.className = "correct";
  } else {
    feedbackElement.textContent = "Ainda há letras incorretas. Tente novamente!";
    feedbackElement.className = "incorrect";
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

setupGame();
