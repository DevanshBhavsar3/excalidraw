"use client";

import { HTTP_URL } from "@/config";
import axios, { AxiosError } from "axios";
import { redirect, useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FaPlay } from "react-icons/fa";

interface Room {
  id: number;
  slug: string;
  createdAt: Date;
  adminId: string;
}

export default function DashboardPage() {
  const [token, setToken] = useState<string>("");
  const router = useRouter();
  const joinRoomRef = useRef<string>("");
  const createRoomRef = useRef<string>("");
  const [loading, setLoading] = useState<boolean>(true);
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
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    }

    setToken(token);
    getRoom();
  }, []);

  async function createRoom() {
    setLoading(true);

    try {
      await axios.post(
        `${HTTP_URL}/create`,
        {
          name: createRoomRef.current,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      router.push(`/room/${createRoomRef.current}`);
    } catch (e) {
      if (e instanceof AxiosError) {
        setError(e.response?.data.error);
      } else {
        setError("Something went wrong.");
      }

      setLoading(false);
      setTimeout(() => setError(""), 3000);
    }
  }

  return (
    <div>
      {loading && (
        <div className="z-30 fixed w-screen h-screen bg-black/50 flex justify-center items-center">
          <div className="w-6 h-6 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
        </div>
      )}

      <Navbar />
      <div className="max-w-7xl w-full mx-auto my-5">
        <p className="text-2xl font-semibold mb-3">Join Room</p>
        <form className="w-full flex justify-center items-center mb-5">
          <input
            type="text"
            className="rounded-l-md px-4 py-2 flex-1 border"
            placeholder="Room name"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              (joinRoomRef.current = e.target.value)
            }
          />
          <button
            onClick={() => {
              setLoading(true);
              router.push(`/room/${joinRoomRef.current}`);
            }}
            disabled={loading}
            className="bg-primary text-white px-4 py-2 rounded-r-md w-[10%] disabled:bg-primary/40 transition-all"
          >
            Join
          </button>
        </form>

        <p className="text-2xl font-semibold mb-3">
          Your Rooms ({rooms.length})
        </p>
        <div className="rounded-md">
          <ul className="flex flex-col w-full justify-start items-center border rounded-md overflow-y-auto h-[calc(100vh-15rem)] relative">
            <li className="sticky top-0 left-0 flex w-full text-md font-medium border-b bg-gray-100">
              <div className="w-[20%] px-4 py-2">Id</div>
              <div className="border-x w-[40%] px-4 py-2">Name</div>
              <div className="border-r w-[30%] px-4 py-2">Created At</div>
              <div className="w-[10%] px-4 py-2 text-center">Join</div>
            </li>
            {rooms.map((room) => (
              <li key={room.id} className="flex w-full border-b-2">
                <div className="w-[20%] px-4 py-2">{room.id}</div>
                <div className="border-x-2 w-[40%] px-4 py-2">{room.slug}</div>
                <div className="border-r w-[30%] px-4 py-2">
                  {new Date(room.createdAt).toLocaleString()}
                </div>
                <button
                  onClick={() => {
                    setLoading(true);
                    redirect(`/room/${room.slug}`);
                  }}
                  className="w-[10%] px-4 py-2 flex justify-center items-center hover:text-primary text-black/50 transition-all"
                >
                  <FaPlay size={18} />
                </button>
              </li>
            ))}

            <li className="flex-1 flex justify-center items-center text-gray-300">
              {rooms.length === 0 && <div>No rooms!</div>}
            </li>

            <form className="sticky bg-white left-0 bottom-0 w-full flex justify-center border-t items-start">
              <input
                type="text"
                className="rounded-bl-md px-4 py-2 flex-1"
                placeholder="Room name"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  (createRoomRef.current = e.target.value)
                }
              />
              <button
                onClick={createRoom}
                disabled={loading}
                className="bg-primary text-white px-4 py-2 rounded-br-md w-[10%] disabled:bg-primary/40 transition-all"
              >
                Create
              </button>
            </form>
          </ul>
          {error && <span className="text-red-500">{error}</span>}
        </div>
      </div>
      <Footer />
    </div>
  );
}
