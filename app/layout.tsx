"use client";

import "./globals.css"
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ReactNode } from "react";

export default function RootLayout({children,}: {children: ReactNode;}) {
  useEffect(() => {
    const{data: listener} = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(event);
        console.log(session);
      }
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);
  return(
    <html>
      <body>
        {children}
      </body>
    </html>
  )
}