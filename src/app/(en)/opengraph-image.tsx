import { ImageResponse } from "next/og";
import {
  buildConstellation,
  POINT_COUNT_STATIC,
  projectConstellation,
} from "@/components/hero/constellation";
import { getContent } from "@/content";

const { profile } = getContent("en");

export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Satori supports flexbox and a CSS subset only, so the constellation is drawn as absolutely
 * positioned dots rather than as SVG or canvas. Same geometry as the hero.
 */
export default function OpengraphImage() {
  const points = projectConstellation(buildConstellation(POINT_COUNT_STATIC), 0.6);
  const cloudSize = 460;
  const cloudLeft = 760;
  const cloudTop = 85;

  return new ImageResponse(
    <div
      style={{
        background: "#05070a",
        color: "#e8edf4",
        display: "flex",
        height: "100%",
        position: "relative",
        width: "100%",
      }}
    >
      {points.map((point, index) => {
        const diameter = 2 + point.depth * 6 + point.seed * 2;
        return (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: positions are generated deterministically and never reordered.
            key={index}
            style={{
              background: `rgb(${Math.round(0x78 + (0x4c - 0x78) * point.depth)}, ${Math.round(
                0x84 + (0xd6 - 0x84) * point.depth,
              )}, ${Math.round(0x9a + (0xff - 0x9a) * point.depth)})`,
              borderRadius: diameter,
              height: diameter,
              left: cloudLeft + (point.x / 1.1) * (cloudSize / 2) + cloudSize / 2 - diameter / 2,
              opacity: 0.25 + point.depth * 0.7,
              position: "absolute",
              top: cloudTop + (-point.y / 1.1) * (cloudSize / 2) + cloudSize / 2 - diameter / 2,
              width: diameter,
            }}
          />
        );
      })}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 22,
          justifyContent: "center",
          padding: "0 72px",
          width: 760,
        }}
      >
        <div style={{ color: "#78849a", fontSize: 22, letterSpacing: 2 }}>
          {profile.role.toUpperCase()}
        </div>
        <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>
          {profile.name}
        </div>
        <div style={{ color: "#9aa6b8", fontSize: 30, lineHeight: 1.3 }}>{profile.headline}</div>
        <div style={{ background: "#4cd6ff", height: 4, marginTop: 10, width: 96 }} />
        <div style={{ color: "#78849a", fontSize: 20 }}>gonzalomartinperez.com</div>
      </div>
    </div>,
    { ...size },
  );
}
