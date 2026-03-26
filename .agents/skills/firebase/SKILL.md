---
name: Firebase Architecture & Management
description: Firebase configuration, services (Auth, Firestore, Storage), and troubleshooting (CORS, rules).
---

# HIITBeep Firebase Skill

Este documento define la infraestructura de Backend basada en Firebase para HIITBeep.

## 1. Configuración del Proyecto
*   **Project ID:** `hiitbeep-473a2`
*   **Storage Bucket:** `hiitbeep-473a2.firebasestorage.app` (alternativamente `hiitbeep-473a2.appspot.com`)
*   **Región:** Usar servidores `us-central1` o cercanos para latencia mínima.

## 2. Servicios Activos
*   **Authentication:** 
    *   Métodos: Google Auth, Email/Password.
    *   Sincronización: Al cambiar perfil, actualizar tanto Firestore como Auth Profile (`displayName`, `photoURL`).
*   **Firestore:**
    *   Colección `users`: Perfiles extendidos (edad, peso, meta, `photoURL`).
    *   Colección `routines`: Rutinas guardadas del usuario.
*   **Storage:** 
    *   Carpeta `avatars/`: Almacena las fotos de perfil de los usuarios usando su `uid` como nombre de archivo.

## 3. Resolución de Problemas (Troubleshooting)

### Error de CORS en Storage
Si la subida de imágenes falla con error de CORS desde `localhost`, es necesario aplicar una política mediante Google Cloud CLI.

**Política recomendada (`cors.json`):**
```json
[
  {
    "origin": ["*"],
    "method": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "x-goog-resumable"],
    "maxAgeSeconds": 3600
  }
]
```

**Comando para aplicar:**
```bash
gcloud storage buckets update gs://hiitbeep-473a2.firebasestorage.app --cors-file=cors.json
```

## 4. Mejores Prácticas
1. **Inicialización Única:** Siempre importar `db`, `auth` y `storage` desde `$lib/services/firebase`.
2. **Resiliencia en Cargas:** Usar `uploadBytesResumable` para dar feedback visual al usuario (Premium UX).
3. **Limpieza de Datos:** Al borrar un usuario, eliminar su carpeta de `avatars/` y sus rutinas de Firestore.
