/*import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api";

const useLogout = () => {
  const queryClient = useQueryClient();

  const {
    mutate: logoutMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  });

  return { logoutMutation, isPending, error };
};
export default useLogout;*/

// hooks/useLogout.js - Versión completa
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { logout } from "../lib/api";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: logoutMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: logout,
    onSuccess: async (data) => {
      try {
        // Desconectar Stream Chat si está conectado
        const streamApiKey = import.meta.env.VITE_STREAM_API_KEY;
        if (streamApiKey) {
          const chatClient = StreamChat.getInstance(streamApiKey);
          if (chatClient.user) {
            await chatClient.disconnectUser();
          }
        }
      } catch (streamError) {
        console.error("Error disconnecting from Stream Chat:", streamError);
      }

      // Mostrar mensaje de éxito
      toast.success(data.message || "Sesión cerrada exitosamente");
      
      // Limpiar todas las queries del cache
      queryClient.clear();
      
      // Limpiar localStorage si tienes algo allí (aunque no deberías según las restricciones)
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirigir al login
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      console.error("Error during logout:", error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Error al cerrar sesión";
      toast.error(errorMessage);
    },
  });

  return { logoutMutation, isPending, error };
};

export default useLogout;