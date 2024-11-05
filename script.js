// Data structures for Snake Game


class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.next = null;
    }
}

class LinkedList {
    constructor(x, y) {
        this.head = new Node(x, y);
        this.tail = this.head;
    }

    addSegment(x, y) {
        const newSegment = new Node(x, y);
        this.tail.next = newSegment;
        this.tail = newSegment;
    }

    removeSegment() {
        let current = this.head;
        if (current.next == null) return;
        while (current.next && current.next.next != null) {
            current = current.next;
        }
        current.next = null;
        this.tail = current;
    }

    move(x, y) {
        let newHead = new Node(x, y);
        newHead.next = this.head;
        this.head = newHead;
        this.removeSegment();
    }

    isCollision(x, y) {
        let current = this.head;
        while (current != null) {
            if (current.x === x && current.y === y) return true;
            current = current.next;
        }
        return false;
    }

    hasSelfCollision() {
        let current = this.head.next; // Start checking from the second segment
        while (current != null) {
            if (current.x === this.head.x && current.y === this.head.y) {
                return true; // Collision with itself
            }
            current = current.next;
        }
        return false;
    }
}

// Queue class definition
class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(item) {
        this.items.push(item); // Add item to the end of the queue
    }

    dequeue() {
        if (this.isEmpty()) return null; // Return null if the queue is empty
        return this.items.shift(); // Remove the first item from the queue
    }

    isEmpty() {
        return this.items.length === 0; // Check if the queue is empty
    }

    size() {
        return this.items.length; // Return the size of the queue
    }
}

let snake = new LinkedList(10, 10); // Initialize the snake
let inputQueue = new Queue();
let food = { x: Math.floor(Math.random() * 40), y: Math.floor(Math.random() * 40) }; // Generates food at a random position
let score = 0;
let playerName = "";
let direction = ""; // Initialize direction
let gameInterval; // Variable to hold the interval for the game loop
const gameSpeed = 100; // Set speed of the game in milliseconds
const foodImage = new Image();
foodImage.src = "images/food.png"; // Change this to the path of your food image


let scores = []; // Array to hold the top scores

// Function to check food collision
function checkFoodCollision() {
    if (snake.head.x === food.x && snake.head.y === food.y) {
        score += 10; // Increase score
        snake.addSegment(snake.head.x, snake.head.y); // Add new segment to the snake
        generateFood(); // Generate new food
    }
}

function generateFood() {
    // Calculate max positions for food considering the size of the food segment
    const segmentSize = 20; // Size of each food segment
    const maxPositionX = (400 / segmentSize) - 1; // Maximum X position
    const maxPositionY = (400 / segmentSize) - 1; // Maximum Y position
    
    food.x = Math.floor(Math.random() * (maxPositionX + 1)); // Random X position
    food.y = Math.floor(Math.random() * (maxPositionY + 1)); // Random Y position
}


function processInput() {
    if (!inputQueue.isEmpty()) {
        let dir = inputQueue.dequeue();
        updateDirection(dir);
    }
}

function updateDirection(dir) {
    // Prevent the snake from going in the opposite direction
    if (direction === "ArrowUp" && dir !== "ArrowDown") direction = dir;
    else if (direction === "ArrowDown" && dir !== "ArrowUp") direction = dir;
    else if (direction === "ArrowLeft" && dir !== "ArrowRight") direction = dir;
    else if (direction === "ArrowRight" && dir !== "ArrowLeft") direction = dir;
}

function gameLoop() {
    processInput(); // Handle input
    let newHeadX = snake.head.x; // Store current head position
    let newHeadY = snake.head.y; // Store current head position

    // Update the head position based on direction
    if (direction === "ArrowUp") newHeadY -= 1;
    if (direction === "ArrowDown") newHeadY += 1;
    if (direction === "ArrowLeft") newHeadX -= 1;
    if (direction === "ArrowRight") newHeadX += 1;

    // Check for collision with the walls first
    if (newHeadX < 0 || newHeadX >= 40 || newHeadY < 0 || newHeadY >= 40) {
        endGame(); // End the game if it collides with walls
        clearInterval(gameInterval); // Stop the game loop
        return;
    }

    // Check if the new head position collides with the snake's own body
    if (snake.isCollision(newHeadX, newHeadY)) {
        endGame(); // End the game if it collides with itself
        clearInterval(gameInterval); // Stop the game loop
        return;
    }

    // Move the snake to the new head position
    snake.move(newHeadX, newHeadY);
    
    // Check if the snake has eaten the food
    checkFoodCollision(); 
    
    // Draw the updated snake and food
    drawSnake(); 
    drawFood(); 
}

function drawSnake() {
    const ctx = document.getElementById("gameCanvas").getContext("2d");
    ctx.clearRect(0, 0, 400, 400); // Clear canvas
    let current = snake.head;
    while (current) {
        ctx.fillStyle = "green"; // Snake color
        ctx.fillRect(current.x * 20, current.y * 20, 20, 20); // Change the size of the snake
        current = current.next;
    }
}

function drawFood() {
    const ctx = document.getElementById("gameCanvas").getContext("2d");
    ctx.drawImage(foodImage, food.x * 20, food.y * 20, 20, 20); // Change the size of the food
}


function endGame() {
    saveScore(score, playerName);
    alert("Game Over! Your score was: " + score);
}

function saveScore(score, playerName) {
    // Store the score and player name
    scores.push({ playerName, score });
    
    // Sort scores in descending order and keep top 10
    scores.sort((a, b) => b.score - a.score);
    if (scores.length > 10) scores.pop(); // Remove lowest score if more than 10

    displayScores(); // Update the scoreboard display
}

function displayScores() {
    const scoreboard = document.getElementById("scoreboard");
    scoreboard.innerHTML = ""; // Clear existing scores

    // Display top scores
    scores.forEach(entry => {
        const li = document.createElement("li");
        li.textContent = `${entry.playerName}: ${entry.score}`;
        scoreboard.appendChild(li);
    });
}

// Update the startGame function to set the game loop interval
function startGame() {
    playerName = document.getElementById("playerName").value || "Anonymous"; // Get player name
    score = 0; // Reset score
    snake = new LinkedList(10, 10); // Reinitialize the snake
    generateFood(); // Generate initial food
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    direction = "ArrowRight"; // Set initial direction

    clearInterval(gameInterval); // Clear any existing intervals
    gameInterval = setInterval(gameLoop, gameSpeed); // Start the game loop with specified speed
}

// Setup event listeners
document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("startButton");
    const resetButton = document.getElementById("resetButton");

    startButton.addEventListener("click", () => {
        console.log("Start button clicked");
        startGame();
    });

    resetButton.addEventListener("click", () => {
        console.log("Reset button clicked");
        startGame();
    });
});

// Add event listener for keydown
document.addEventListener("keydown", (event) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        inputQueue.enqueue(event.key);
    }
});

