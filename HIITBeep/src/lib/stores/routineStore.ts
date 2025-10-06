import { writable, derived } from 'svelte/store';
import {
	loadRoutines,
	deleteRoutine as deleteRoutineService,
	saveRoutine as saveRoutineService,
	getStats,
	type SavedRoutine,
	type Interval
} from '$lib/services/routineStorage';

function createRoutineStore() {
	const { subscribe, set, update } = writable<SavedRoutine[]>([]);

	// Cargar rutinas al iniciar
	set(loadRoutines());

	return {
		subscribe,
		
		/**
		 * Refrescar rutinas desde localStorage
		 */
		refresh: () => {
			set(loadRoutines());
		},
		
		/**
		 * Guardar una nueva rutina
		 */
		save: (name: string, intervals: Interval[], repetitions: number) => {
			const result = saveRoutineService(name, intervals, repetitions);
			if (result.success) {
				update(routines => [...routines, result.routine!]);
			}
			return result;
		},
		
		/**
		 * Eliminar una rutina
		 */
		delete: (id: string) => {
			const success = deleteRoutineService(id);
			if (success) {
				update(routines => routines.filter(r => r.id !== id));
			}
			return success;
		},
		
		/**
		 * Cargar una rutina (devuelve la rutina encontrada)
		 */
		load: (id: string): SavedRoutine | undefined => {
			const routines = loadRoutines();
			return routines.find(r => r.id === id);
		}
	};
}

export const routineStore = createRoutineStore();

/**
 * Store derivado para estadísticas
 */
export const routineStats = derived(routineStore, () => getStats());
