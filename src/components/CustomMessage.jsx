// components/CustomMessage.jsx
import { useState } from 'react';
import { useMessageContext, useChannelStateContext } from 'stream-chat-react';
import { MessageTimestamp, Avatar } from 'stream-chat-react';
import TranslatedMessage from './TranslatedMessage';
import { Settings } from 'lucide-react';
import TranslationSettings from './TranslationSettings';
import useAuthUser from '../hooks/useAuthUser'; // Importar el hook de usuario

const CustomMessage = () => {
  const { message } = useMessageContext();
  const { channel } = useChannelStateContext();
  const { authUser } = useAuthUser(); // Obtener datos del usuario autenticado
  const [showSettings, setShowSettings] = useState(false);
     
  // Obtener el ID del usuario actual
  const currentUserId = channel?.state?.membership?.user?.id;
     
  // Configuración de traducción con idioma nativo del usuario
  const [translationConfig, setTranslationConfig] = useState({
    enabled: true,
    targetLanguage: authUser?.nativeLanguage || 'es', // Usar idioma nativo
    showOriginal: true
  });

  const isMyMessage = message.user?.id === currentUserId;

  // Actualizar configuración cuando cambie el usuario
  useState(() => {
    if (authUser?.nativeLanguage && translationConfig.targetLanguage !== authUser.nativeLanguage) {
      setTranslationConfig(prev => ({
        ...prev,
        targetLanguage: authUser.nativeLanguage
      }));
    }
  }, [authUser?.nativeLanguage]);

  return (
    <div className={`flex items-start space-x-3 mb-4 ${isMyMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      {!isMyMessage && (
        <div className="flex-shrink-0">
          <Avatar 
            image={message.user?.image}
            name={message.user?.name || message.user?.id}
            size={32}
          />
        </div>
      )}

      {/* Mensaje */}
      <div className={`flex-1 max-w-xs sm:max-w-md ${isMyMessage ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Header del mensaje */}
        {!isMyMessage && (
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {message.user?.name || message.user?.id}
            </span>
            <MessageTimestamp 
              message={message}
              className="text-xs text-gray-500 dark:text-gray-400"
            />
          </div>
        )}

        {/* Contenido del mensaje */}
        <div className={`rounded-2xl px-4 py-2 relative group ${
          isMyMessage 
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
        }`}>
          {/* Botón de configuración de traducción */}
          {!isMyMessage && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="absolute -top-2 -right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 dark:border-gray-600"
              title="Configuración de traducción"
            >
              <Settings className="h-3 w-3 text-gray-500 dark:text-gray-400" />
            </button>
          )}

          {/* Componente de traducción */}
          {translationConfig.enabled ? (
            <TranslatedMessage 
              message={message}
              currentUserId={currentUserId}
              currentUser={authUser} // Pasar datos del usuario actual
              targetLanguage={translationConfig.targetLanguage}
            />
          ) : (
            <div className="message-content">
              <p>{message.text}</p>
            </div>
          )}
        </div>

        {/* Timestamp para mensajes propios */}
        {isMyMessage && (
          <div className="mt-1 self-end">
            <MessageTimestamp 
              message={message}
              className="text-xs text-gray-500 dark:text-gray-400"
            />
          </div>
        )}

        {/* Panel de configuración de traducción */}
        {showSettings && (
          <div className="mt-2 w-full">
            <TranslationSettings 
              config={translationConfig}
              onConfigChange={setTranslationConfig}
              onClose={() => setShowSettings(false)}
              userNativeLanguage={authUser?.nativeLanguage} // Pasar idioma nativo
              userLearningLanguage={authUser?.learningLanguage} // Pasar idioma de aprendizaje
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomMessage;