import { writable, get } from 'svelte/store';
import { user } from './userStore';
import {
	loadWorkoutLogs as loadLocalLogs,
	logWorkout as logLocalWorkout,
	saveAllWorkoutLogs,
	type WorkoutLog
} from '$lib/services/routineStorage';
import { 
	syncLogsToFirestore,
	loadUserDataFromFirestore 
} from '$lib/services/firestoreService';

function createWorkoutStore() {
	const { subscribe, set, update } = writable<WorkoutLog[]>([]);

	// Sync or load from Firestore when user changes
	user.subscribe(async (userData) => {
		if (userData) {
			const data = await loadUserDataFromFirestore(userData.uid);
			if (data.logs.length > 0) {
				saveAllWorkoutLogs(data.logs); // Sync logs to local storage
				set(data.logs);
			} else {
				// Optional: sync local logs to remote if remote is empty
				const local = loadLocalLogs();
				if (local.length > 0) await syncLogsToFirestore(userData.uid, local);
				set(local);
			}
		} else {
			set([]);
		}
	});

	return {
		subscribe,
		
		log: async (routineId: string, routineName: string, duration: number, repetitionsCompleted: number) => {
			const userData = get(user);
			
			// Always log locally first
			logLocalWorkout(routineId, routineName, duration, repetitionsCompleted);
			
			// Get the local logs (which now includes the new one)
			const currentLocal = loadLocalLogs();
			if (userData) {
				await syncLogsToFirestore(userData.uid, currentLocal);
			}
			
			const newLog = currentLocal[0];
			update(logs => [newLog, ...logs].slice(0, 100));
		},

		refresh: async () => {
			const userData = get(user);
			if (userData) {
				const data = await loadUserDataFromFirestore(userData.uid, true);
				saveAllWorkoutLogs(data.logs);
				set(data.logs);
			} else {
				set(loadLocalLogs());
			}
		}
	};
}

export const workoutStore = createWorkoutStore();
