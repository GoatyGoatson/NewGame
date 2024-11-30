// Importiere die notwendigen Firebase-Funktionen
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

// Firebase-App initialisieren
const app = initializeApp(firebaseConfig);

// Zugriff auf die Firebase-Datenbank
const db = getDatabase(app);

// Referenzen zu spezifischen Datenbankpfaden
const gameRef = ref(db, 'game');
const playerQueueRef = ref(db, 'queue');
const bulletsRef = ref(db, 'bullets');

// Exportiere die Funktionen und Referenzen, um sie in anderen Dateien zu verwenden
export { db, gameRef, playerQueueRef, bulletsRef, set, update, push, onValue, remove };
