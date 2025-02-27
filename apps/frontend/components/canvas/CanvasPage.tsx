"use client";

import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";
import { useSocket } from "@/hooks/useSocket";
import { Navbar } from "../Navbar";
import { Footer } from "../Footer";
import Link from "next/link";

export function CanvasPage({ roomId }: { roomId: number }) {
  const { loading, socket } = useSocket(roomId);
  const [token, setToken] = useState<string>();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setToken(token || "");
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-start p-2">
        <div className="w-52 h-10 bg-gray-300 rounded-md animate-pulse"></div>
        <div className="absolute w-52 h-10 bottom-5 left-5 bg-gray-300 rounded-md animate-pulse"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div>
        <Navbar />
        <div className="h-screen flex flex-col justify-center items-center">
          <p className="text-2xl">Please log in.</p>
          <p className="text-md">
            Go to{" "}
            <Link href={"/login"} className="text-blue-500 underline">
              Log In
            </Link>{" "}
            page.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!socket) {
    return <div>Socket connection failed.</div>;
  }

  return <Canvas socket={socket} roomId={roomId} />;
}
