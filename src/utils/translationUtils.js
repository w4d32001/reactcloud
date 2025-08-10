// utils/translationUtils.js

// Lista de idiomas soportados con sus códigos y nombres
export const SUPPORTED_LANGUAGES = {
  'es': { name: 'Español', flag: '🇪🇸', rtl: false },
  'en': { name: 'English', flag: '🇺🇸', rtl: false },
  'fr': { name: 'Français', flag: '🇫🇷', rtl: false },
  'de': { name: 'Deutsch', flag: '🇩🇪', rtl: false },
  'it': { name: 'Italiano', flag: '🇮🇹', rtl: false },
  'pt': { name: 'Português', flag: '🇵🇹', rtl: false },
  'zh': { name: '中文', flag: '🇨🇳', rtl: false },
  'ja': { name: '日本語', flag: '🇯🇵', rtl: false },
  'ko': { name: '한국어', flag: '🇰🇷', rtl: false },
  'ar': { name: 'العربية', flag: '🇸🇦', rtl: true },
  'ru': { name: 'Русский', flag: '🇷🇺', rtl: false },
  'hi': { name: 'हिन्दी', flag: '🇮🇳', rtl: false },
  'th': { name: 'ไทย', flag: '🇹🇭', rtl: false },
  'vi': { name: 'Tiếng Việt', flag: '🇻🇳', rtl: false },
  'tr': { name: 'Türkçe', flag: '🇹🇷', rtl: false },
  'pl': { name: 'Polski', flag: '🇵🇱', rtl: false },
  'nl': { name: 'Nederlands', flag: '🇳🇱', rtl: false },
  'sv': { name: 'Svenska', flag: '🇸🇪', rtl: false },
  'da': { name: 'Dansk', flag: '🇩🇰', rtl: false },
  'no': { name: 'Norsk', flag: '🇳🇴', rtl: false },
  'fi': { name: 'Suomi', flag: '🇫🇮', rtl: false }
};

/**
 * Obtiene la información de un idioma por su código
 * @param {string} languageCode - Código del idioma (ej: 'es', 'en')
 * @returns {object} Información del idioma
 */
export const getLanguageInfo = (languageCode) => {
  return SUPPORTED_LANGUAGES[languageCode] || { 
    name: languageCode.toUpperCase(), 
    flag: '🌐', 
    rtl: false 
  };
};

/**
 * Detecta si un texto probablemente necesita traducción
 * @param {string} text - Texto a analizar
 * @param {string} targetLanguage - Idioma destino
 * @returns {boolean} true si probablemente necesita traducción
 */
export const shouldTranslate = (text, targetLanguage) => {
  if (!text || text.trim().length === 0) return false;
  
  // Patrones básicos para detectar idiomas sin usar APIs
  const patterns = {
    'es': /[ñáéíóúü]/i,
    'en': /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/i,
    'fr': /[àâäçéèêëïîôöùûüÿ]|qu'|c'est|d'|l'/i,
    'de': /[äöüß]|der|die|das|und|oder/i,
    'zh': /[\u4e00-\u9fff]/,
    'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
    'ar': /[\u0600-\u06ff]/,
    'ru': /[а-яё]/i,
    'hi': /[\u0900-\u097f]/,
    'th': /[\u0e00-\u0e7f]/,
    'ko': /[\uac00-\ud7af]/
  };
  
  const targetPattern = patterns[targetLanguage];
  if (targetPattern && targetPattern.test(text)) {
    return false; // Ya está en el idioma destino
  }
  
  return true; // Probablemente necesita traducción
};

/**
 * Limpia y prepara el texto para traducción
 * @param {string} text - Texto a limpiar
 * @returns {string} Texto limpio
 */
export const cleanTextForTranslation = (text) => {
  if (!text) return '';
  
  return text
    .trim()
    .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
    .replace(/\n+/g, '\n') // Múltiples saltos de línea a uno solo
    .slice(0, 5000); // Limitar longitud máxima
};

