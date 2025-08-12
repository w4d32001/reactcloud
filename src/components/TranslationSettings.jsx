// components/TranslationSettings.jsx
import { useState } from 'react';
import { X, Languages, Globe } from 'lucide-react';

const TranslationSettings = ({ 
  config, 
  onConfigChange, 
  onClose, 
  userNativeLanguage, 
  userLearningLanguage 
}) => {
  const [localConfig, setLocalConfig] = useState(config);

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  ];

  const handleSave = () => {
    onConfigChange(localConfig);
    onClose();
  };

  const handleQuickSelect = (languageCode) => {
    setLocalConfig(prev => ({
      ...prev,
      targetLanguage: languageCode
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-full max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Languages className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Configuración de Traducción
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Activar/Desactivar traducción */}
      <div className="mb-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={localConfig.enabled}
            onChange={(e) => setLocalConfig(prev => ({
              ...prev,
              enabled: e.target.checked
            }))}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="text-sm text-gray-900 dark:text-gray-100">
            Activar traducción automática
          </span>
        </label>
      </div>

      {localConfig.enabled && (
        <>
          {/* Accesos rápidos para idiomas del usuario */}
          {(userNativeLanguage || userLearningLanguage) && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Accesos rápidos:
              </p>
              <div className="flex space-x-2">
                {userNativeLanguage && (
                  <button
                    onClick={() => handleQuickSelect(userNativeLanguage)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      localConfig.targetLanguage === userNativeLanguage
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Globe className="h-3 w-3 inline mr-1" />
                    Mi idioma
                  </button>
                )}
                {userLearningLanguage && userLearningLanguage !== userNativeLanguage && (
                  <button
                    onClick={() => handleQuickSelect(userLearningLanguage)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      localConfig.targetLanguage === userLearningLanguage
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Languages className="h-3 w-3 inline mr-1" />
                    Aprendiendo
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Selector de idioma */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Traducir a:
            </label>
            <select
              value={localConfig.targetLanguage}
              onChange={(e) => setLocalConfig(prev => ({
                ...prev,
                targetLanguage: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mostrar texto original */}
          <div className="mb-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localConfig.showOriginal}
                onChange={(e) => setLocalConfig(prev => ({
                  ...prev,
                  showOriginal: e.target.checked
                }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-900 dark:text-gray-100">
                Mostrar texto original por defecto
              </span>
            </label>
          </div>
        </>
      )}

      {/* Botones de acción */}
      <div className="flex space-x-2 pt-2 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={handleSave}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Guardar
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default TranslationSettings;