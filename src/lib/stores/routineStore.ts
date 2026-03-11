import { writable, derived, get } from 'svelte/store';
import { user } from './userStore';
import {
	loadRoutines as loadLocalRoutines,
	deleteRoutine as deleteLocalRoutine,
	saveRoutine as saveLocalRoutine,
	updateRoutine as updateLocalRoutine,
	saveAllRoutines,
	getStats,
	type SavedRoutine,
	type Interval
} from '$lib/services/routineStorage';
import { 
	saveRoutineToFirestore, 
	updateRoutineInFirestore, 
	deleteRoutineFromFirestore, 
	loadRoutinesFromFirestore 
} from '$lib/services/firestoreService';

function createRoutineStore() {
	const { subscribe, set, update } = writable<SavedRoutine[]>([]);

	// Sync local to Firestore when user logs in, or load from Firestore
	user.subscribe(async (userData) => {
		if (userData) {
			const remoteRoutines = await loadRoutinesFromFirestore(userData.uid);
			if (remoteRoutines.length > 0) {
				saveAllRoutines(remoteRoutines); // Sync to local storage!
				set(remoteRoutines);
			} else {
				// If no remote, sync local to remote
				const local = loadLocalRoutines();
				for(const r of local) {
					await saveRoutineToFirestore(userData.uid, r);
				}
				set(local);
			}
		} else {
			// Guest mode
			set(loadLocalRoutines());
		}
	});

	return {
		subscribe,
		
		refresh: async () => {
			const userData = get(user);
			if (userData) {
				const remoteRoutines = await loadRoutinesFromFirestore(userData.uid);
				saveAllRoutines(remoteRoutines);
				set(remoteRoutines);
			} else {
				set(loadLocalRoutines());
			}
		},
		
		save: async (name: string, intervals: Interval[], repetitions: number) => {
			const userData = get(user);
			const result = saveLocalRoutine(name, intervals, repetitions);
			
			if (result.success && result.routine) {
				if (userData) {
					await saveRoutineToFirestore(userData.uid, result.routine);
				}
				update(routines => [result.routine!, ...routines]);
			}
			return result;
		},

		update: async (id: string, name: string, intervals: Interval[], repetitions: number) => {
			const userData = get(user);
			const result = updateLocalRoutine(id, name, intervals, repetitions);
			
			if (result.success && result.routine) {
				if (userData) {
					await updateRoutineInFirestore(userData.uid, id, result.routine);
				}
				update(routines => routines.map(r => r.id === id ? result.routine! : r));
			}
			return result;
		},
		
		delete: async (id: string) => {
			const userData = get(user);
			const success = deleteLocalRoutine(id);
			if (success) {
				if (userData) {
					await deleteRoutineFromFirestore(userData.uid, id);
				}
				update(routines => routines.filter(r => r.id !== id));
			}
			return success;
		},
		
		load: (id: string): SavedRoutine | undefined => {
			const routines = get({ subscribe });
			return routines.find(r => r.id === id);
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
