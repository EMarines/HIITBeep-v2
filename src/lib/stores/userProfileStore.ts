import { writable } from 'svelte/store';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '$lib/services/firebase';
import { user } from './userStore';
import { get } from 'svelte/store';

export interface UserProfile {
    username: string;
    age: number | null;
    gender: string;
    weight: number | null;
    height: number | null;
    goal: string;
    lengthSystem: 'cm' | 'ft';
    weightSystem: 'kg' | 'lb';
}

const defaultProfile: UserProfile = {
    username: '',
    age: null,
    gender: '',
    weight: null,
    height: null,
    goal: '',
    lengthSystem: 'cm',
    weightSystem: 'kg'
};

function createUserProfileStore() {
    const { subscribe, set, update } = writable<UserProfile>(defaultProfile);
    let currentUserId: string | null = null;

    return {
        subscribe,
        loadProfile: async (uid: string) => {
            currentUserId = uid;
            try {
                const docRef = doc(db, 'users', uid);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    set({ ...defaultProfile, ...docSnap.data() });
                } else {
                    set({ ...defaultProfile }); // Use defaults if no profile exists
                }
            } catch (error) {
                console.error("Error loading user profile:", error);
                set({ ...defaultProfile });
            }
        },
        saveProfile: async (profileData: Partial<UserProfile>) => {
            if (!currentUserId) return { success: false, error: 'User not logged in' };
            
            try {
                const docRef = doc(db, 'users', currentUserId);
                // Create or merge
                await setDoc(docRef, profileData, { merge: true });
                update(current => ({ ...current, ...profileData }));
                return { success: true };
            } catch (error: any) {
                console.error("Error saving user profile:", error);
                return { success: false, error: error.message };
            }
        },
        clearProfile: () => {
            currentUserId = null;
            set({ ...defaultProfile });
        }
    };
}

export const userProfile = createUserProfileStore();

// Escuchar cambios en auth
user.subscribe(currentUser => {
    if (currentUser) {
        userProfile.loadProfile(currentUser.uid);
    } else {
        userProfile.clearProfile();
    }
});
