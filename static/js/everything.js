// Firebase setup
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, update } from "firebase/database";

const firebaseConfig = {
    // Your Firebase config here
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Game setup
let sessionId = null;
let isPlayer1 = false;

// Game Map
const map = [
    ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
    ['wall', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'wall'],
    ['wall', 'floor', 'wall', 'floor', 'wall', 'floor', 'floor', 'wall'],
    ['wall', 'floor', 'wall', 'floor', 'wall', 'floor', 'floor', 'wall'],
    ['wall', 'floor', 'floor', 'floor', 'wall', 'floor', 'floor', 'wall'],
    ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
];

// Generate a unique session ID
function generateSessionId() {
    sessionId = 'game_' + Date.now();
    set(ref(db, `games/${sessionId}`), {
        startTime: Date.now(),
        map,
        player1: null,
        player2: null,
    });
    console.log(`Session ID created: ${sessionId}`);
}

// Render the map
function renderMap() {
    const gameContainer = document.getElementById('game');
    gameContainer.innerHTML = ''; // Clear previous content
    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            const tileElement = document.createElement('div');
            tileElement.classList.add('tile', tile);
            tileElement.dataset.x = x;
            tileElement.dataset.y = y;
            gameContainer.appendChild(tileElement);
        });
    });
}

// Queue logic
document.getElementById('queue-button').addEventListener('click', () => {
    const playerName = document.getElementById('player-name').value;
    if (!playerName) {
        alert('Please enter your name!');
        return;
    }

    const queueRef = ref(db, 'queue');
    onValue(queueRef, (snapshot) => {
        let queue = snapshot.val() || [];
        if (queue.includes(playerName)) {
            alert('You are already in the queue!');
            return;
        }

        if (queue.length === 0) {
            isPlayer1 = true;
            queue.push(playerName);
            set(queueRef, queue);
            generateSessionId();
            alert('Waiting for another player...');
        } else {
            const [player1] = queue;
            set(ref(db, `games/${sessionId}/player1`), player1);
            set(ref(db, `games/${sessionId}/player2`), playerName);
            set(queueRef, []); // Clear queue
            startGame();
        }
    }, { onlyOnce: true });
});

// Start game
function startGame() {
    renderMap();
    setTimeout(() => {
        alert('Game Over!');
        endGame();
    }, 180000); // 3-minute timer
}

// End game
function endGame() {
    if (sessionId) {
        set(ref(db, `games/${sessionId}`), null);
        sessionId = null;
    }
}

// Player movement
document.addEventListener('keydown', (event) => {
    if (!sessionId) return;

    const playerPath = isPlayer1 ? 'player1Position' : 'player2Position';
    const currentPosition = { /* Retrieve from Firebase */ };

    let newPosition;
    switch (event.key) {
        case 'ArrowUp': newPosition = { x: currentPosition.x, y: currentPosition.y - 1 }; break;
        case 'ArrowDown': newPosition = { x: currentPosition.x, y: currentPosition.y + 1 }; break;
        case 'ArrowLeft': newPosition = { x: currentPosition.x - 1, y: currentPosition.y }; break;
        case 'ArrowRight': newPosition = { x: currentPosition.x + 1, y: currentPosition.y }; break;
        default: return;
    }

    update(ref(db, `games/${sessionId}/${playerPath}`), newPosition);
});

// Shooting logic
document.addEventListener('keydown', (event) => {
    if (event.key === 'Space') {
        const bullet = { /* logic for bullet position and direction */ };
        update(ref(db, `games/${sessionId}/bullets`), { bullet });
    }
});
