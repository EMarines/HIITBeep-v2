// Definición de tipos locales
export interface Interval {
	name: string;
	duration: number;
	color: string;
	type?: 'interval' | 'repeat' | 'weights';
	sets?: number;
	restTime?: number;
}

export interface SavedRoutine {
	id: string;
	name: string;
	intervals: Interval[];
	repetitions: number;
	createdAt: number;
	lastUsed?: number;
}

export interface WorkoutLog {
	id: string;
	routineId: string;
	routineName: string;
	completedAt: number;
	duration: number;
	repetitionsCompleted: number;
}

const STORAGE_KEY_ROUTINES = 'hiitbeep_routines';
const STORAGE_KEY_LOGS = 'hiitbeep_workout_logs';
const MAX_ROUTINES = 15;
const MAX_LOGS = 100;

/**
 * Guardar una nueva rutina
 */
export function saveRoutine(name: string, intervals: Interval[], repetitions: number): { success: boolean; error?: string; routine?: SavedRoutine } {
	try {
		const routines = loadRoutines();
		
		// Verificar límite de 15 rutinas
		if (routines.length >= MAX_ROUTINES) {
			return { success: false, error: 'Límite de 15 rutinas alcanzado. Elimina una rutina para agregar otra.' };
		}
		
		// Crear nueva rutina
		const newRoutine: SavedRoutine = {
			id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			name,
			intervals: JSON.parse(JSON.stringify(intervals)), // Deep clone
			repetitions,
			createdAt: Date.now(),
			lastUsed: Date.now()
		};
		
		routines.push(newRoutine);
		localStorage.setItem(STORAGE_KEY_ROUTINES, JSON.stringify(routines));
		
		return { success: true, routine: newRoutine };
	} catch (error) {
		console.error('Error guardando rutina:', error);
		return { success: false, error: 'Error al guardar la rutina' };
	}
}

/**
 * Actualizar una rutina existente
 */
export function updateRoutine(id: string, name: string, intervals: Interval[], repetitions: number): { success: boolean; error?: string; routine?: SavedRoutine } {
	try {
		const routines = loadRoutines();
		const routineIndex = routines.findIndex(r => r.id === id);
		
		if (routineIndex === -1) {
			return { success: false, error: 'Rutina no encontrada' };
		}
		
		// Actualizar rutina manteniendo el ID y fecha de creación original
		const updatedRoutine: SavedRoutine = {
			...routines[routineIndex],
			name,
			intervals: JSON.parse(JSON.stringify(intervals)), // Deep clone
			repetitions,
			lastUsed: Date.now()
		};
		
		routines[routineIndex] = updatedRoutine;
		localStorage.setItem(STORAGE_KEY_ROUTINES, JSON.stringify(routines));
		
		return { success: true, routine: updatedRoutine };
	} catch (error) {
		console.error('Error actualizando rutina:', error);
		return { success: false, error: 'Error al actualizar la rutina' };
	}
}

/**
 * Cargar todas las rutinas guardadas
 */
export function loadRoutines(): SavedRoutine[] {
	try {
		const data = localStorage.getItem(STORAGE_KEY_ROUTINES);
		if (!data) return [];
		
		const routines: SavedRoutine[] = JSON.parse(data);
		// Ordenar por última vez usada (más reciente primero)
		return routines.sort((a, b) => (b.lastUsed || b.createdAt) - (a.lastUsed || a.createdAt));
	} catch (error) {
		console.error('Error cargando rutinas:', error);
		return [];
	}
}

/**
 * Eliminar una rutina
 */
export function deleteRoutine(id: string): boolean {
	try {
		const routines = loadRoutines();
		const filtered = routines.filter(r => r.id !== id);
		localStorage.setItem(STORAGE_KEY_ROUTINES, JSON.stringify(filtered));
		return true;
	} catch (error) {
		console.error('Error eliminando rutina:', error);
		return false;
	}
}

/**
 * Actualizar fecha de último uso de una rutina
 */
