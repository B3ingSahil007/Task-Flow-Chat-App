import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
    apiKey: "AIzaSyBRo7AvceIKZWhlghRLsJ_Awrw8caVpLes",
    authDomain: "talkflow-8527b.firebaseapp.com",
    projectId: "talkflow-8527b",
    storageBucket: "talkflow-8527b.firebasestorage.app",
    messagingSenderId: "129434198787",
    appId: "1:129434198787:web:12bd56bb84e83542ccff36"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password, mobilenumber) => {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user
        await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            username: username.toLowerCase(),
            email,
            password,
            mobilenumber: mobilenumber,
            name: "",
            avatar: "",
            bio: "Hey, I'm using TalkFlow Chat App",
            lastSeen: Date.now()
        })
        await setDoc(doc(db, "chats", user.uid), {
            chatsData: []
        })
        toast.success("User Successfully Created")

    } catch (error) {
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(' '))
    }
}

const login = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password)
        toast.success("Log In Successfull")
        setTimeout(() => {
            toast.success("Write Your Name And Add Profile Image");
        }, 4000);

    } catch (error) {
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(' '))
    }
}

const logout = async () => {
    try {
        await signOut(auth)
        toast.success("Log-Out Successfull")

    } catch (error) {
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(' '))
    }
}

export { signup, login, logout, auth, db }