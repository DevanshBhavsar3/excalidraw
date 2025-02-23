"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem("token");

    setTimeout(() => router.push("/"), 3000);
  }, []);

  return (
    <div className="h-screen flex flex-col justify-center items-center gap-3">
      <p className="text-3xl">Logged Out.</p>
      <p>Redirecting to Homepage.</p>
    </div>
  );
}
