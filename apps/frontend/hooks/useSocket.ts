import { WEBSOCKET_URL } from "@/app/config";
import { useEffect, useState } from "react";

export function useSocket(roomId: number) {
  const [loading, setLoading] = useState<boolean>(true);
  const [socket, setSocket] = useState<WebSocket>();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket = new WebSocket(`${WEBSOCKET_URL}?token=${token}`);

    socket.onopen = () => {
      setSocket(socket);
      setLoading(false);

      socket.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          roomId: Number(roomId),
        })
      );
    };

    return () => {
      socket.close();
    };
  }, []);

  return { loading, socket };
}
