"use client";

export function AuthPage({ page }: { page: "signup" | "signin" }) {
  return (
    <div className="flex flex-col justify-center items-center gap-3 h-screen">
      <input type="text" name="" id="" placeholder="Username" />
      <input type="text" name="" id="" placeholder="Password" />
      <button>{page === "signin" ? "Sign in" : "Sign up"}</button>
    </div>
  );
}
