"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem("token");

    setTimeout(() => router.push("/"), 3000);
  }, [router]);

  return (
    <div className="h-screen flex flex-col justify-center items-center gap-3">
      <p className="text-2xl">Logged Out.</p>
      <p className="text-md">Redirecting to Homepage.</p>
    </div>
  );
}
