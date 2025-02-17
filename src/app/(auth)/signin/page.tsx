"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc"; // Google icon
import { FaGithub } from "react-icons/fa"; // GitHub icon
import { MdEmail, MdLock } from "react-icons/md"; // Email & Lock icons
import { ImSpinner2 } from "react-icons/im"; // Loading spinner

export default function SignIn() {
  const { status } = useSession();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  const handleCredentialsLogin = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <ImSpinner2 className="w-10 h-10 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-700">
        <h2 className="text-center text-3xl font-extrabold text-white">
          Welcome Back
        </h2>
        <p className="text-gray-400 text-center text-sm mt-1">
          Sign in to continue
        </p>

        <form onSubmit={handleCredentialsLogin} className="space-y-5 mt-6">
          <div className="relative">
            <MdEmail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <Input
              type="email"
              name="email"
              placeholder="Email"
              required
              className="pl-12 py-3 bg-gray-800 border-none text-white placeholder-gray-400 rounded-2xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="relative">
            <MdLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="pl-12 py-3 bg-gray-800 border-none text-white placeholder-gray-400 rounded-2xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <Button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-90 transition font-semibold"
          >
            Sign In
          </Button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>

        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="px-4 text-gray-400 text-sm">or</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full flex items-center gap-3 py-3 rounded-2xl bg-gray-800 text-white hover:bg-gray-700"
            onClick={() => signIn("github")}
          >
            <FaGithub className="w-5 h-5" /> Sign in with GitHub
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center gap-3 py-3 rounded-2xl bg-gray-800 text-white hover:bg-gray-700"
            onClick={() => signIn("google")}
          >
            <FcGoogle className="w-5 h-5" /> Sign in with Google
          </Button>
        </div>

        <p className="text-sm text-center mt-4 text-gray-400">
          Not signed up?{" "}
          <a href="/signup" className="text-sky-500 hover:underline">
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
}