/**
 * Formatea un mensaje traducido para mostrar
 * @param {string} originalText - Texto original
 * @param {string} translatedText - Texto traducido
 * @param {string} sourceLanguage - Idioma origen
 * @param {string} targetLanguage - Idioma destino
 * @returns {object} Objeto con información del mensaje formateado
 */
export const formatTranslatedMessage = (originalText, translatedText, sourceLanguage, targetLanguage) => {
  const sourceLang = getLanguageInfo(sourceLanguage);
  const targetLang = getLanguageInfo(targetLanguage);
  
  return {
    originalText: originalText.trim(),
    translatedText: translatedText.trim(),
    sourceLanguage: {
      code: sourceLanguage,
      ...sourceLang
    },
    targetLanguage: {
      code: targetLanguage,
      ...targetLang
    },
    timestamp: new Date().toISOString(),
    confidence: calculateTranslationConfidence(originalText, translatedText)
  };
};

/**
 * Calcula una estimación de confianza de la traducción
 * @param {string} original - Texto original
 * @param {string} translated - Texto traducido
 * @returns {number} Nivel de confianza (0-1)
 */
const calculateTranslationConfidence = (original, translated) => {
  if (!original || !translated) return 0;
  
  // Factores básicos para estimar calidad
  const lengthRatio = Math.min(translated.length / original.length, original.length / translated.length);
  const wordCountRatio = Math.min(
    translated.split(' ').length / original.split(' ').length,
    original.split(' ').length / translated.split(' ').length
  );
  
  // Si son idénticos, probablemente no se tradujo
  if (original.toLowerCase().trim() === translated.toLowerCase().trim()) {
    return 0.1;
  }
  
  // Combinar factores
  return Math.min(1, (lengthRatio + wordCountRatio) / 2);
};

/**
 * Guarda configuración de traducción en localStorage (para persistencia)
 * @param {object} config - Configuración a guardar
 */
export const saveTranslationConfig = (config) => {
  try {
    localStorage.setItem('chatTranslationConfig', JSON.stringify({
      autoTranslate: config.autoTranslate || false,
      targetLanguage: config.targetLanguage || 'es',
      showOriginal: config.showOriginal !== undefined ? config.showOriginal : true,
      lastUpdated: new Date().toISOString()
    }));
  } catch (error) {
    console.warn('No se pudo guardar configuración de traducción:', error);
  }
};

/**
 * Carga configuración de traducción desde localStorage
 * @returns {object} Configuración cargada
 */
export const loadTranslationConfig = () => {
  try {
    const saved = localStorage.getItem('chatTranslationConfig');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn('No se pudo cargar configuración de traducción:', error);
  }
  
  // Configuración por defecto
  return {
    autoTranslate: false,
    targetLanguage: 'es',
    showOriginal: true
  };
};

/**
 * Genera un ID único para cachear traducciones
 * @param {string} text - Texto a traducir
 * @param {string} sourceLang - Idioma origen
 * @param {string} targetLang - Idioma destino
 * @returns {string} ID único
 */
export const generateTranslationKey = (text, sourceLang, targetLang) => {
  const normalizedText = text.toLowerCase().trim().replace(/\s+/g, ' ');
  return `${sourceLang}-${targetLang}-${btoa(normalizedText).slice(0, 20)}`;
};

/**
 * Valida si una traducción es válida
 * @param {string} original - Texto original
 * @param {string} translated - Texto traducido
 * @returns {boolean} true si la traducción es válida
 */
export const isValidTranslation = (original, translated) => {
  if (!original || !translated) return false;
  if (typeof original !== 'string' || typeof translated !== 'string') return false;
  if (original.trim().length === 0 || translated.trim().length === 0) return false;
  
  // Verificar que no sean exactamente iguales (probable falla de traducción)
  if (original.toLowerCase().trim() === translated.toLowerCase().trim()) return false;
  
  // Verificar longitud mínima y máxima razonable
  const lengthRatio = translated.length / original.length;
  if (lengthRatio < 0.1 || lengthRatio > 10) return false;
  
  return true;
};

