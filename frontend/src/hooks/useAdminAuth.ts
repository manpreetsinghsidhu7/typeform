import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAdminAuth(requireAuth = true) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInitial, setUserInitial] = useState("A");

  useEffect(() => {
    const authenticate = async () => {
      let token = localStorage.getItem("typeform_token");
      
      if (!token && requireAuth) {
        // Attempt to auto-login with default seeded admin credentials
        try {
          const formData = new URLSearchParams();
          formData.append("username", "admin");
          formData.append("password", "@Admin123");
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            token = data.access_token;
            localStorage.setItem("typeform_token", token as string);
          }
        } catch (e) {
          console.error("Auto-login failed:", e);
        }
      }

      if (!token) {
        if (requireAuth) {
          router.push("/login");
        } else {
          setIsLoading(false);
        }
        return;
      }

      // We have a token
      setIsAuthenticated(true);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.sub) {
          setUserInitial(payload.sub.charAt(0).toUpperCase());
        }
      } catch (e) {
        console.error("Invalid token");
      }
      setIsLoading(false);
    };

    authenticate();
  }, [router, requireAuth]);

  return { isAuthenticated, isLoading, userInitial };
}
