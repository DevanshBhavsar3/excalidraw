import { WS_CLIENT_URL } from "@/config";
import { useEffect, useState } from "react";

export function useSocket(roomId: number) {
  const [loading, setLoading] = useState<boolean>(true);
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    const socket = new WebSocket(`${WS_CLIENT_URL}?token=${token}`);

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
      if (socket.readyState === socket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "LEAVE_ROOM",
            roomId,
          })
        );
        socket.close();
      }
    };
  }, []);

  return { loading, socket };
}