/**
 * Extrae emojis de un texto
 * @param {string} text - Texto del cual extraer emojis
 * @returns {Array} Array de emojis encontrados
 */
export const extractEmojis = (text) => {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  return text.match(emojiRegex) || [];
};

/**
 * Preserva emojis en el texto traducido si no están presentes
 * @param {string} originalText - Texto original
 * @param {string} translatedText - Texto traducido
 * @returns {string} Texto traducido con emojis preservados
 */
export const preserveEmojis = (originalText, translatedText) => {
  const originalEmojis = extractEmojis(originalText);
  const translatedEmojis = extractEmojis(translatedText);
  
  // Si el texto traducido ya tiene emojis, no modificar
  if (translatedEmojis.length > 0) return translatedText;
  
  // Si el original tenía emojis, agregarlos al final
  if (originalEmojis.length > 0) {
    return `${translatedText} ${originalEmojis.join(' ')}`;
  }
  
  return translatedText;
};

/**
 * Estadísticas de uso de traducción
 */
export class TranslationStats {
  constructor() {
    this.stats = this.loadStats();
  }
  
  loadStats() {
    try {
      const saved = localStorage.getItem('translationStats');
      return saved ? JSON.parse(saved) : this.getDefaultStats();
    } catch (error) {
      return this.getDefaultStats();
    }
  }
  
  getDefaultStats() {
    return {
      totalTranslations: 0,
      languagePairs: {},
      dailyUsage: {},
      averageTextLength: 0,
      lastUsed: null
    };
  }
  
  recordTranslation(sourceLang, targetLang, textLength) {
    this.stats.totalTranslations++;
    
    const pairKey = `${sourceLang}-${targetLang}`;
    this.stats.languagePairs[pairKey] = (this.stats.languagePairs[pairKey] || 0) + 1;
    
    const today = new Date().toISOString().split('T')[0];
    this.stats.dailyUsage[today] = (this.stats.dailyUsage[today] || 0) + 1;
    
    // Calcular promedio de longitud de texto
    this.stats.averageTextLength = Math.round(
      (this.stats.averageTextLength * (this.stats.totalTranslations - 1) + textLength) / 
      this.stats.totalTranslations
    );
    
    this.stats.lastUsed = new Date().toISOString();
    this.saveStats();
  }
  
  saveStats() {
    try {
      localStorage.setItem('translationStats', JSON.stringify(this.stats));
    } catch (error) {
      console.warn('No se pudieron guardar las estadísticas:', error);
    }
  }
  
  getStats() {
    return { ...this.stats };
  }
  
  getMostUsedLanguagePair() {
    const pairs = this.stats.languagePairs;
    let maxCount = 0;
    let mostUsedPair = null;
    
    for (const [pair, count] of Object.entries(pairs)) {
      if (count > maxCount) {
        maxCount = count;
        mostUsedPair = pair;
      }
    }
    
    return mostUsedPair ? {
      pair: mostUsedPair,
      count: maxCount,
      source: mostUsedPair.split('-')[0],
      target: mostUsedPair.split('-')[1]
    } : null;
  }
  
  clearStats() {
    this.stats = this.getDefaultStats();
    this.saveStats();
  }
}

/**
 * Manejador de errores de traducción
 */
export class TranslationErrorHandler {
  static ERROR_TYPES = {
    NETWORK_ERROR: 'network_error',
    API_ERROR: 'api_error',
    VALIDATION_ERROR: 'validation_error',
    TIMEOUT_ERROR: 'timeout_error',
    QUOTA_EXCEEDED: 'quota_exceeded'
  };
  
  static handleError(error, context = {}) {
    const errorInfo = {
      type: this.categorizeError(error),
      message: error.message || 'Error desconocido',
      timestamp: new Date().toISOString(),
      context
    };
    
    console.error('Translation Error:', errorInfo);
    
    // Guardar errores para análisis
    this.logError(errorInfo);
    
    return this.getUserFriendlyMessage(errorInfo.type);
  }
  
  static categorizeError(error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return this.ERROR_TYPES.NETWORK_ERROR;
    }
    
