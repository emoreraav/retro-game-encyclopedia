"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export default function AuthWidget() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabaseBrowser.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const { error } = await supabaseBrowser.auth.signInWithOtp({ email });
    if (!error) setStatus("sent");
    else {
      alert("No se pudo enviar el link: " + error.message);
      setStatus("idle");
    }
  }

  async function logout() {
    await supabaseBrowser.auth.signOut();
  }

  if (session) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-slate-400 hidden sm:inline">{session.user.email}</span>
        <button onClick={logout} className="text-phosphor hover:underline">
          Cerrar sesión
        </button>
      </div>
    );
  }

  if (showForm) {
    return status === "sent" ? (
      <p className="text-sm text-phosphor">Revisa tu email para el link de acceso ✉️</p>
    ) : (
      <form onSubmit={sendMagicLink} className="flex items-center gap-2">
        <input
          type="email"
          required
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-3 py-1.5 rounded-md bg-carbon-800 border border-carbon-600 text-sm text-white outline-none focus:border-phosphor"
        />
        <button type="submit" disabled={status === "sending"} className="btn-primary py-1.5 text-sm">
          {status === "sending" ? "Enviando…" : "Enviar link"}
        </button>
      </form>
    );
  }

  return (
    <button onClick={() => setShowForm(true)} className="text-sm text-slate-300 hover:text-phosphor">
      Iniciar sesión
    </button>
  );
}
