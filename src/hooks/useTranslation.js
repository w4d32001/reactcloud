// hooks/useTranslation.js
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const FLASK_API_URL = import.meta.env.VITE_FLASK_API_URL || 'https://f-askcloud-production.up.railway.app/';

export const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState(new Map());

  // Función para traducir texto
  const translateText = useCallback(async (text, targetLang = 'es', sourceLang = 'auto') => {
    if (!text || !text.trim()) return null;

    // Crear clave para cache
    const cacheKey = `${text.trim()}-${sourceLang}-${targetLang}`;
    
    // Verificar cache
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }

    setIsTranslating(true);

    try {
      const response = await fetch(`${FLASK_API_URL}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          target_language: targetLang,
          source_language: sourceLang,
          service: 'google'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.translated_text) {
        // Guardar en cache
        const newCache = new Map(translationCache);
        newCache.set(cacheKey, data.translated_text);
        setTranslationCache(newCache);
        
        return data.translated_text;
      } else {
        throw new Error(data.message || 'Translation failed');
      }
    } catch (error) {
      console.error('Error translating text:', error);
      toast.error('Error al traducir el mensaje');
      return null;
    } finally {
      setIsTranslating(false);
    }
  }, [translationCache]);

  // Función para detectar idioma
  const detectLanguage = useCallback(async (text) => {
    if (!text || !text.trim()) return null;

    try {
      const response = await fetch(`${FLASK_API_URL}/detect-language`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.detected_language) {
        return data.detected_language;
      }
      
      return null;
    } catch (error) {
      console.error('Error detecting language:', error);
      return null;
    }
  }, []);

  // Función para traducir múltiples textos
  const translateBatch = useCallback(async (texts, targetLang = 'es', sourceLang = 'auto') => {
    if (!texts || !Array.isArray(texts) || texts.length === 0) return [];

    setIsTranslating(true);

    try {
      const response = await fetch(`${FLASK_API_URL}/batch-translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          texts: texts,
          target_language: targetLang,
          source_language: sourceLang,
          service: 'google'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.results) {
        return data.results;
      } else {
        throw new Error('Batch translation failed');
      }
    } catch (error) {
      console.error('Error in batch translation:', error);
      toast.error('Error al traducir los mensajes');
      return [];
    } finally {
      setIsTranslating(false);
    }
  }, []);

  // Función para limpiar cache
  const clearCache = useCallback(() => {
    setTranslationCache(new Map());
  }, []);

  // Función para obtener estadísticas del cache
  const getCacheStats = useCallback(() => {
    return {
      size: translationCache.size,
      keys: Array.from(translationCache.keys())
    };
  }, [translationCache]);

  return {
    translateText,
    detectLanguage,
    translateBatch,
    clearCache,
    getCacheStats,
    isTranslating,
    cacheSize: translationCache.size
  };
};