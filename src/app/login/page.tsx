"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Sparkles, Loader2 } from "lucide-react";
import { COLORS } from "@/lib/constants";
import { inputCls, Field } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { username, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Sai tên đăng nhập hoặc mật khẩu.");
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: COLORS.cream }}>
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-6" style={{ boxShadow: "0 1px 3px rgba(63,36,54,0.06)" }}>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} style={{ color: COLORS.gold }} />
          <h1 style={{ fontFamily: "'Fraunces', serif", color: COLORS.plum }} className="text-2xl">
            Lullaby
          </h1>
        </div>
        <p className="text-sm mb-5" style={{ color: COLORS.rose }}>
          Đăng nhập quản lý nội bộ
        </p>

        <Field label="Tên đăng nhập">
          <input className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        </Field>
        <Field label="Mật khẩu">
          <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>

        {error && <p className="text-xs mb-3" style={{ color: "#B0453F" }}>{error}</p>}

        <button
          type="submit"
          disabled={loading || !username || !password}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
          style={{ backgroundColor: COLORS.rose }}
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
