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
  console.log("Fetching problem statements...");
  const snap = await getDocs(collection(db, "problem_statements"));
  const docs = snap.docs.map(d => ({ id: d.id, data: d.data() }));

  // Sort them so the numbering is deterministic.
  // We'll sort by the old ps_number if possible, or title.
  docs.sort((a, b) => {
    // If they have sno, sort by that
    if (typeof a.data.sno === "number" && typeof b.data.sno === "number") {
      return a.data.sno - b.data.sno;
    }
    return String(a.data.ps_number).localeCompare(String(b.data.ps_number));
  });

  console.log(`Found ${docs.length} problem statements. Renumbering...`);

  let count = 1;
  for (const docObj of docs) {
    const oldId = docObj.id;
    const oldData = docObj.data;
    
    // Generate new PS number like SSK26001, SSK26012, SSK26123, etc.
    const newPsNumber = `SSK26${String(count).padStart(3, "0")}`;
    
    if (oldData.ps_number !== newPsNumber) {
      console.log(`Renaming ${oldData.ps_number} -> ${newPsNumber}`);
      
      const newData = {
        ...oldData,
        ps_number: newPsNumber,
        sno: count
      };

      // Create new document with new ID (assuming ID is the ps_number)
      await setDoc(doc(db, "problem_statements", newPsNumber), newData);
      
      // Delete old document if the ID changed
      if (oldId !== newPsNumber) {
        await deleteDoc(doc(db, "problem_statements", oldId));
      }
    }
    
    count++;
  }
  
  console.log("Done!");
}

run().catch(console.error);
