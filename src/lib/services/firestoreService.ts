import { db } from './firebase';
import { 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    deleteDoc, 
    query, 
    orderBy, 
    serverTimestamp,
    updateDoc,
    addDoc
} from 'firebase/firestore';
import type { SavedRoutine, WorkoutLog } from './routineStorage';

const getRoutinesPath = (userId: string) => `users/${userId}/routines`;
const getLogsPath = (userId: string) => `users/${userId}/logs`;

export async function saveRoutineToFirestore(userId: string, routine: SavedRoutine) {
    const routineRef = doc(db, getRoutinesPath(userId), routine.id);
    await setDoc(routineRef, {
        ...routine,
        updatedAt: serverTimestamp()
    });
}

export async function updateRoutineInFirestore(userId: string, id: string, data: Partial<SavedRoutine>) {
    const routineRef = doc(db, getRoutinesPath(userId), id);
    await updateDoc(routineRef, {
        ...data,
        updatedAt: serverTimestamp()
    });
}

export async function deleteRoutineFromFirestore(userId: string, id: string) {
    const routineRef = doc(db, getRoutinesPath(userId), id);
    await deleteDoc(routineRef);
}

export async function loadRoutinesFromFirestore(userId: string): Promise<SavedRoutine[]> {
    const q = query(collection(db, getRoutinesPath(userId)), orderBy('lastUsed', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as SavedRoutine);
}

export async function logWorkoutToFirestore(userId: string, log: WorkoutLog) {
    const logRef = doc(db, getLogsPath(userId), log.id);
    await setDoc(logRef, {
        ...log,
        completedAt: serverTimestamp()
    });
}

export async function loadWorkoutLogsFromFirestore(userId: string): Promise<WorkoutLog[]> {
    const q = query(collection(db, getLogsPath(userId)), orderBy('completedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            completedAt: data.completedAt?.toMillis() || Date.now()
        } as WorkoutLog;
    });
}
