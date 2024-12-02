import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js';
import { getDatabase, ref, set, update, push, onValue, remove } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyBXvE64zxiLq4llMRX-sG8oMC5NZ-n1lBw",
  authDomain: "bulletbound-70a04.firebaseapp.com",
  databaseURL: "https://bulletbound-70a04-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bulletbound-70a04",
  storageBucket: "bulletbound-70a04.firebasestorage.app",
  messagingSenderId: "512551082564",
  appId: "1:512551082564:web:eeded9d53aba74e2f0ba11",
  measurementId: "G-0KBGW2TCQS"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Game setup
let sessionId = null;
let isPlayer1 = false;

// Generate a unique session ID for the game
function generateSessionId() {
    sessionId = 'game_' + Date.now();
    set(ref(db, `games/${sessionId}`), {
        startTime: Date.now(),
        player1: null,
        player2: null
    });
    console.log(`Session ID created: ${sessionId}`);
}

// Queue logic
document.getElementById('queue-button').addEventListener('click', () => {
    const playerName = document.getElementById('player-name').value;
    if (!playerName) {
        alert('Please enter your name!');
        return;
    }

    onValue(ref(db, 'queue'), (snapshot) => {
        const queue = snapshot.val() || [];
        if (queue.length === 0) {
            // Add player to queue as player1
            isPlayer1 = true;
            set(ref(db, 'queue'), [playerName]);
            generateSessionId();
        } else {
            // Add player to game as player2
            const [player1] = queue;
            set(ref(db, `games/${sessionId}/player1`), player1);
            set(ref(db, `games/${sessionId}/player2`), playerName);
            set(ref(db, 'queue'), []); // Clear queue
            startGame();
        }
    });
});

// Start game
function startGame() {
    setTimeout(() => {
        alert('Game Over!');
        endGame();
    }, 180000); // End game after 3 minutes
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
    const currentPosition = { /* logic to get current position */ };

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
        // Update Firebase with bullet data
        update(ref(db, `games/${sessionId}/bullets`), { bullet });
    }
});
