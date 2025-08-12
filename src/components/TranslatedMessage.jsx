import { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Languages, Eye, EyeOff, RotateCcw } from 'lucide-react';

const TranslatedMessage = ({ 
  message, 
  currentUserId, 
  currentUser, // Nuevo prop para obtener el usuario actual
  targetLanguage = null // Ahora es opcional
}) => {
  const [translatedText, setTranslatedText] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [error, setError] = useState(null);
  const { translateText, isTranslating } = useTranslation();

  const shouldTranslate = message.user?.id !== currentUserId;
  const messageText = message.text || '';
  
  // Usar el idioma nativo del usuario actual, o 'es' como fallback
  const userNativeLanguage = currentUser?.nativeLanguage || 'es';
  const translationTarget = targetLanguage || userNativeLanguage;

  useEffect(() => {
    const translateMessage = async () => {
      if (!shouldTranslate || !messageText.trim()) return;

      try {
        setError(null);
        const translated = await translateText(messageText, translationTarget, 'auto');
        
        if (translated && translated !== messageText) {
          setTranslatedText(translated);
        }
      } catch (err) {
        console.error('Error translating message:', err);
        setError('Error al traducir');
      }
    };

    translateMessage();
  }, [messageText, shouldTranslate, translationTarget, translateText]);

  const handleRetryTranslation = async () => {
    if (!shouldTranslate || !messageText.trim()) return;
    
    setError(null);
    setTranslatedText(null);
    
    try {
      const translated = await translateText(messageText, translationTarget, 'auto');
      if (translated && translated !== messageText) {
        setTranslatedText(translated);
      }
    } catch (err) {
      setError('Error al traducir');
    }
  };

  // Si no debe traducirse, devolver el mensaje original
  if (!shouldTranslate) {
    return (
      <div className="message-content">
        <p className="text-gray-800 dark:text-gray-200">{messageText}</p>
      </div>
    );
  }

  return (
    <div className="message-content space-y-2">
      {/* Mensaje traducido */}
      {isTranslating ? (
        <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span>Traduciendo...</span>
        </div>
      ) : translatedText ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 pl-3 py-2 rounded-r-md">
          <div className="flex items-start justify-between">
            <p className="text-gray-800 dark:text-gray-200 font-medium">
              {translatedText}
            </p>
            <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
              <Languages className="h-4 w-4 text-blue-500" />
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full transition-colors"
                title={showOriginal ? 'Ocultar original' : 'Mostrar original'}
              >
                {showOriginal ? (
                  <EyeOff className="h-3 w-3 text-blue-500" />
                ) : (
                  <Eye className="h-3 w-3 text-blue-500" />
                )}
              </button>
            </div>
          </div>
          {/* Mostrar a qué idioma se tradujo */}
          <div className="mt-1">
            <span className="text-xs text-blue-500 dark:text-blue-400">
              Traducido a {getLanguageName(translationTarget)}
            </span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 pl-3 py-2 rounded-r-md">
          <div className="flex items-center justify-between">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            <button
              onClick={handleRetryTranslation}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded-full transition-colors ml-2"
              title="Reintentar traducción"
            >
              <RotateCcw className="h-3 w-3 text-red-500" />
            </button>
          </div>
        </div>
      ) : null}

      {/* Mensaje original */}
      {(showOriginal || (!translatedText && !isTranslating)) && (
        <div className={`${translatedText ? 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-md' : ''}`}>
          {translatedText && (
            <div className="flex items-center space-x-1 mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Original:
              </span>
            </div>
          )}
          <p className={`${translatedText ? 'text-gray-600 dark:text-gray-300 text-sm' : 'text-gray-800 dark:text-gray-200'}`}>
            {messageText}
          </p>
        </div>
      )}
    </div>
  );
};

// Función auxiliar para obtener el nombre del idioma
const getLanguageName = (code) => {
  const languages = {
    'es': 'Español',
    'en': 'English',
    'fr': 'Français',
    'de': 'Deutsch',
    'it': 'Italiano',
    'pt': 'Português',
    'zh': '中文',
    'ja': '日本語',
    'ko': '한국어',
    'ar': 'العربية',
    'ru': 'Русский',
    // Agrega más idiomas según necesites
  };
  
  return languages[code] || code.toUpperCase();
};

export default TranslatedMessage;