/**
 * Ordered walkthrough of the Filomena interface, from signing in to operating the platform.
 *
 * Ids are shared by both locales because they are filenames; only the alt text is translated.
 *
 * Four captures from the source gallery are deliberately absent. One showed a user table that
 * still held a real name, national ID, student file number and personal email left in the demo
 * database. Three showed a chest X-ray whose licence and provenance could not be established.
 */
export const filomenaGallery = [
  "001",
  "004",
  "015",
  "026",
  "029",
  "033",
  "017",
  "040",
  "057",
  "059",
  "066",
  "043",
  "045",
  "077",
  "051",
  "091",
] as const;

export type FilomenaShot = (typeof filomenaGallery)[number];

/** Intrinsic size of every optimised capture, so the carousel reserves its space. */
export const GALLERY_WIDTH = 1600;
export const GALLERY_HEIGHT = 720;
