interface WordPosition {
  x: number;
  y: number;
  direction: "across" | "down";
  number: number;
}

interface CrosswordResult {
  grid: string[][];
  wordPositions: WordPosition[];
}

export function generateCrossword(words: string[]): CrosswordResult {
  // Sort words by length (longest first)
  const sortedWords = [...words].sort((a, b) => b.length - a.length);
  
  // Initialize grid size based on longest word
  const size = Math.max(...words.map(w => w.length)) + 2;
  const grid: string[][] = Array(size).fill(null)
    .map(() => Array(size).fill(''));
  
  const wordPositions: WordPosition[] = [];
  let wordNumber = 1;

  // Place first word horizontally in middle
  const firstWord = sortedWords[0];
  const middleRow = Math.floor(size / 2);
  const startCol = Math.floor((size - firstWord.length) / 2);
  
  for (let i = 0; i < firstWord.length; i++) {
    grid[middleRow][startCol + i] = firstWord[i];
  }
  
  wordPositions.push({
    x: startCol,
    y: middleRow,
    direction: "across",
    number: wordNumber++
  });

  // Try to place remaining words
  for (let i = 1; i < sortedWords.length; i++) {
    const word = sortedWords[i];
    let placed = false;

    // Try to find intersections with placed words
    for (let row = 0; row < size && !placed; row++) {
      for (let col = 0; col < size && !placed; col++) {
        if (grid[row][col] !== '') {
          // Try placing vertically
          if (canPlaceWordVertically(grid, word, row, col)) {
            placeWordVertically(grid, word, row, col);
            wordPositions.push({
              x: col,
              y: row - word.indexOf(grid[row][col]),
              direction: "down",
              number: wordNumber++
            });
            placed = true;
          }
          // Try placing horizontally
          else if (canPlaceWordHorizontally(grid, word, row, col)) {
            placeWordHorizontally(grid, word, row, col);
            wordPositions.push({
              x: col - word.indexOf(grid[row][col]),
              y: row,
              direction: "across",
              number: wordNumber++
            });
            placed = true;
          }
        }
      }
    }
  }

  return { grid, wordPositions };
}

function canPlaceWordVertically(
  grid: string[][],
  word: string,
  row: number,
  col: number
): boolean {
  const letter = grid[row][col];
  const index = word.indexOf(letter);
  if (index === -1) return false;

  const startRow = row - index;
  if (startRow < 0 || startRow + word.length > grid.length) return false;

  for (let i = 0; i < word.length; i++) {
    if (grid[startRow + i][col] !== '' && 
        grid[startRow + i][col] !== word[i]) {
      return false;
    }
  }
  return true;
}

function canPlaceWordHorizontally(
  grid: string[][],
  word: string,
  row: number,
  col: number
): boolean {
  const letter = grid[row][col];
  const index = word.indexOf(letter);
  if (index === -1) return false;

  const startCol = col - index;
  if (startCol < 0 || startCol + word.length > grid[0].length) return false;

  for (let i = 0; i < word.length; i++) {
    if (grid[row][startCol + i] !== '' && 
        grid[row][startCol + i] !== word[i]) {
      return false;
    }
  }
  return true;
}

function placeWordVertically(
  grid: string[][],
  word: string,
  row: number,
  col: number
) {
  const index = word.indexOf(grid[row][col]);
  const startRow = row - index;
  
  for (let i = 0; i < word.length; i++) {
    grid[startRow + i][col] = word[i];
  }
}

function placeWordHorizontally(
  grid: string[][],
  word: string,
  row: number,
  col: number
) {
  const index = word.indexOf(grid[row][col]);
  const startCol = col - index;
  
  for (let i = 0; i < word.length; i++) {
    grid[row][startCol + i] = word[i];
  }
}
