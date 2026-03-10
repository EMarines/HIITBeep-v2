import { writable } from 'svelte/store';
import { 
    onAuthStateChanged, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    type User 
} from 'firebase/auth';
import { auth } from '$lib/services/firebase';

function createUserStore() {
    const { subscribe, set } = writable<User | null>(null);

    // Observer for auth state
    onAuthStateChanged(auth, (user) => {
        set(user);
    });

    return {
        subscribe,
        loginWithGoogle: async () => {
            const provider = new GoogleAuthProvider();
            try {
                await signInWithPopup(auth, provider);
            } catch (error: any) {
                // Ignore harmless errors that happen due to browser pop-up policies
                if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
                    console.log("Popup operation handled: ", error.code);
                    return;
                }
                console.error("Error logging in with Google:", error);
                throw error;
            }
        },
        signUpWithEmail: async (email: string, pass: string, name: string) => {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
                await updateProfile(userCredential.user, { displayName: name });
                return userCredential.user;
            } catch (error) {
                console.error("Error signing up:", error);
                throw error;
            }
        },
        loginWithEmail: async (email: string, pass: string) => {
            try {
                await signInWithEmailAndPassword(auth, email, pass);
            } catch (error) {
                console.error("Error logging in with email:", error);
                throw error;
            }
        },
        logout: async () => {
            try {
                await signOut(auth);
            } catch (error) {
                console.error("Error logging out:", error);
            }
        }
    };
}

export const user = createUserStore();
