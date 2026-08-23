"use client";

import { Image as ImageIcon } from "lucide-react";
import { COLORS } from "@/lib/constants";

export function ProductThumb({
  photoUrl,
  size = 40,
  rounded = 8,
}: {
  photoUrl: string | null;
  size?: number;
  rounded?: number;
}) {
  const style = { width: size, height: size, borderRadius: rounded, objectFit: "cover" as const, flexShrink: 0 };
  if (!photoUrl) {
    return (
      <div
        style={{ ...style, backgroundColor: COLORS.roseSoft, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <ImageIcon size={Math.round(size * 0.42)} color={COLORS.rose} style={{ opacity: 0.5 }} />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={photoUrl} style={style} alt="" />;
}
