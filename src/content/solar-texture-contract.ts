/**
 * Content version (a SHA-256 prefix) of every published width of each map. The largest width is the reviewed original
 * (`<name>.webp`); smaller ones are downscaled delivery variants (`<name>-<width>.webp`).
 */
export type SolarTextureVersions = Readonly<Record<string, Readonly<Record<number, string>>>>;
