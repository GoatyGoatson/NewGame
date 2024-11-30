import { playerQueueRef, gameRef, set, onValue, push, update } from "./firebase.js";
import { createMap, gameMap, renderPlayers } from "./ui.js";

document.getElementById("queue-button").onclick = handleQueueButtonClick;

function handleQueueButtonClick() {
	const button = document.getElementById("queue-button");
  
	button.textContent = "Warten auf Gegner...";
	button.style.backgroundColor = "purple";
	button.disabled = true;

	const playerName = getPlayerName();
	if (!playerName) {
		alert("Bitte gib einen gültigen Namen ein.");
		resetButton(button);
		return;
	}
	addPlayerToQueue(playerName);
	observeQueue(button);
}

function getPlayerName() {
	const playerNameInput = document.getElementById("player-name");
	return playerNameInput.value.trim();
}

function addPlayerToQueue(playerName) {
	const newPlayerRef = push(playerQueueRef);
	set(newPlayerRef, {
		name: playerName,
		timestamp: Date.now(),
		health: 100,
	}).then(() => {
		console.log("Spieler ${playerName} wurde der Queue hinzugefügt.");
		document.getElementById("player-name").disabled = true;
	}).catch((error) => {
		console.error("Fehler beim Hinzufügen des Spielers zur Queue:", error);
		alert("Fehler beim Beitreten zur Queue. Bitte versuche es erneut.");
		resetButton(document.getElementById("queue-button")); // Button zurücksetzen
	});
}

function observeQueue(button) {
	onValue(playerQueueRef, (snapshot) => {
		const players = snapshot.val();
		if (players) {
			const playerIds = Object.keys(players);
			if (playerIds.length === 2) {
				button.textContent = "Match gefunden! Starte Spiel...";
				button.style.backgroundColor = "green";
				createMap(gameMap);
				startMatch(players);
			}
		}
	});
}

function resetButton(button) {
	button.textContent = "Queue beitreten";
	button.style.backgroundColor = "";
	button.disabled = false;
}

function startMatch(players) {
	const playerIds = Object.keys(players);
	const sortedPlayers = playerIds.sort(
		(a, b) => players[a].timestamp - players[b].timestamp);
	update(gameRef, {
		player1: {
			...players[sortedPlayers[0]],
			x: 1,
			y: 1,
			color: "blue",
			health: 100,
		},
		player2: {
			...players[sortedPlayers[1]],
			x: 14,
			y: 1,
			color: "red",
			health: 100,
		},
		status: "active",
	}).then(() => {
		console.log("Match erfolgreich gestargt!");
		set(playerQueueRef, null);
		// Spieler direkt nach dem Starten des Matches rendern
		renderPlayers({
			x: 1,
			y: 1,
			color: "blue"
		}, {
			x: 14,
			y: 1,
			color: "red"
		});
	}).catch((error) => {
		console.error("Fehler beim Starten des Matches:", error);
	});
}
export {
	addPlayerToQueue,
	startMatch
};