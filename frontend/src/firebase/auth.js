import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "./config";
import { redirect } from "react-router-dom";
import { toast } from "react-toastify";
import { dispatch, logoutUser, setUser } from "../store";

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const { displayName: name, email, photoURL } = result.user;
    dispatch(
      setUser({
        name,
        email,
        file: photoURL,
        isLoading: false,
        error: "",
        token: "",
        room: "",
      })
    );
    redirect("/");
    toast.success("Successfully login with google!");
  } catch (error) {
    toast.error("Something went wrong. Please try again!");
  }
};

export const logoutFromGoogle = async () => {
  try {
    await signOut(auth);
    dispatch(logoutUser());
    toast.success("Successfully logged out!");
    redirect("/signin");
  } catch (error) {
    toast.error("Something went wrong. Please try again!");
  }
};
