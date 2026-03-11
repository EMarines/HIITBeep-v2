import { writable, get } from 'svelte/store';
import { user } from './userStore';
import {
	loadWorkoutLogs as loadLocalLogs,
	logWorkout as logLocalWorkout,
	saveAllWorkoutLogs,
	type WorkoutLog
} from '$lib/services/routineStorage';
import { 
	logWorkoutToFirestore,
	loadWorkoutLogsFromFirestore 
} from '$lib/services/firestoreService';

function createWorkoutStore() {
	const { subscribe, set, update } = writable<WorkoutLog[]>([]);

	// Sync or load from Firestore when user changes
	user.subscribe(async (userData) => {
		if (userData) {
			const remoteLogs = await loadWorkoutLogsFromFirestore(userData.uid);
			if (remoteLogs.length > 0) {
				saveAllWorkoutLogs(remoteLogs); // Sync logs to local storage
				set(remoteLogs);
			} else {
				// Optional: sync local logs to remote if remote is empty
				const local = loadLocalLogs();
				for(const log of local) {
					await logWorkoutToFirestore(userData.uid, log);
				}
				set(local);
			}
		} else {
			set(loadLocalLogs());
		}
	});

	return {
		subscribe,
		
		log: async (routineId: string, routineName: string, duration: number, repetitionsCompleted: number) => {
			const userData = get(user);
			
			// Always log locally first
			logLocalWorkout(routineId, routineName, duration, repetitionsCompleted);
			
			// Get the last log created (local logs are unshifted)
			const localLogs = loadLocalLogs();
			const newLog = localLogs[0];
			
			if (userData && newLog) {
				await logWorkoutToFirestore(userData.uid, newLog);
			}
			
			update(logs => [newLog, ...logs].slice(0, 100));
		},

		refresh: async () => {
			const userData = get(user);
			if (userData) {
				const remoteLogs = await loadWorkoutLogsFromFirestore(userData.uid);
				saveAllWorkoutLogs(remoteLogs);
				set(remoteLogs);
			} else {
				set(loadLocalLogs());
			}
		}
	};
}

export const workoutStore = createWorkoutStore();
