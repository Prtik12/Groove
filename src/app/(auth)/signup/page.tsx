"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MdEmail, MdLock } from "react-icons/md"; // Email & Lock icons
import { ImSpinner2 } from "react-icons/im"; // Loading spinner

export default function SignUp() {
  const { status } = useSession();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign up");
      }

      router.push("/signin");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <ImSpinner2 className="w-10 h-10 animate-spin text-sky-500" />
      </div>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-700">
        <h2 className="text-center text-3xl font-extrabold text-white">
          Join Us
        </h2>
        <p className="text-gray-400 text-center text-sm mt-1">
          Create your account
        </p>

        <form onSubmit={handleSignUp} className="space-y-5 mt-6">
          <div className="relative">
            <MdEmail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="pl-12 py-3 bg-gray-800 border-none text-white placeholder-gray-400 rounded-2xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="relative">
            <MdLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <Input
              type="password"
              name="password"
              placeholder="Choose a password"
              required
              className="pl-12 py-3 bg-gray-800 border-none text-white placeholder-gray-400 rounded-2xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <Button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-90 transition font-semibold"
            disabled={loading}
          >
            {loading ? (
              <ImSpinner2 className="w-5 h-5 animate-spin" />
            ) : (
              "Sign Up"
            )}
          </Button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>

        <p className="text-sm text-center mt-4 text-gray-400">
          Already have an account?{" "}
          <a href="/signin" className="text-sky-500 hover:underline">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}
