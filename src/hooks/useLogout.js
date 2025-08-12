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
// hooks/useLogout.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { logout } from "../lib/api";
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
    onSuccess: (data) => {
      toast.success(data.message || "Logout successful");
      
      queryClient.clear();
      
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["streamToken"] });

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 100);
    },
    onError: (error) => {
      console.error("Error during logout:", error);
      toast.error(error.response?.data?.message || "Error al cerrar sesión");
    },
  });

  return { logoutMutation, isPending, error };
};

export default useLogout;
