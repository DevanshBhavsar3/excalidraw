"use client";

import Icon from "@/public/icon";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { HTTP_URL } from "@/config";
import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function AuthPage({ page }: { page: "signup" | "login" }) {
  const router = useRouter();
  const usernameRef = useRef<string>("");
  const passwordRef = useRef<string>("");
  const [error, setError] = useState<string>("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      const response = await axios.post(`${HTTP_URL}/${page}`, {
        username: usernameRef.current,
        password: passwordRef.current,
      });

      localStorage.setItem("token", response.data.token);

      router.push("/dashboard");
    } catch (e) {
      if (e instanceof AxiosError) {
        setError(e.response?.data.error);
      } else {
        setError("Something went wrong.");
      }
    }
  }

  return (
    <section>
      <Navbar />
      <form
        className="h-screen flex flex-col justify-center items-start gap-3 w-1/4 mx-auto"
        onSubmit={handleSubmit}
      >
        <p className="text-xl font-semibold flex justify-center items-center gap-3">
          <Icon size="md" />
          {page === "signup" ? "Sign Up" : "Log In"}
        </p>
        <div className="flex flex-col justify-center items-start w-full">
          <label htmlFor="">Username</label>
          <input
            type="text"
            name=""
            id=""
            placeholder="Username"
            className="px-4 py-2 border bg-gray-100 rounded-md w-full"
            onChange={(e) => (usernameRef.current = e.target.value)}
          />
        </div>
        <div className="flex flex-col justify-center items-start w-full">
          <label htmlFor="">Password</label>
          <input
            type="text"
            name=""
            id=""
            placeholder="Password"
            className="px-4 py-2 border bg-gray-100 rounded-md w-full"
            onChange={(e) => (passwordRef.current = e.target.value)}
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {page === "login" ? (
          <p className="text-sm">
            {"Don't have an account? "}
            <Link href={"/signup"} className="underline">
              Create Account
            </Link>
          </p>
        ) : (
          <p className="text-sm">
            Already have an account?{" "}
            <Link href={"/login"} className="underline">
              Log In
            </Link>
          </p>
        )}
        <button
          className="hover:bg-primary border border-primary hover:text-white px-4 py-2 rounded-full w-full"
          type="submit"
        >
          {page === "login" ? "Log in" : "Sign up"}
        </button>
      </form>
      <Footer />
    </section>
  );
}
