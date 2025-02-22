"use client";

import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";
import { useSocket } from "@/hooks/useSocket";

export function CanvasPage({ roomId }: { roomId: number }) {
  const { loading, socket } = useSocket(roomId);
  const [token, setToken] = useState<string>();

  useEffect(() => {
    const token = localStorage.getItem("token");

    setToken(token || "");
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return <div>Please log in.</div>;
  }

  if (!socket) {
    return <div>Socket connection failed.</div>;
  }

  return <Canvas socket={socket} roomId={roomId} />;
}
