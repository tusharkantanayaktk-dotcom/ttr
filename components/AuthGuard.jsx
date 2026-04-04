"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("email");
    const phone = localStorage.getItem("phone");
    const token = localStorage.getItem("token");

    // If neither email nor phone exist, OR token is missing → redirect
    if ((!email && !phone) || !token) {
      router.replace("/login");
    } else {
      setAllowed(true);
    }
  }, []);

  // Avoid flicker while checking
  if (!allowed) return null;

  return children;
}
