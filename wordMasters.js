document.addEventListener("DOMContentLoaded", async () => {
    let wordOfTheDay = '';
    let puzzleNumber = '';
    let wordSent = '';
    let isValid = '';
    let bannerTimeout; // tracks current hide timeout
    
    // Example usage of the banner:
    // showBanner("Welcome to Word Masters!"); // for testing - default is not working
    showBanner("Welcome to Word Masters!", "success");
    // showBanner("Welcome to Word Masters!", "error"); // for testing
    // showBanner("Welcome to Word Masters!", "info"); // for testing

    await fetchWordOfTheDay(); // Fetch the word of the day on page load

    async function fetchWordOfTheDay() {
        try {
            const response = await fetch('https://words.dev-apis.com/word-of-the-day');
            const data = await response.json();
            wordOfTheDay = data.word; // I will need this word to compare against it!
            puzzleNumber = data.puzzleNumber;
            console.log('Word of the day: ', wordOfTheDay);
            console.log('Puzzle Number: ', puzzleNumber);
        } catch (error) {
            console.error('Error fetching word of the day:', error);
            showBanner("Error: Failed to fetch the word of the day.", "error");
        }
    }

    function isLetter(letter) {
        return /^[a-zA-Z]$/.test(letter);
    } //  checks if a string is a single alphabetical letter

    function highlightRow(inputs, wordSent, wordOfTheDay) {
        const wordLetters = wordOfTheDay.toLowerCase().split('');
        const sentLetters = wordSent.toLowerCase().split('');
        const usedIndexes = []; // Track letters already matched for green
    
        // First pass: mark correct letters (green)
        inputs.forEach((input, index) => {
            input.classList.remove("correct", "partial", "wrong"); // reset
            if (sentLetters[index] === wordLetters[index]) {
                input.classList.add("correct");
                usedIndexes.push(index); // mark this index as used
            }
        });
    
        // Second pass: mark partial letters (yellow) and wrong (gray)
        inputs.forEach((input, index) => {
            if (input.classList.contains("correct")) return; // skip already green
            const letter = sentLetters[index];
            // find an unused index in wordLetters that matches
            const partialIndex = wordLetters.findIndex((l, i) => l === letter && !usedIndexes.includes(i));
            if (partialIndex !== -1) {
                input.classList.add("partial"); // yellow
                usedIndexes.push(partialIndex); // mark as used
            } else {
                input.classList.add("wrong"); // gray
            }
        });
    }       

    async function validateTheWord(word) {
        try {
            showSpinner(); // start spinner while waiting
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate slow API (10 seconds delay) for testing spinner

            const response = await fetch('https://words.dev-apis.com/validate-word', {
                method:'POST',
                body:JSON.stringify({word: word}), // need to update wordSent with my words function
                headers: {'Content-Type': 'application/json'}
            });
            const data = await response.json();
            hideSpinner(); // stop spinner when done
            wordSent = data.word;
            isValid = data.validWord;
            console.log('My word is: ', wordSent);
            console.log('Is this word valid? ', isValid);
            if (isValid === true) {
                console.log("Success: Word submitted successfully!");
                if (wordSent === wordOfTheDay) {
                    showBanner(`Congratulations! You've guessed the word of the day! It was ${wordOfTheDay}`, 'success', 0); // 0 overrides default banner timeout to not expire
                    launchConfetti(50); // 🎉 Add this line
                    lockAllRows();
                    // Optionally, you can provide a way to restart the game                      
                } // if guessed row - stop the game
                else {
                    moveToNextRow(); // Move to the next row on valid word
                }
                // if all attempts used - game over
            } else {
                // Clear current row inputs and formatting
                const inputs = rows[currentRow].querySelectorAll("input");
                inputs.forEach(input => {
                    input.value = "";
                    input.classList.remove("correct", "partial", "wrong");
                });

                // Refocus first input
                inputs[0].focus();
                showBanner("The submitted word is not valid.", 'error');
            }
        } catch (error) {
            hideSpinner();
            showBanner('I did something wrong !?!', 'error');
        }
    }

    const rows = document.querySelectorAll(".row"); // Select all rows
    let currentRow = 0; // Start at the first row

    const banner = document.getElementById("banner"); // Get the banner element

    rows[currentRow].querySelectorAll("input")[0].focus(); // Focus the first input in the first row

    rows.forEach((row, rowIndex) => {
        const inputs = row.querySelectorAll("input"); // Get all inputs for the current row

        inputs.forEach((input, colIndex) => {
            input.addEventListener("input", (event) => {
                const value = event.target.value;
                if (!isLetter(value)) {
                    // showBanner("Error: Only letters are allowed!"); // This is not in requirements
                    input.value = ""; // clear invalid input
                    return; // stop further logic
                } // Check if the input is a letter
                if (colIndex < 4) {
                    // If typing in the first 4 positions, move focus to the next input
                    if (value.length === 1) {
                        inputs[colIndex + 1].focus();
                    }
                } 
            });

            input.addEventListener("keydown", (event) => {
                if (colIndex === 4 && isLetter(event.key) && input.value.length === 1) {
                    // Select the existing letter so typing replaces it
                    input.select();
                    showBanner("Only one letter allowed in the last box.", "error");
                }
            });

            input.addEventListener("keydown", (event) => {
                if (event.key === "Backspace" && event.target.value === "" && colIndex > 0) {
                    inputs[colIndex - 1].focus(); // On Backspace, move focus back if the current input is empty
                } else if (event.key === "Enter" && colIndex === 4) {
                    const allFilled = Array.from(inputs).every(input => input.value.length === 1); // Check if all 5 inputs in the current row are filled
                    if (allFilled === true) {                        
                        const inputs = rows[currentRow].querySelectorAll("input"); // Get the input elements for the current row
                        const myWord = Array.from(inputs).map(input => input.value).join('');
                        
                        console.log(inputs);
                        console.log(myWord);
                        console.log(wordOfTheDay);
                        highlightRow(inputs, myWord, wordOfTheDay);
                        validateTheWord(myWord);// Make the POST call to the API                        
                    }                    
                }  else if (event.key === "Enter" && colIndex != 4) {
                    showBanner("Please fill all 5 letters before submitting.", 'error');
                }

            });
        });        
    });

    function lockRow(rowIndex) {
        rows[rowIndex].querySelectorAll("input").forEach((input) => {
            input.readOnly = true; // Use readonly instead of disabled
        });
    }

    function lockAllRows() {
        rows.forEach((row) => {
            row.querySelectorAll("input").forEach((input) => {
                input.disabled = true; // disable input
            });
        });
    }

    function enableRow(rowIndex) {
        rows[rowIndex].querySelectorAll("input").forEach((input) => {
            input.removeAttribute("disabled"); // Enable all inputs in the row
        });
    }

    function moveToNextRow() {
        lockRow(currentRow); // Lock the current row
        currentRow++; // Move to the next row

        if (currentRow < rows.length) {
            enableRow(currentRow); // Enable the next row
            rows[currentRow].querySelectorAll("input")[0].focus(); // Focus the first input of the new row
        } else {
            showBanner(`Game Over! The word of the day was: ${wordOfTheDay}`, "info"); // No more rows — game over           
        }
    }

    function showBanner(message, type = "error", duration = 1500) {
        const banner = document.getElementById("banner");
    
        // Clear previous timeout if it exists
        if (bannerTimeout) {
            clearTimeout(bannerTimeout);
            bannerTimeout = null;
        }
    
        // Update banner text and style
        banner.textContent = message;
        banner.style.display = "block";
    
        banner.classList.remove("banner-success", "banner-error", "banner-info");
        banner.classList.add(`banner-${type}`);
    
        // Only set a timeout if duration > 0
        if (duration > 0) {
            bannerTimeout = setTimeout(() => {
                banner.style.display = "none";
                bannerTimeout = null;
            }, duration);
        }
    }
    
    function hideBanner() {
        const banner = document.getElementById("banner");
        banner.style.display = "none";
    }
    
    function showSpinner() {
        document.getElementById("spinner").style.display = "block";
    }
    
    function hideSpinner() {
        document.getElementById("spinner").style.display = "none";
    }

    function launchConfetti(count = 300) {
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement("div");
            confetti.classList.add("confetti");
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 80%, 60%)`;
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.animationDuration = `${1 + Math.random() * 2}s`;
            document.body.appendChild(confetti);
    
            // Remove confetti after animation
            confetti.addEventListener("animationend", () => confetti.remove());
        }
    }    
});