    if (error.message.includes('timeout')) {
      return this.ERROR_TYPES.TIMEOUT_ERROR;
    }
    
    if (error.message.includes('quota') || error.message.includes('limit')) {
      return this.ERROR_TYPES.QUOTA_EXCEEDED;
    }
    
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return this.ERROR_TYPES.VALIDATION_ERROR;
    }
    
    return this.ERROR_TYPES.API_ERROR;
  }
  
  static getUserFriendlyMessage(errorType) {
    const messages = {
      [this.ERROR_TYPES.NETWORK_ERROR]: 'Error de conexión. Verifica tu internet e intenta de nuevo.',
      [this.ERROR_TYPES.API_ERROR]: 'Error del servicio de traducción. Intenta de nuevo en unos momentos.',
      [this.ERROR_TYPES.VALIDATION_ERROR]: 'El texto no se puede traducir. Verifica que sea válido.',
      [this.ERROR_TYPES.TIMEOUT_ERROR]: 'La traducción está tardando mucho. Intenta con un texto más corto.',
      [this.ERROR_TYPES.QUOTA_EXCEEDED]: 'Se ha alcanzado el límite de traducciones. Intenta más tarde.'
    };
    
    return messages[errorType] || 'Error inesperado en la traducción.';
  }
  
  static logError(errorInfo) {
    try {
      const errors = JSON.parse(localStorage.getItem('translationErrors') || '[]');
      errors.push(errorInfo);
      
      // Mantener solo los últimos 50 errores
      const recentErrors = errors.slice(-50);
      localStorage.setItem('translationErrors', JSON.stringify(recentErrors));
    } catch (e) {
      // Ignorar errores de localStorage
    }
  }
  
  static getErrorHistory() {
    try {
      return JSON.parse(localStorage.getItem('translationErrors') || '[]');
    } catch (e) {
      return [];
    }
  }
}

/**
 * Detector de idioma simplificado para casos básicos
 */
export const detectLanguageSimple = (text) => {
  if (!text || text.trim().length === 0) return 'unknown';
  
  const patterns = {
    'es': {
      chars: /[ñáéíóúü]/i,
      words: /\b(el|la|los|las|de|en|y|a|que|es|se|no|te|lo|le|da|su|por|son|con|para|una|sobre|todo|más|muy|qué|cómo|dónde|cuándo)\b/gi,
      weight: 0
    },
    'en': {
      chars: /[]/,
      words: /\b(the|be|to|of|and|a|in|that|have|i|it|for|not|on|with|he|as|you|do|at|this|but|his|by|from|they|she|or|an|will|my|one|all|would|there|their)\b/gi,
      weight: 0
    },
    'fr': {
      chars: /[àâäçéèêëïîôöùûüÿ]/i,
      words: /\b(le|de|et|à|un|il|être|et|en|avoir|que|pour|dans|ce|son|une|sur|avec|ne|se|pas|tout|plus|par|grand|en|cette|même|faire|leur)\b/gi,
      weight: 0
    },
    'de': {
      chars: /[äöüß]/i,
      words: /\b(der|die|und|in|den|von|zu|das|mit|sich|des|auf|für|ist|im|dem|nicht|ein|einer|als|auch|es|an|werden|aus|er|hat|dass|sie|nach|wird|bei)\b/gi,
      weight: 0
    }
  };
  
  // Calcular puntajes para cada idioma
  for (const [lang, pattern] of Object.entries(patterns)) {
    const charMatches = (text.match(pattern.chars) || []).length;
    const wordMatches = (text.match(pattern.words) || []).length;
    
    pattern.weight = charMatches * 3 + wordMatches * 2;
  }
  
  // Encontrar el idioma con mayor puntaje
  let maxWeight = 0;
  let detectedLang = 'unknown';
  
  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.weight > maxWeight) {
      maxWeight = pattern.weight;
      detectedLang = lang;
    }
  }
  
  return maxWeight > 0 ? detectedLang : 'unknown';
};

// Instancia global de estadísticas
export const translationStats = new TranslationStats();