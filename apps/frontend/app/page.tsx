import { Navbar } from "@/components/Navbar";
import Icon from "@/public/icon";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col relative">
      <Navbar />
      <div className="absolute top-0 left-0 h-full w-full bg-black/10 bg-[url('/bg.png')] bg-no-repeat bg-contain"></div>
      <div className="z-10 py-44 flex flex-col items-center text-center">
        <div className="flex justify-center items-center gap-1">
          <Icon size="md" />
          <h1 className="font-semibold text-xl">Drawify</h1>
        </div>
        <h1 className="text-5xl font-bold letter tracking-tight max-w-lg py-6">
          Where Ideas Take <span className="text-primary">Shape </span>
          Together
        </h1>
        <hr className="w-full max-w-md mb-3" />
        <Link
          href={"/signup"}
          className="border-2 border-primary text-black hover:bg-primary-dark hover:text-white px-4 py-1 rounded-full text-sm transition-all"
        >
          Sign Up
        </Link>
      </div>
      <div className="z-10 h-screen bg-red-500">Hi</div>
    </main>
  );
}
