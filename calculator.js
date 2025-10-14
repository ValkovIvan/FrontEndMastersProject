// Grab the display element
const display = document.getElementById("calc-display");

// Function to clear the display
function clearDisplay() {
    display.value = "0";
}

// Function to remove the last character (Backspace)
function backspace() {
    display.value = display.value.slice(0, -1);
    if (display.value === "") {
        clearDisplay;
    }
}

// Function to append a value to the display
function appendToDisplay(value) {
    if (display.value === "0") {
        display.value = value; // Replace default 0
    } else {
        display.value += value; // Append to current value
    }
}

// Function to calculate the result
function calculate() {
    try {
        // Use eval to evaluate the mathematical expression
        display.value = eval(display.value);
    } catch (error) {
        display.value = "Error"; // Display error for invalid input
    }
}

// Attach the functions to the buttons
document.getElementById("clear-btn").onclick = clearDisplay;
document.getElementById("cancel-btn").onclick = backspace;

// Example for numbers and operators (loop through buttons to reduce redundancy)
document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
        const value = button.innerText;

        // Check if it's a number or operator and update the display
        if (!isNaN(value) || "+-*/".includes(value)) {
            appendToDisplay(value);
        }
    });
});

// Calculate when the equals button is clicked
document.getElementById("equal-btn").onclick = calculate;


// To Do:
// When an math operator clicked precalculate => 5+5+5 to display as 10+5;
// When I type 5+5+ and press = => ignore the last math operator