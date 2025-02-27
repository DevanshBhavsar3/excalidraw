import Icon from "@/public/icon";
import Link from "next/link";
import { IoIosArrowRoundForward } from "react-icons/io";

export function Hero() {
  return (
    <section className="z-10 flex flex-col items-center text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/bg-mobile.png')] md:bg-[url('/bg.png')] scale-150 bg-no-repeat bg-cover md:bg-contain bg-center"></div>
      <div className="z-10 py-44 flex flex-col items-center text-center">
        <div className="flex justify-center items-center gap-1">
          <Icon size="sm" />
          <h1 className="font-semibold text-md md:text-xl">Drawify</h1>
        </div>
        <h1 className="text-2xl md:text-5xl font-bold letter tracking-tight max-w-lg py-6">
          Where Ideas Take <br /> <span className="text-primary">Shape </span>
          Together
        </h1>
        <hr className="w-full max-w-md mb-3" />
        <Link
          href={"/signup"}
          className="border-2 border-primary text-black hover:bg-primary-dark hover:text-white px-4 py-1 rounded-full text-xs md:text-sm transition-all flex justify-center items-center gap-1"
        >
          Sign Up
          <IoIosArrowRoundForward size={18} />
        </Link>
      </div>
    </section>
  );
}
