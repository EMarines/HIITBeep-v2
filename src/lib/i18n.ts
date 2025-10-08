import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import translations from './translations.json';

// Detectar idioma del navegador o usar español como default
function getInitialLanguage(): string {
  if (!browser) return 'es';
  
  const saved = localStorage.getItem('hiitbeep-language');
  if (saved && ['es', 'en'].includes(saved)) {
    return saved;
  }
  
  const browserLang = navigator.language.split('-')[0];
  return ['es', 'en'].includes(browserLang) ? browserLang : 'es';
}

// Store reactivo para el idioma actual
export const currentLanguage = writable<string>(getInitialLanguage());

// Store derivado para las traducciones del idioma actual
export const t = derived(currentLanguage, ($lang) => {
  const langTranslations = translations[$lang as keyof typeof translations] || translations.es;
  
  return function translate(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: any = langTranslations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }
    
    // Reemplazar parámetros {param} en la traducción
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param]?.toString() || match;
      });
    }
    
    return value;
  };
});

// Función para cambiar idioma
export function setLanguage(lang: string) {
  if (['es', 'en'].includes(lang)) {
    currentLanguage.set(lang);
    if (browser) {
      localStorage.setItem('hiitbeep-language', lang);
    }
  }
}

// Función para obtener idiomas disponibles
export function getAvailableLanguages() {
  return [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];
}