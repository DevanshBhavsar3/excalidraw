import { BACKEND_URL } from "@/app/config";
import { Chat } from "@/types";
import axios from "axios";

export async function getShapes(roomId: number) {
  const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`, {
    headers: {
      Authorization: localStorage.getItem("token"),
    },
  });

  const parsedData: Chat[] = response.data.chats.map(
    (chat: { id: number; roomId: number; message: string; userId: string }) => {
      const parsedMessage = JSON.parse(chat.message);

      return {
        ...chat,
        message: parsedMessage,
      };
    }
  );

  return parsedData;
}
