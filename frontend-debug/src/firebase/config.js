import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyBkrLjHWbTVGg2ovyphVGeXGVBsp8n-olw",
  authDomain: "react-js--meet-clone.firebaseapp.com",
  projectId: "react-js--meet-clone",
  storageBucket: "react-js--meet-clone.appspot.com",
  messagingSenderId: "690297364302",
  appId: "1:690297364302:web:95fd1abf04f28914edc81f",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
