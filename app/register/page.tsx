"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function Register() {
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    const[nama, setNama] = useState("");
    const[showWarn, setShowWarn] = useState<{message: string; type: 'error' | 'success';} | null>(null)


    const Submit = async(e: React.FormEvent<HTMLFormElement>)  => {
        e.preventDefault();

        if(!email || !password) {
            setShowWarn({message: "Semua Field wajib diisi!", type: 'error'})
            return;
        }
        const {data, error} = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {display_name: nama,
                },
            },
        });

        if(error) {
            setShowWarn({message: error.message, type: 'error'});
        }  else {
            setShowWarn({message: "data berhasil ditambahkan!", type: 'success'})
        }
        setNama("");
        setEmail("");
        setPassword("");
    }
    return(
        <form onSubmit={Submit} className="flex flex-col gap-2 w-64">
            <label>Username</label>
            <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="border p-2 rounded"
            />
            <label>Email</label>
            <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}

            className="border p-2 rounded"
            />

            <label>Password</label>
            <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}

            className="border p-2 rounded"
            />
            {showWarn && (
                <div className={`text-md ${
                    showWarn.type === "error" ? 'text-red-600' : 'text-green-600'
                }`}>
                    {showWarn.message}
                </div>
            )}

            <button type="submit" className="bg-purple-600 text-white p-2 rounded">
            Register
            </button>
      </form>
    )
}