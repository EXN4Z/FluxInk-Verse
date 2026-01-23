"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function regist() {
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");


    const Submit = async(e) => {
        e.preventDefault();

        if(!email || !password) {
            alert("email dan password harus diisi!");
        }
        const {data, error} = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if(error) {
            alert(error.message)
        }  else {
            alert("User Berhasil dimasukkan")
        }
    }
    return(
        <form onSubmit={Submit} className="flex flex-col gap-2 w-64">
            <label>Email</label>
            <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border p-2 rounded"
            />

            <label>Password</label>
            <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border p-2 rounded"
            />

            <button type="submit" className="bg-purple-600 text-white p-2 rounded">
            Register
            </button>
      </form>
    )
}