submitWordButton = document.getElementById("submitWord");
wordList = document.getElementById("wordList");
wordsFound = document.getElementById("wordsFoundList");

submitWordButton.addEventListener('click', function() {
    selectedWord = document.getElementById("selectedWord").value;
        // Get all list items under the wordList
    listItems = wordList.querySelectorAll("ul li");
        // Iterate through each list item
    listItems.forEach(function(item) {
        // Check if the text content matches the selectedWord
        if (item.value === selectedWord.trim()) {
            console.log("good job");
            // Exit the loop if a match is found
            return;
        }
    });
});
    
let selectedCells = [];
let currentWord = '';
function selectLetter(rowIndex, colIndex, letter) {
    const cellId = `cell-${rowIndex}-${colIndex}`;
    const lastSelectedCell = selectedCells[selectedCells.length - 1];
        
    if (lastSelectedCell && isAdjacent(lastSelectedCell, { rowIndex, colIndex })) {
        selectedCells.push({ rowIndex, colIndex, letter });
        document.getElementById(cellId).style.backgroundColor = 'lightblue';
        document.getElementById('selectedWord').value += letter;
    } else {
        clearSelection();
        selectedCells.push({ rowIndex, colIndex, letter });
        document.getElementById(cellId).style.backgroundColor = 'lightblue';
        document.getElementById('selectedWord').value = letter;
    }
}

function isAdjacent(cell1, cell2) {
    const rowDiff = Math.abs(cell1.rowIndex - cell2.rowIndex);
    const colDiff = Math.abs(cell1.colIndex - cell2.colIndex);
    return (rowDiff <= 1 && colDiff <= 1);
}
    
function clearSelection() {
    selectedCells.forEach(cell => {
        const cellId = `cell-${cell.rowIndex}-${cell.colIndex}`;
        document.getElementById(cellId).style.backgroundColor = 'white';
    });
    selectedCells = [];
    document.getElementById('selectedWord').value = '';
}

async function updateWordsFound() {
    console.log("hey")
    foundListItems = wordsFound.querySelectorAll("ul li");
    foundListItems.forEach(function(item) {
        console.log(item.textContent);
        itemWord = item.textContent.toUpperCase();
        foundWord = document.querySelectorAll("." + itemWord); // Select elements with class name equal to itemWord
        foundWord.forEach(function(element) { // Loop through foundWord elements
            element.style.backgroundColor = "red"; // Apply red background color
        });
    });
}

    
    
updateWordsFound();