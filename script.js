// script.js
let clicks = 0;
let mathPerSecond = 0;
let xp = 0;
let level = 1;

// Open or create the IndexedDB database
const request = indexedDB.open("mathClickerDB", 1);
let db;

request.onupgradeneeded = function(event) {
    db = event.target.result;
    // Create an object store with keyPath as the clicks
    const objectStore = db.createObjectStore("gameState", { keyPath: "clicks" });
    objectStore.createIndex("clicks", "clicks", { unique: true });
};

request.onsuccess = function(event) {
    db = event.target.result;
    // Load saved state on page load
    loadGameState();
    // Start the game
    startMathPerSecond();
};

request.onerror = function(event) {
    console.error("Error opening database:", event.target.error);
};

function saveGameState() {
    const transaction = db.transaction(["gameState"], "readwrite");
    const objectStore = transaction.objectStore("gameState");

    const gameState = {
        clicks: clicks,
        mathPerSecond: mathPerSecond,
        xp: xp,
        level: level
    };

    // Update or add the game state in the object store
    const request = objectStore.put(gameState);

    request.onsuccess = function() {
        console.log("Game state saved successfully!");
    };

    request.onerror = function(event) {
        console.error("Error saving game state:", event.target.error);
    };
}

function loadGameState() {
    const transaction = db.transaction(["gameState"], "readonly");
    const objectStore = transaction.objectStore("gameState");

    const request = objectStore.get(1); // Assuming there is only one game state

    request.onsuccess = function(event) {
        const gameState = event.target.result;
        if (gameState) {
            // Load the game state
            clicks = gameState.clicks;
            mathPerSecond = gameState.mathPerSecond;
            xp = gameState.xp;
            level = gameState.level;

            // Update the UI
            updateClickCount();
            updateLevel();
            updateMathPerSecond();
            console.log("Game state loaded successfully!");
        } else {
            console.log("No saved game state found.");
        }
    };

    request.onerror = function(event) {
        console.error("Error loading game state:", event.target.error);
    };
}

function updateClickCount() {
    document.getElementById("click-count").innerText = `Clicks: ${clicks}`;
}

function checkLevelUp() {
    if (clicks >= level * 10) {
        level++;
        xp += 10;
        updateLevel();
    }
}

function updateLevel() {
    document.getElementById("level").innerText = `Level: ${level}`;
}

function updateMathPerSecond() {
    document.getElementById("math-per-second").innerText = `Math per second: ${mathPerSecond}`;
}

function generateMathProblem() {
    const base = Math.floor(Math.random() * 5) + 2; // Random base between 2 and 6
    const exponent = level; // Exponent increases with level
    const mathProblem = `Math Problem ${clicks}: ${base}^${exponent} = ${Math.pow(base, exponent)}`;
    
    document.getElementById("math-problems").value += mathProblem + '\n';
}

function startMathPerSecond() {
    setInterval(() => {
        clicks += mathPerSecond;
        updateClickCount();
        checkLevelUp();
        generateMathProblem();
        saveGameState();
    }, 1000);
}

// Start the game
startMathPerSecond();
