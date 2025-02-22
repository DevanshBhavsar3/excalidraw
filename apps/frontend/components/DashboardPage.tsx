"use client";

import { HTTP_URL } from "@/config";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import axios, { AxiosError } from "axios";
import { redirect, useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";

interface Room {
  id: number;
  slug: string;
  createdAt: Date;
  adminId: string;
}

export default function DashboardPage() {
  const [token, setToken] = useState<string>("");
  const router = useRouter();
  const inputRef = useRef<string>("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      redirect("/");
    }

    async function getRoom() {
      try {
        const response = await axios.get(`${HTTP_URL}/user/rooms`, {
          headers: {
            Authorization: token,
          },
        });

        setRooms(response.data);
      } catch (e) {
        console.log(e);
      }
    }

    setToken(token);
    getRoom();
  }, []);

  async function createRoom() {
    try {
      const response = await axios.post(
        `${HTTP_URL}/create`,
        {
          name: inputRef.current,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      router.push(`/room/${inputRef.current}`);
    } catch (e) {
      if (e instanceof AxiosError) {
        setError(e.response?.data.error);
      }
    }
  }

  return (
    <div>
      <Input
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          (inputRef.current = e.target.value)
        }
      />
      <Button onClick={createRoom}>Create</Button>
      {rooms.map((room) => (
        <div key={room.id}>
          <div>{JSON.stringify(room)}</div>
          <Button onClick={() => redirect(`/room/${room.slug}`)}>Join</Button>
        </div>
      ))}
      {error && <span>{error}</span>}
    </div>
  );
}
