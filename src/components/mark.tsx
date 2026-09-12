import Image from "next/image";

export function Mark({ size = 28, title }: { size?: number; title?: string }) {
  const resolution = [16, 32, 48, 96, 192].find((candidate) => candidate >= size * 2) ?? 192;
  return (
    <Image
      src={`/avatar/face-${resolution}.png`}
      width={size}
      height={size}
      alt={title ?? ""}
      unoptimized
    />
  );
}
