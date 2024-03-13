import Post from '../Models/Post.js';
import User from '../Models/User.js';

const generateRandomIndexes = (max, count) => {
  const indexes = new Set();
  while (indexes.size < count) {
    indexes.add(Math.floor(Math.random() * max));
  }
  return Array.from(indexes);
};

const initializeGrid = () => {
    const grid = [];
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < 15; i++) {
        const row = [];
        for (let j = 0; j < 15; j++) {
            row.push('');
        }
        grid.push(row);
    }
    return grid;
};

const canPlaceWord = (grid, word, direction, startRow, startCol) => {
    if (direction === 'horizontal') {
        if (startCol + word.length > 15) {
            return false;
        }
        for (let i = 0; i < word.length; i++) {
            if (grid[startRow][startCol + i] !== '' || (startRow > 0 && grid[startRow - 1][startCol + i] !== '') || (startRow < 14 && grid[startRow + 1][startCol + i] !== '')) {
                return false;
            }
        }
    } else {
        if (startRow + word.length > 15) {
            return false;
        }
        for (let i = 0; i < word.length; i++) {
            if (grid[startRow + i][startCol] !== '' || (startCol > 0 && grid[startRow + i][startCol - 1] !== '') || (startCol < 14 && grid[startRow + i][startCol + 1] !== '')) {
                return false;
            }
        }
    }
    return true;
};

const placeWordInGrid = (grid, word, direction, startRow, startCol) => {
    if (direction === 'horizontal') {
        for (let i = 0; i < word.length; i++) {
            grid[startRow][startCol + i] = word[i].toUpperCase();
        }
    } else {
        for (let i = 0; i < word.length; i++) {
            grid[startRow + i][startCol] = word[i].toUpperCase();
        }
    }
};

const fillEmptySlotsWithRandomLetters = (grid) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            if (grid[i][j] === '') {
                const randomLetterIndex = Math.floor(Math.random() * alphabet.length);
                grid[i][j] = alphabet[randomLetterIndex];
            }
        }
    }
};

export const createCrossword = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        const theme = req.query.theme || 'baseball';
        const response = await fetch(`https://api.datamuse.com/words?rel_trg=${theme}`);
        const data = await response.json();
        const randomIndexes = generateRandomIndexes(data.length, 10);
        const randomWords = randomIndexes.map(index => data[index].word);
        
        const grid = initializeGrid();
        const placedWords = [];

        for (const word of randomWords) {
            let direction, startRow, startCol;
            let canPlace = false;

            while (!canPlace) {
                direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
                startRow = Math.floor(Math.random() * 15);
                startCol = Math.floor(Math.random() * 15);

                canPlace = canPlaceWord(grid, word, direction, startRow, startCol);

                if (canPlace) {
                    placeWordInGrid(grid, word, direction, startRow, startCol);
                    placedWords.push({ word, direction, startRow, startCol });
                }
            }
        }

        fillEmptySlotsWithRandomLetters(grid); // Fill empty slots with random letters
        const gridData = grid.map((row, rowIndex) => {
    return row.map((cell, colIndex) => {
        const isPartOfWord = placedWords.some(wordData => {
            if (wordData.direction === 'horizontal') {
                return rowIndex === wordData.startRow && colIndex >= wordData.startCol && colIndex < wordData.startCol + wordData.word.length;
            } else {
                return colIndex === wordData.startCol && rowIndex >= wordData.startRow && rowIndex < wordData.startRow + wordData.word.length;
            }
        });

        const wordClass = isPartOfWord ? `word-${placedWords.find(wordData => {
            if (wordData.direction === 'horizontal') {
                return rowIndex === wordData.startRow && colIndex >= wordData.startCol && colIndex < wordData.startCol + wordData.word.length;
            } else {
                return colIndex === wordData.startCol && rowIndex >= wordData.startRow && rowIndex < wordData.startRow + wordData.word.length;
            }
        }).word}` : '';

        return {
            letter: cell,
            isPartOfWord: isPartOfWord,
            wordClass: wordClass
        };
    });
});


        res.render('posts/index', { user, theme, data: randomWords, grid: gridData });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send('Error fetching data');
    }
};

export const saveCrosswordToProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const theme = req.body.theme;
        const grid = req.body.grid;
        const words = req.body.words;

        const newCrossword = new Post({
            theme: theme,
            words: words,
            grid: grid
        });

        await newCrossword.save();

        const user = await User.findByIdAndUpdate(userId, {
            $push: {
                crosswords: {
                    crosswordId: newCrossword._id,
                    theme: theme,
                    grid: grid,
                    words: words
                }
            }
        }, { new: true });

        res.redirect('/');
    } catch (error) {
        console.error("Error saving crossword:", error);
        res.status(500).send('Error saving crossword');
    }
};

export const loadCrossword = async (req, res) => {
    try {
        const crosswordId = req.params.id;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        const crossword = user.crosswords.find(crossword => crossword.crosswordId.toString() === crosswordId);
        if (!crossword) {
            return res.status(404).send('Crossword not found');
        }
        const grid = crossword.grid;
        const theme = crossword.theme;
        const words = crossword.words;
        res.render('posts/index', { data: words, grid: grid, theme, user });
    } catch (error) {
        console.error("Error loading crossword:", error);
        res.status(500).send('Error loading crossword');
    }
};
