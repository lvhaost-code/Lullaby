import { Sparkles, LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";
import { COLORS } from "@/lib/constants";
import { DashboardApp } from "@/components/DashboardApp";
import { ChangePasswordButton } from "@/components/ChangePasswordButton";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-col min-h-full">
      <div className="sticky top-0 z-40 h-14 flex items-center" style={{ backgroundColor: COLORS.plum }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} style={{ color: COLORS.gold }} />
            <span style={{ fontFamily: "'Fraunces', serif", color: "white" }} className="text-lg">
              Lullaby <span className="text-xs font-normal align-middle opacity-70">· quản lý nội bộ</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            {session?.user?.name && <span className="text-xs text-white/70">{session.user.name}</span>}
            <ChangePasswordButton />
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button type="submit" className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white">
                <LogOut size={13} /> Đăng xuất
              </button>
            </form>
          </div>
        </div>
      </div>
      <DashboardApp />
    </div>
  );
}
