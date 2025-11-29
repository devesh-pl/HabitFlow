import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAETllyhMLiXAlOnTNOLNDyHpMowf2ole8",
  authDomain: "habitflow-62627.firebaseapp.com",
  projectId: "habitflow-62627",
  storageBucket: "habitflow-62627.firebasestorage.app",
  messagingSenderId: "1023702430964",
  appId: "1:1023702430964:web:07a1013e9f9ca58af3daa1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);