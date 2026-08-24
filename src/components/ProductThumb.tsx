"use client";

import { Image as ImageIcon } from "lucide-react";
import { COLORS } from "@/lib/constants";

export function ProductThumb({
  photoUrl,
  size = 40,
  rounded = 8,
  fill = false,
}: {
  photoUrl: string | null;
  size?: number;
  rounded?: number;
  fill?: boolean;
}) {
  const dimension = fill ? "100%" : size;
  const style = { width: dimension, height: dimension, borderRadius: rounded, objectFit: "cover" as const, flexShrink: 0 };
  const iconSize = Math.round((fill ? 32 : size) * 0.42);
  if (!photoUrl) {
    return (
      <div
        style={{ ...style, backgroundColor: COLORS.roseSoft, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <ImageIcon size={iconSize} color={COLORS.rose} style={{ opacity: 0.5 }} />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={photoUrl} style={style} alt="" />;
}
