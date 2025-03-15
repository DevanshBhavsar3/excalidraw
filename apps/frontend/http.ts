import { HTTP_URL } from "@/config";
import { Chat } from "@/types";
import axios, { AxiosError } from "axios";

export async function getShapes(roomId: number) {
  try {
    const response = await axios.get(`${HTTP_URL}/chats/${roomId}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    const parsedData: Chat[] = response.data.chats.map(
      (chat: {
        id: number;
        roomId: number;
        message: string;
        userId: string;
      }) => {
        const parsedMessage = JSON.parse(chat.message);

        return {
          ...chat,
          message: parsedMessage,
        };
      }
    );

    return parsedData;
  } catch (e) {
    if (e instanceof AxiosError) {
      throw new Error(e.response?.data.error);
    } else {
      throw new Error("Something went wrong.");
    }
  }
}
