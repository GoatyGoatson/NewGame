import { playerQueueRef, gameRef, set, onValue, push, update } from './firebase.js';
import { renderPlayers } from './ui.js';

export function handleQueueButtonClick() {
  const button = document.getElementById('queue-button');
  const playerNameInput = document.getElementById('player-name');
  const playerName = playerNameInput.value.trim();

  if (!playerName) {
    alert('Bitte gib einen gültigen Namen ein.');
    resetButton(button);
    return;
  }

  button.textContent = "Warten auf Gegner...";
  button.style.backgroundColor = "purple";
  button.disabled = true;
  playerNameInput.disabled = true;

  addPlayerToQueue(playerName, button);
}

function addPlayerToQueue(playerName, button) {
  const newPlayerRef = push(playerQueueRef);
  
  set(newPlayerRef, {
    name: playerName,
    timestamp: Date.now(),
    health: 100
  }).then(() => {
    console.log(`Spieler ${playerName} wurde der Queue hinzugefügt.`);
    observeQueue(button);
  }).catch((error) => {
    console.error('Fehler beim Hinzufügen des Spielers zur Queue:', error);
    alert('Fehler beim Beitreten zur Queue. Bitte versuche es erneut.');
    resetButton(button);
  });
}

function observeQueue(button) {
  onValue(playerQueueRef, (snapshot) => {
    const players = snapshot.val();
    if (players && Object.keys(players).length === 2) {
      startMatch(players, button);
    }
  });
}

function startMatch(players, button) {
  const playerIds = Object.keys(players).sort((a, b) => players[a].timestamp - players[b].timestamp);
  
  update(gameRef, {
    player1: {
      ...players[playerIds[0]],
      x: 1,
      y: 1,
      color: 'blue',
      health: 100
    },
    player2: {
      ...players[playerIds[1]],
      x: 14,
      y: 1,
      color: 'red',
      health: 100
    },
    status: "active"
  }).then(() => {
    button.textContent = "Match gefunden! Starte Spiel...";
    button.style.backgroundColor = "green";
    
    set(playerQueueRef, null);
    
    renderPlayers(
      { x: 1, y: 1, color: 'blue' },
      { x: 14, y: 1, color: 'red' }
    );
  }).catch((error) => {
    console.error("Fehler beim Starten des Matches:", error);
  });
}

function resetButton(button) {
  button.textContent = "Queue beitreten";
  button.style.backgroundColor = "";
  button.disabled = false;
  document.getElementById('player-name').disabled = false;
}

document.getElementById('queue-button').onclick = handleQueueButtonClick;