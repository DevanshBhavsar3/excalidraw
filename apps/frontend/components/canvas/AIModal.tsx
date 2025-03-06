"use client";

import { Game } from "@/draw/Game";
import axios from "axios";
import { FormEvent, useRef, useState } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";

export function AIModal({
  canvas,
  closeModal,
}: {
  canvas: Game;
  closeModal: () => void;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const promptRef = useRef<string>("");

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    const prompt = promptRef.current;
    if (!prompt) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_HTTP_URL}/generate`,
        { prompt },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );

      const shapes = JSON.parse(response.data);

      canvas.addShapes(shapes);
      closeModal();
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  }

  return (
    <div className="z-10 fixed inset-0 flex justify-center items-center bg-black/50">
      <div className="bg-white p-5 rounded-md flex flex-col justify-center items-center gap-3">
        <div className="flex justify-between items-center w-full">
          <p className="text-lg md:text-xl font-medium">Generate Shapes</p>
          <div
            className="cursor-pointer hover:bg-gray-300 rounded-full transition-all"
            onClick={closeModal}
          >
            <IoIosCloseCircleOutline size={18} className="m-1" />
          </div>
        </div>
        <form
          className="rounded-md flex flex-col justify-center items-start"
          onSubmit={handleGenerate}
        >
          <label htmlFor="prompt" className="py-1">
            Prompt
          </label>

          <textarea
            id="prompt"
            className="p-2 rounded-md border border-primary w-96 h-96 bg-primary/10 resize-none"
            placeholder="Describe what you want to draw..."
            onChange={(e) => (promptRef.current = e.target.value)}
            disabled={loading}
          ></textarea>

          <button
            type="submit"
            className="bg-primary hover:bg-primary-dark text-white w-full text-center py-1 rounded-md mt-3 disabled:bg-primary/60 flex justify-center items-center gap-2"
            disabled={loading}
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/10 border-t-white rounded-full animate-spin" />
            )}
            Generate
          </button>
        </form>
      </div>
    </div>
  );
}