export function updateRoutineLastUsed(id: string): void {
	try {
		const routines = loadRoutines();
		const routine = routines.find(r => r.id === id);
		if (routine) {
			routine.lastUsed = Date.now();
			localStorage.setItem(STORAGE_KEY_ROUTINES, JSON.stringify(routines));
		}
	} catch (error) {
		console.error('Error actualizando rutina:', error);
	}
}

/**
 * Registrar un entrenamiento completado
 */
export function logWorkout(routineId: string, routineName: string, duration: number, repetitionsCompleted: number): void {
	try {
		const logs = loadWorkoutLogs();
		
		const newLog: WorkoutLog = {
			id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			routineId,
			routineName,
			completedAt: Date.now(),
			duration,
			repetitionsCompleted
		};
		
		logs.unshift(newLog); // Agregar al inicio
		
		// Mantener solo los últimos 100 registros
		if (logs.length > MAX_LOGS) {
			logs.splice(MAX_LOGS);
		}
		
		localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
		
		// Actualizar lastUsed de la rutina
		updateRoutineLastUsed(routineId);
	} catch (error) {
		console.error('Error registrando entrenamiento:', error);
	}
}

/**
 * Cargar historial de entrenamientos
 */
export function loadWorkoutLogs(): WorkoutLog[] {
	try {
		const data = localStorage.getItem(STORAGE_KEY_LOGS);
		if (!data) return [];
		return JSON.parse(data);
	} catch (error) {
		console.error('Error cargando historial:', error);
		return [];
	}
}

/**
 * Exportar todos los datos (rutinas + logs) como JSON
 */
export function exportData(): string {
	const routines = loadRoutines();
	const logs = loadWorkoutLogs();
	
	return JSON.stringify({
		version: '1.0',
		exportDate: new Date().toISOString(),
		routines,
		workoutLogs: logs
	}, null, 2);
}

/**
 * Importar datos desde JSON
 */
export function importData(jsonString: string): { success: boolean; error?: string; imported?: { routines: number; logs: number } } {
	try {
		const data = JSON.parse(jsonString);
		
		// Validar estructura
		if (!data.routines || !Array.isArray(data.routines)) {
			return { success: false, error: 'Formato de datos inválido: falta el array de rutinas' };
		}
		
		// Cargar rutinas existentes
		const existingRoutines = loadRoutines();
		const existingLogs = loadWorkoutLogs();
		
		// Merge rutinas (evitar duplicados por nombre)
		const existingNames = new Set(existingRoutines.map(r => r.name.toLowerCase()));
		const newRoutines = data.routines.filter((r: SavedRoutine) => !existingNames.has(r.name.toLowerCase()));
		
		const totalRoutines = [...existingRoutines, ...newRoutines];
		
		// Respetar límite de 15 rutinas
		if (totalRoutines.length > MAX_ROUTINES) {
			return { 
				success: false, 
				error: `Se excede el límite de ${MAX_ROUTINES} rutinas. Tienes ${existingRoutines.length} y quieres importar ${newRoutines.length}.` 
			};
		}
		
		// Merge logs
		const allLogs = [...existingLogs, ...(data.workoutLogs || [])];
		const limitedLogs = allLogs.slice(0, MAX_LOGS);
		
		// Guardar
		localStorage.setItem(STORAGE_KEY_ROUTINES, JSON.stringify(totalRoutines));
		localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(limitedLogs));
		
		return { 
			success: true, 
			imported: { 
				routines: newRoutines.length, 
				logs: (data.workoutLogs || []).length 
			} 
		};
	} catch (error) {
		console.error('Error importando datos:', error);
		return { success: false, error: 'Error al procesar el archivo JSON' };
	}
}

/**
 * Obtener estadísticas generales
 */
export function getStats(): { totalRoutines: number; totalWorkouts: number; totalMinutes: number } {
	const routines = loadRoutines();
	const logs = loadWorkoutLogs();
	
	const totalMinutes = logs.reduce((sum, log) => sum + Math.floor(log.duration / 60), 0);
	
	return {
		totalRoutines: routines.length,
		totalWorkouts: logs.length,
		totalMinutes
	};
}
