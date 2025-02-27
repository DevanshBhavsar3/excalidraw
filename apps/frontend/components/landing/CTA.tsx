import Image from "next/image";
import Link from "next/link";
import { IoIosArrowRoundForward } from "react-icons/io";

export function CTA() {
  return (
    <section className="py-10 px-2">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex flex-col justify-center items-start">
          <h1 className="text-xl md:text-3xl font-bold my-3">Ready to Draw?</h1>
          <h1 className="text-md md:text-xl font-medium mb-10">
            Your creative journey starts here.
          </h1>
          <Link
            href={"/signup"}
            className="hover:bg-primary hover:text-white border border-primary px-4 py-1 md:py-2 rounded-full w-full flex justify-between items-center text-sm md:text-base"
          >
            Sign Up Now <IoIosArrowRoundForward size={32} />
          </Link>
        </div>
        <Image
          src={"/image1.jpeg"}
          height={600}
          width={600}
          alt="abstaract_waves"
          className="rounded-md hidden md:block"
        />
      </div>
    </section>
  );
}
