import { useEffect, useState } from "react";
import {
  getAuth,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import myApp from "firebaseApp";

export const useAuthStateWatcher = () => {
  const auth = getAuth(myApp);
  const [user, setUserState] = useState<User | null>(auth.currentUser);
  const onChange = (user: User | null) => setUserState(user);
  useEffect(() => {
    setUserState(auth.currentUser);
    return auth.onAuthStateChanged(onChange);
  }, [auth]);

  return user;
};

interface EmailLoginProps {
  email: string;
  password: string;
}

export const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(getAuth(myApp), new GoogleAuthProvider());
    const user = res.user;
  } catch (err: any) {
    console.error(err);
    alert(err.message);
  }
};

export const logInWithEmailAndPassword = async (props: EmailLoginProps) => {
  const { email, password } = props;
  try {
    await signInWithEmailAndPassword(getAuth(myApp), email, password);
  } catch (err: any) {
    console.error(err);
    alert(err.message);
  }
};


export const registerWithEmailAndPassword = async (props: EmailLoginProps) => {
  const { email, password} = props;
  try {
    const res = await createUserWithEmailAndPassword(getAuth(myApp), email, password);
    const user = res.user;
  } catch (err: any) {
    console.error(err);
    alert(err.message);
  }
};

export const sendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(getAuth(myApp), email);
    alert("Password reset link sent!");
  } catch (err: any) {
    console.error(err);
    alert(err.message);
  }
};

export const logout = () => {
  signOut(getAuth(myApp));
};
