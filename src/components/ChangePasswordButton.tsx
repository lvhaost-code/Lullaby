"use client";

import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { Modal, Field, inputCls } from "@/components/ui";

export function ChangePasswordButton() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function reset() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess(false);
  }

  function close() {
    setOpen(false);
    reset();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới nhập lại không khớp.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Đổi mật khẩu thất bại, thử lại nhé.");
        return;
      }
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Đổi mật khẩu thất bại, thử lại nhé.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white">
        <KeyRound size={13} /> Đổi mật khẩu
      </button>
      {open && (
        <Modal title="Đổi mật khẩu" onClose={close}>
          <form onSubmit={submit}>
            <Field label="Mật khẩu hiện tại">
              <input
                type="password"
                className={inputCls}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoFocus
              />
            </Field>
            <Field label="Mật khẩu mới">
              <input type="password" className={inputCls} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </Field>
            <Field label="Nhập lại mật khẩu mới">
              <input type="password" className={inputCls} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </Field>

            {error && <p className="text-xs mb-3" style={{ color: "#B0453F" }}>{error}</p>}
            {success && <p className="text-xs mb-3" style={{ color: "#7C9473" }}>Đã đổi mật khẩu thành công.</p>}

            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={close} className="px-4 py-2 rounded-lg text-sm text-stone-500 hover:bg-stone-100">
                {success ? "Đóng" : "Hủy"}
              </button>
              {!success && (
                <button
                  type="submit"
                  disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40"
                  style={{ backgroundColor: "#B3536A" }}
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Lưu mật khẩu mới
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
