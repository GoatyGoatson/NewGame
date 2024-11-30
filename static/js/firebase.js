import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, update, push, onValue, remove } from 'firebase/database';

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

const gameRef = ref(db, 'game');
const playerQueueRef = ref(db, 'queue');
const bulletsRef = ref(db, 'bullets');

export { db, gameRef, playerQueueRef, bulletsRef, set, update, push, onValue, remove };
