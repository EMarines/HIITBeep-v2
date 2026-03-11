import { db } from './firebase';
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    query, 
    orderBy, 
    serverTimestamp,
} from 'firebase/firestore';
import type { SavedRoutine, WorkoutLog } from './routineStorage';

const getUserDataPath = (userId: string) => `userData/${userId}`;

export async function syncRoutinesToFirestore(userId: string, routines: SavedRoutine[]) {
    const userRef = doc(db, getUserDataPath(userId));
    await setDoc(userRef, {
        routines,
        updatedAt: serverTimestamp()
    }, { merge: true });
}

export async function syncLogsToFirestore(userId: string, logs: WorkoutLog[]) {
    const userRef = doc(db, getUserDataPath(userId));
    await setDoc(userRef, {
        logs,
        updatedAt: serverTimestamp()
    }, { merge: true });
}

let userDataPromise: Promise<{ routines: SavedRoutine[], logs: WorkoutLog[] }> | null = null;
let lastFetchTime = 0;

export async function loadUserDataFromFirestore(userId: string, forceRefresh = false): Promise<{ routines: SavedRoutine[], logs: WorkoutLog[] }> {
    const now = Date.now();
    
    // Coalesce exact simultaneous requests (Svelte stores tend to load at exactly the same time)
    if (!forceRefresh && userDataPromise && (now - lastFetchTime < 2000)) {
        return userDataPromise;
    }

    lastFetchTime = now;
    userDataPromise = (async () => {
        const userRef = doc(db, getUserDataPath(userId));
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const data = userSnap.data();
            // If we have actual unified data, return it
            if (data.routines || data.logs) {
                return {
                    routines: (data.routines as SavedRoutine[]) || [],
                    logs: (data.logs as WorkoutLog[]) || []
                };
            }
        }
        
        // MIGRATION FALLBACK: Retrieve from old format (subcollections) if the single doc is missing/empty
        // Reduces data loss for early adopters. Only happens once since we save it down below.
        const routinesQ = query(collection(db, `users/${userId}/routines`), orderBy('lastUsed', 'desc'));
        const logsQ = query(collection(db, `users/${userId}/logs`), orderBy('completedAt', 'desc'));
        
        try {
            const [routinesSnap, logsSnap] = await Promise.all([getDocs(routinesQ), getDocs(logsQ)]);
            
            const routines = routinesSnap.docs.map(d => d.data() as SavedRoutine);
            const logs = logsSnap.docs.map(d => {
                const data = d.data();
                return {
                    ...data,
                    completedAt: data.completedAt?.toMillis() || Date.now()
                } as WorkoutLog;
            });

            // Immediately save to unified doc, so future reads cost exactly 1 instead of N.
            if (routines.length > 0 || logs.length > 0) {
                await setDoc(userRef, { routines, logs, updatedAt: serverTimestamp() }, { merge: true });
            }
            
            return { routines, logs };
        } catch(e) {
            console.warn("No old data migrating or error fetching old format:", e);
            return { routines: [], logs: [] };
        }
    })();

    return userDataPromise;
}
