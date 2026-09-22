import { readFile } from "node:fs/promises";
import { ImageResponse } from "next/og";
import { site } from "./site";

export const ogSize = { width: 1200, height: 630 };

const font = (weight: number) =>
  readFile(
    new URL(
      `../../node_modules/@fontsource/manrope/files/manrope-latin-${weight}-normal.woff`,
      import.meta.url,
    ),
  );

// One renderer for every social card on the site
export async function renderOg({
  title,
  description,
  eyebrow = site.name,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
}) {
  const [medium, semibold] = await Promise.all([font(500), font(600)]);
  const line = {
    position: "absolute" as const,
    top: 0,
    bottom: 0,
    width: 1,
    background: "rgba(255,255,255,0.08)",
  };
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#111010",
        color: "#f5f5f4",
        fontFamily: "Manrope",
        position: "relative",
      }}
    >
      <div style={{ ...line, left: 72 }} />
      <div style={{ ...line, right: 72 }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontSize: 22,
          color: "#a8a29e",
          paddingLeft: 32,
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: 999, background: "#f5f5f4" }} />
        {eyebrow.toUpperCase()}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingLeft: 32 }}>
        <div
          style={{
            fontSize: title.length > 32 ? 64 : 80,
            fontWeight: 600,
            letterSpacing: "-0.045em",
            lineHeight: 1.02,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        {description && (
          <div style={{ fontSize: 28, color: "#a8a29e", lineHeight: 1.4, maxWidth: 900 }}>{description}</div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingLeft: 32,
          fontSize: 22,
          color: "#a8a29e",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="30" height="30" viewBox="0 0 40 40" fill="none" stroke="#f5f5f4" strokeWidth="1.6">
            <circle cx="20" cy="20" r="16" />
            <path d="M8.7 31.3V8.7h22.6v22.6H8.7ZM20 4v32M4 20h32" />
          </svg>
          <span style={{ color: "#f5f5f4", fontWeight: 600 }}>earthling</span>
          <span>tools</span>
        </div>
        <div>{site.url.replace("https://", "")}</div>
      </div>
    </div>,
    {
      ...ogSize,
      fonts: [
        { name: "Manrope", data: medium, weight: 500 },
        { name: "Manrope", data: semibold, weight: 600 },
      ],
    },
  );
}
