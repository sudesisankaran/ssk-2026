import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";

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
  const rawData = fs.readFileSync(path.join(__dirname, "src/data/ps.json"), "utf8");
  const originalData = JSON.parse(rawData);

  console.log(`Found ${originalData.length} problem statements in backup.`);

  // 1. Delete everything in Firestore to prevent leftovers
  console.log("Deleting old documents...");
  const snap = await getDocs(collection(db, "problem_statements"));
  for (const docSnapshot of snap.docs) {
    await deleteDoc(docSnapshot.ref);
  }
  
  // 2. Upload the correct ones
  let count = 1;
  for (const item of originalData) {
    const newPsNumber = `SSK26${String(count).padStart(3, "0")}`;
    const newData = {
      ...item,
      ps_number: newPsNumber,
      sno: count
    };
    await setDoc(doc(db, "problem_statements", newPsNumber), newData);
    count++;
  }

  console.log("Successfully restored and renumbered!");
}

run().catch(console.error);
