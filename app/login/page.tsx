"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function Login() {
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    const router = useRouter();
    const [showError, setError] = useState<{message: string; type: "error" | "success"} | null> (null)

    const loginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if(!email || !password) {
            setError({message: "data harus diisi!", type: "error"});
            return;
        } else if (!email.includes("@")) {
            setError({message: "Email tidak valid", type: "error"});
            return;
        }

        const {data, error} = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        if(error) {
            setError({message: error.message, type: "error"})
            return;
        } 

        if(data.session) {
            setTimeout(() => {
                router.replace("/");
            }, 100);
        }
    }
    return(
         <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={loginSubmit} className="space-y-4 w-80">
        <h1 className="text-2xl font-bold">Login</h1>


        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2"
          onChange={(e) => setPassword(e.target.value)}
        />
        {showError && (
          <p className={`text-red-500 ${ showError.type === "error" ? 'text-red-600' : 'text-green-600'}`}>{showError.message}</p>
        )}

        <button className="w-full bg-black text-white py-2">
          Login
        </button>
      </form>
    </div>
    )
}