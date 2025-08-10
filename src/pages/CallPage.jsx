import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useTranslation } from "../hooks/useTranslation";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initCall = async () => {
      if (!tokenData.token || !authUser || !callId) return;

      try {
        console.log("Initializing Stream video client...");

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callId);

        await callInstance.join({ create: true });

        console.log("Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();
  }, [tokenData, authUser, callId]);

  if (isLoading || isConnecting) return <PageLoader />;

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900">
      <div className="relative w-full h-full">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent authUser={authUser} />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-white">No se pudo iniciar la llamada. Actualice o inténtelo más tarde.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = ({ authUser }) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();
  
  // Estados para subtítulos
  const [subtitles, setSubtitles] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [showSubtitles, setShowSubtitles] = useState(false);
  
  const { translateText, isTranslating } = useTranslation();

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Tu navegador no soporta reconocimiento de voz');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'es-ES';

    recognitionInstance.onresult = async (event) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript = transcript;
        }
      }

      if (finalTranscript) {
        console.log('🎤 Texto detectado:', finalTranscript);
        
        // Agregar subtítulo inmediatamente (sin esperar traducción)
        const tempSubtitle = {
          id: Date.now(),
          original: finalTranscript,
          translated: 'Traduciendo...',
          timestamp: new Date().toLocaleTimeString(),
          speaker: authUser?.fullName || 'Tú',
          isTranslating: true
        };

        setSubtitles(prev => {
          const updated = [...prev, tempSubtitle];
          return updated.slice(-5);
        });
        
        try {
          const translatedText = await translateText(finalTranscript, targetLanguage, 'auto');
          
          setSubtitles(prev => prev.map(sub => 
            sub.id === tempSubtitle.id 
              ? { ...sub, translated: translatedText || finalTranscript, isTranslating: false }
              : sub
          ));

          setTimeout(() => {
            setSubtitles(prev => prev.filter(sub => sub.id !== tempSubtitle.id));
          }, 10000);

        } catch (error) {
          console.error('Error al traducir:', error);
          setSubtitles(prev => prev.map(sub => 
            sub.id === tempSubtitle.id 
              ? { ...sub, translated: finalTranscript, isTranslating: false }
              : sub
          ));
        }
      }
    };

    recognitionInstance.onerror = (event) => {
      console.error('Error en reconocimiento de voz:', event.error);
      if (event.error === 'no-speech') {
        if (isListening) {
          setTimeout(() => {
            try {
              recognitionInstance.start();
            } catch (e) {
              console.log('Ya está escuchando' + e);
            }
          }, 1000);
        }
      }
    };

    recognitionInstance.onend = () => {
      if (isListening) {
        try {
          recognitionInstance.start();
        } catch (e) {
          console.log('Reintentando iniciar reconocimiento...' + e);
          setTimeout(() => {
            try {
              recognitionInstance.start();
            } catch (err) {
              console.error('Error al reiniciar:', err);
            }
          }, 1000);
        }
      }
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [translateText, targetLanguage, authUser, isListening]);

  // Controlar el inicio/parada del reconocimiento
  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      toast.success('Subtítulos desactivados');
    } else {
      try {
        recognition.start();
        setIsListening(true);
        setShowSubtitles(true);
        toast.success('Subtítulos activados');
      } catch (error) {
        console.error('Error al iniciar reconocimiento:', error);
        toast.error('No se pudo activar el reconocimiento de voz');
      }
    }
  };

  if (callingState === CallingState.LEFT) return navigate("/");

  return (
    <div className="relative w-full h-full">
      <StreamTheme>
        <div className="relative h-full">
          <SpeakerLayout />
          
          <div className="absolute top-4 right-4 z-50 bg-black/20 backdrop-blur-md rounded-lg p-4 space-y-3">
            <button
              onClick={toggleListening}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isListening ? '🎤 Detener' : '🎤 Subtítulos'}
            </button>

            {isListening && (
              <div className="space-y-2">
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="px-3 py-1 rounded bg-gray-700 text-white text-sm"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="pt">Português</option>
                  <option value="it">Italiano</option>
                  <option value="de">Deutsch</option>
                </select>
                
                <button
                  onClick={() => {
                    setSubtitles([]);
                    toast.success('Subtítulos limpiados');
                  }}
                  className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 text-white text-sm"
                >
                  Limpiar
                </button>
              </div>
            )}
          </div>

          {isListening && (
            <div className="absolute bottom-20 left-4 right-4 z-40">
              <div className="bg-black/80 backdrop-blur-md rounded-lg p-4 max-h-48 overflow-y-auto border border-white/20">
                {subtitles.length > 0 ? (
                  <div className="space-y-2">
                    {subtitles.map((subtitle) => (
                      <div
                        key={subtitle.id}
                        className="animate-fade-in bg-black/40 rounded p-3 border-l-4 border-blue-500"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-blue-300 text-xs font-medium">
                            {subtitle.speaker}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {subtitle.timestamp}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-gray-300 text-sm">
                            <span className="text-gray-500">Original:</span> {subtitle.original}
                          </p>
                          <p className="text-white text-sm font-medium">
                            <span className="text-blue-400">Traducción:</span> {subtitle.translated}
                          </p>
                        </div>
                        
                        {subtitle.isTranslating ? (
                          <div className="flex items-center mt-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400 mr-2"></div>
                            <span className="text-blue-400 text-xs">Traduciendo...</span>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm">🎤 Esperando que hables...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Indicador de estado del micrófono */}
          {isListening && (
            <div className="absolute top-4 left-4 z-50">
              <div className="bg-red-500/20 backdrop-blur-md rounded-full p-3 border border-red-500/30">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}

          <CallControls />
        </div>
      </StreamTheme>

      {/* Estilos CSS en línea para la animación */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
        `
      }} />
    </div>
  );
};

export default CallPage;