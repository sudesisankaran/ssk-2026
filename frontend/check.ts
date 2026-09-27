import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAnWAtEnknyVlkEBSscISbHzdVf8dRa6Ds",
  authDomain: "ssk-2026.firebaseapp.com",
  projectId: "ssk-2026",
  storageBucket: "ssk-2026.firebasestorage.app",
  messagingSenderId: "985457311373",
  appId: "1:985457311373:web:93ffa9d70a1d51bf1aecc4",
  measurementId: "G-EEW8W5YSRR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, "problem_statements"));
  const docs = snap.docs.map(d => ({ id: d.id, data: d.data() }));

  docs.sort((a, b) => {
    if (typeof a.data.sno === "number" && typeof b.data.sno === "number") {
      return a.data.sno - b.data.sno;
    }
    return String(a.data.ps_number).localeCompare(String(b.data.ps_number));
  });

  console.log(`Found ${docs.length} problem statements.`);
  console.log("First 10:");
  for (let i = 0; i < 10; i++) {
    console.log(docs[i].id, docs[i].data.title);
  }
}

run().catch(console.error);
