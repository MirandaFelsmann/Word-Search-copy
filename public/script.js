submitWordButton = document.getElementById("submitWord");
wordList = document.getElementById("wordList");
wordsFound = document.getElementById("wordsFoundList");

submitWordButton.addEventListener('click', function() {
    selectedWord = document.getElementById("selectedWord").value.trim(); // Trim whitespace from input
    listItems = wordList.querySelectorAll("ul li");

    // Check if the selected word exists in the word list
    let found = false;
    listItems.forEach(function(item) {
        if (item.textContent.trim() === selectedWord) {
            found = true;
            return;
        }
    });

    // If the word is found, show flash message and clear input
    if (found) {
        flashMessage("Word found: " + selectedWord);
        // Clear input field after a short delay
        setTimeout(function() {
            document.getElementById('selectedWord').value = '';
        }, 1000);

        // Apply strikethrough effect to the found word in the "Words to Find" box
        listItems.forEach(function(item) {
            if (item.textContent.trim() === selectedWord) {
                item.classList.add('strikethrough');
            }
        });
    }
});

function flashMessage(message) {
    // Create a message element
    const messageElement = document.createElement('div');
    messageElement.classList.add('flash-message');
    messageElement.textContent = message;

    // Append the message element to the body
    document.body.appendChild(messageElement);

    // Remove the message element after a short delay
    setTimeout(function() {
        messageElement.remove();
    }, 2000);
}

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
        document.getElementById(cellId).style.backgroundColor = 'transparent';
    });
    selectedCells = [];
    document.getElementById('selectedWord').value = '';
}

async function updateWordsFound() {
    foundListItems = wordsFound.querySelectorAll("ul li");
    foundListItems.forEach(function(item) {
        itemWord = item.textContent.toUpperCase();
        foundWord = document.querySelectorAll("." + itemWord);
        foundWord.forEach(function(element) {
            element.style.backgroundColor = "pink";
        });
    });
}

updateWordsFound();
