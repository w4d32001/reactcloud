// components/TranslationSettings.jsx
import { SUPPORTED_LANGUAGES } from '../utils/translationUtils';
import { X, Globe, ToggleLeft, ToggleRight } from 'lucide-react';

const TranslationSettings = ({ config, onConfigChange, onClose }) => {
  const handleToggleTranslation = () => {
    onConfigChange({
      ...config,
      enabled: !config.enabled
    });
  };

  const handleLanguageChange = (languageCode) => {
    onConfigChange({
      ...config,
      targetLanguage: languageCode
    });
  };

  const handleToggleShowOriginal = () => {
    onConfigChange({
      ...config,
      showOriginal: !config.showOriginal
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-4 w-full max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Traducción
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Toggle principal */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Traducir mensajes
        </span>
        <button
          onClick={handleToggleTranslation}
          className={`p-1 rounded-full transition-colors ${
            config.enabled 
              ? 'text-blue-500 hover:text-blue-600' 
              : 'text-gray-400 hover:text-gray-500'
          }`}
        >
          {config.enabled ? (
            <ToggleRight className="h-6 w-6" />
          ) : (
            <ToggleLeft className="h-6 w-6" />
          )}
        </button>
      </div>

      {config.enabled && (
        <>
          {/* Selector de idioma */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Traducir a:
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code)}
                  className={`flex items-center space-x-2 p-2 rounded-md text-xs transition-colors ${
                    config.targetLanguage === code
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <span>{info.flag}</span>
                  <span className="truncate">{info.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle mostrar original */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Mostrar texto original
            </span>
            <button
              onClick={handleToggleShowOriginal}
              className={`p-1 rounded-full transition-colors ${
                config.showOriginal 
                  ? 'text-blue-500 hover:text-blue-600' 
                  : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              {config.showOriginal ? (
                <ToggleRight className="h-6 w-6" />
              ) : (
                <ToggleLeft className="h-6 w-6" />
              )}
            </button>
          </div>
        </>
      )}

      {/* Información adicional */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Solo se traducen los mensajes de otros usuarios
        </p>
      </div>
    </div>
  );
};

export default TranslationSettings;