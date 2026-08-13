import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAdminAuth(requireAuth = true) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInitial, setUserInitial] = useState("A");

  useEffect(() => {
    const token = localStorage.getItem("typeform_token");
    if (!token) {
      if (requireAuth) {
        router.push("/login");
      }
    } else {
      setIsAuthenticated(true);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.sub) {
          setUserInitial(payload.sub.charAt(0).toUpperCase());
        }
      } catch (e) {
        console.error("Invalid token");
      }
    }
    setIsLoading(false);
  }, [router, requireAuth]);

  return { isAuthenticated, isLoading, userInitial };
}
