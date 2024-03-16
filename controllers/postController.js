import Post from '../Models/Post.js';
import User from '../Models/User.js';

export const home = async (req, res) => {
    const userId = req.user.id;
    const user = await User.findById(userId);
    let crosswordURL;
    if (user.crosswords.length > 0) {
        const firstCrosswordId = user.crosswords[0].crosswordId.toString();
        console.log("Crossword ID of the first crossword:", firstCrosswordId);
        crosswordURL = firstCrosswordId;
        res.redirect(`/crossword/${crosswordURL}`);
    } else {
        return res.redirect('/newCrossword');
    }
}

export const newCrossword = async (req, res) => {
    console.log("newCrossword");
    try {
        const userId = req.user.id;
        let user = await User.findById(userId);
        const theme = req.query.theme || 'baseball';
        const response = await fetch(`https://api.datamuse.com/words?rel_trg=${theme}`);
        const data = await response.json();
        const randomIndexes = generateRandomIndexes(data.length, 10);
        const randomWords = randomIndexes.map(index => data[index]);
        const grid = initializeGrid();
        randomWords.forEach(wordObj => placeWordInGrid(grid, wordObj.word));
        const wordArray = randomWords.map(wordObj => wordObj.word);
        
        const newCrossword = new Post({
            theme: theme,
            words: wordArray,
            grid: grid
        });
        await newCrossword.save();
        const crossword = await Post.findById(newCrossword._id);
        user = await User.findByIdAndUpdate(userId, {
            $push: {
                crosswords: {
                crosswordId: newCrossword._id,
                theme: theme,
                grid: grid,
                words: crossword.words,
                solved: false,
                }
            }
        }, { new: true });     
        
        res.redirect(`/crossword/${newCrossword._id}`);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send('Error');
    }
}

const generateRandomIndexes = (max, count) => {
    const indexes = new Set();
    while (indexes.size < count) {
        indexes.add(Math.floor(Math.random() * max));
    }
    return Array.from(indexes);
};

const initializeGrid = () => {
    return Array.from({ length: 20 }, () => Array(20).fill('-'));
};

const canPlaceWord = (grid, word, direction, startRow, startCol) => {
    const wordLength = word.length;

    if (direction === 'horizontal') {
        // Check if the word exceeds the grid width
        if (startCol + wordLength > 20) {
            return false;
        }

        // Check if any cell along the horizontal line is already occupied
        for (let i = 0; i < wordLength; i++) {
            if (grid[startRow][startCol + i] !== '-') {
                return false;
            }
        }
    } else {
        // Check if the word exceeds the grid height
        if (startRow + wordLength > 20) {
            return false;
        }

        // Check if any cell along the vertical line is already occupied
        for (let i = 0; i < wordLength; i++) {
            if (grid[startRow + i][startCol] !== '-') {
                return false;
            }
        }
    }

    return true;
};

const placeWordInGrid = (grid, word) => {
    console.log("placeWordInGrid")
    console.log(word);
    const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
    let startRow, startCol;

    do {
        startRow = Math.floor(Math.random() * 20);
        startCol = Math.floor(Math.random() * 20);
    } while (!canPlaceWord(grid, word, direction, startRow, startCol));

    if (direction === 'horizontal') {
        for (let i = 0; i < word.length; i++) {
            grid[startRow][startCol + i] = word[i].toUpperCase() + word.toUpperCase();
            console.log(word.toUpperCase());
        }
    } else {
        for (let i = 0; i < word.length; i++) {
            grid[startRow + i][startCol] = word[i].toUpperCase() + word.toUpperCase();
            console.log(word.toUpperCase())
        }
    }

    // After placing the word, update surrounding cells
    populateSurroundingCells(grid, startRow, startCol, word.length, direction === 'horizontal');
};

const populateSurroundingCells = (grid, startRow, startCol, length, horizontal) => {
    const rowStart = Math.max(startRow - 1, 0);
    const colStart = Math.max(startCol - 1, 0);
    const rowEnd = horizontal ? Math.min(startRow + 1, 19) : Math.min(startRow + length, 19);
    const colEnd = horizontal ? Math.min(startCol + length, 19) : Math.min(startCol + 1, 19);

    for (let i = rowStart; i <= rowEnd; i++) {
        for (let j = colStart; j <= colEnd; j++) {
            if (grid[i][j] === '-') {
                grid[i][j] = '?';
            }
        }
    }
};

export const loadCrossword = async (req, res) => {
    console.log("loadCrossword");
    try {
        const crosswordId = req.params.id;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        const crossword = user.crosswords.find(crossword => crossword.crosswordId.toString() === crosswordId);
        if (!crossword) {
            return res.redirect('/newCrossword');
        }
        const grid = crossword.grid;
        console.log(grid);
        const theme = crossword.theme;
        const words = crossword.words;
        const wordsFound = crossword.wordsFound;
        let solved = crossword.solved;
        console.log(wordsFound);

        const allWordsFound = words.every(word => wordsFound.includes(word));
        if (allWordsFound) {
            console.log("All words found!");
            solved = true;
        }


        res.render('posts/index', { data: words, grid: grid, theme, user, crosswordId, solved, wordsFound });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send('Error');
    }
};

export const submitWord = async (req, res) => {
    try {
        console.log(req.body);
        const userId = req.user.id;
        const user = await User.findById(userId);
        const crosswordId = req.body.crosswordId;
        console.log(req.body.crosswordId)
        const workingCrossword = await user.crosswords.find(crossword => crossword.crosswordId.toString() === req.body.crosswordId);
        console.log(workingCrossword);
        console.log(req.body.selectedWord.toLowerCase());
        const selectedWord = req.body.selectedWord.toLowerCase();
        if (workingCrossword.words.includes(selectedWord)) {
            if (workingCrossword.wordsFound.includes(selectedWord)) {
                console.log("You have already found this word");
                return;
                //FLASH MESSAGE YOU HAVE ALREADY FOUND THIS WORD
            } else {
                workingCrossword.wordsFound.push(selectedWord); // Push selectedWord to wordsFound array
                await user.save();
                console.log("word saved to wordsFound");
            }
        } else {
            console.log("Error: Word not found in word bank")
        }
        res.redirect(`/crossword/${crosswordId}`)
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send('Error');
    }
};