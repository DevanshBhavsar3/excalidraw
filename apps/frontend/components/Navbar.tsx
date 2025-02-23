import Icon from "@/public/icon";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="z-20 sticky top-0 left-0 bg-white border border-b-black/10 w-full py-2">
      <div className="max-w-7xl mx-auto flex w-full justify-between items-center">
        <div className="flex justify-center items-center gap-1">
          <Icon size="sm" />
          <Link href={"/"} className="font-medium text-md">
            Drawify
          </Link>
        </div>
        <div className="flex justify-center items-center text-sm font-medium gap-3 text-black/70 hover:text-black">
          <Link href={"/login"} className="hover:underline">
            Log In
          </Link>
          <Link
            href={"/signup"}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-1 rounded-full"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
