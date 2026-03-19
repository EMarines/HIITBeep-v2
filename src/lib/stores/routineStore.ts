import { writable, derived, get } from 'svelte/store';
import { user } from './userStore';
import {
	loadRoutines as loadLocalRoutines,
	deleteRoutine as deleteLocalRoutine,
	saveRoutine as saveLocalRoutine,
	updateRoutine as updateLocalRoutine,
	saveAllRoutines,
	clearAllData,
	getStats,
	type SavedRoutine,
	type Interval
} from '$lib/services/routineStorage';
import { 
	syncRoutinesToFirestore, 
	loadUserDataFromFirestore 
} from '$lib/services/firestoreService';

function createRoutineStore() {
	const { subscribe, set, update } = writable<SavedRoutine[]>([]);

	// Sync local to Firestore when user logs in, or load from Firestore
	user.subscribe(async (userData) => {
		if (userData) {
			const data = await loadUserDataFromFirestore(userData.uid);
			if (data.routines.length > 0) {
				saveAllRoutines(data.routines); // Sync to local storage!
				set(data.routines);
			} else {
				// If no remote, sync local to remote
				const local = loadLocalRoutines();
				if (local.length > 0) await syncRoutinesToFirestore(userData.uid, local);
				set(local);
			}
		} else {
			// Guest mode - clear local storage of data belonging to logged-out user
			clearAllData();
			set([]);
		}
	});

	return {
		subscribe,
		
		refresh: async () => {
			const userData = get(user);
			if (userData) {
				const data = await loadUserDataFromFirestore(userData.uid, true);
				saveAllRoutines(data.routines);
				set(data.routines);
			} else {
				set(loadLocalRoutines());
			}
		},
		
		save: async (name: string, intervals: Interval[], repetitions: number) => {
			const userData = get(user);
			const result = saveLocalRoutine(name, intervals, repetitions);
			
			if (result.success && result.routine) {
				const currentLocal = loadLocalRoutines();
				if (userData) {
					await syncRoutinesToFirestore(userData.uid, currentLocal);
				}
				update(routines => [result.routine!, ...routines]);
			}
			return result;
		},

		update: async (id: string, name: string, intervals: Interval[], repetitions: number) => {
			const userData = get(user);
			const result = updateLocalRoutine(id, name, intervals, repetitions);
			
			if (result.success && result.routine) {
				const currentLocal = loadLocalRoutines();
				if (userData) {
					await syncRoutinesToFirestore(userData.uid, currentLocal);
				}
				update(routines => routines.map(r => r.id === id ? result.routine! : r));
			}
			return result;
		},
		
		delete: async (id: string) => {
			const userData = get(user);
			const success = deleteLocalRoutine(id);
			if (success) {
				const currentLocal = loadLocalRoutines();
				if (userData) {
					await syncRoutinesToFirestore(userData.uid, currentLocal);
				}
				update(routines => routines.filter(r => r.id !== id));
			}
			return success;
		},
		
		load: (id: string): SavedRoutine | undefined => {
			const routines = get({ subscribe });
			return routines.find(r => r.id === id);
		},

		updateLastUsed: async (id: string) => {
			const userData = get(user);
			update(routines => {
				const index = routines.findIndex(r => r.id === id);
				if (index !== -1) {
					const updated = [...routines];
					updated[index] = { ...updated[index], lastUsed: Date.now() };
					
					// Sync local storage in current view context for future reloads
					import('$lib/services/routineStorage').then(storage => {
						storage.updateRoutineLastUsed(id);
					});

					// Re-sort routines by last used if desired
					return updated.sort((a, b) => (b.lastUsed || b.createdAt) - (a.lastUsed || a.createdAt));
				}
				return routines;
			});
		}
	};
}

export const routineStore = createRoutineStore();

import { workoutStore } from './workoutStore';

export const routineStats = derived([routineStore, workoutStore], ([$routines, $workouts]) => {
	const totalWorkouts = $workouts.length;
	const totalMinutes = Math.round($workouts.reduce((acc, log) => acc + (log.duration / 60), 0));
	return {
		totalRoutines: $routines.length,
		totalWorkouts,
		totalMinutes
	};
});
