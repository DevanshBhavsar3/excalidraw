import Image from "next/image";
import Link from "next/link";
import { IoIosArrowRoundForward } from "react-icons/io";

export function CTA() {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex flex-col justify-center items-start">
          <h1 className="text-3xl font-bold my-3">Ready to Draw?</h1>
          <h1 className="text-xl font-medium mb-10">
            Your creative journey starts here.
          </h1>
          <Link
            href={"/signup"}
            className="hover:bg-primary hover:text-white border border-primary px-4 py-2 rounded-full w-full flex justify-between items-center"
          >
            Sign Up Now <IoIosArrowRoundForward size={32} />
          </Link>
        </div>
        <div className="w-1/2">
          <Image
            src={"/image1.jpeg"}
            alt="abstaract_waves"
            width={600}
            height={600}
            className="rounded-md"
          />
        </div>
      </div>
    </section>
  );
}
