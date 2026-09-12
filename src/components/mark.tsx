import Image from "next/image";

export function Mark({ size = 28, title }: { size?: number; title?: string }) {
  const resolution = size <= 16 ? 16 : size <= 32 ? 32 : 48;
  return (
    <Image
      src={`/avatar/face-${resolution}.svg`}
      width={size}
      height={size}
      alt={title ?? ""}
      unoptimized
      style={{ imageRendering: "pixelated" }}
    />
  );
}
