/**
 * Ordered walkthrough of the Filomena interface, from signing in to operating the platform.
 *
 * Ids are shared by both locales because they are filenames; only the alt text is translated.
 *
 * Personal-data and medical-image captures remain withheld pending a public-safe derivative.
 */
export const filomenaGallery = [
  "001",
  "004",
  "005",
  "006",
  "007",
  "011",
  "012",
  "015",
  "017",
  "019",
  "023",
  "026",
  "028",
  "029",
  "032",
  "033",
  "034",
  "038",
  "040",
  "052",
  "053",
  "057",
  "058",
  "059",
  "060",
  "063",
  "066",
  "068",
  "043",
  "044",
  "045",
  "049",
  "051",
  "070",
  "074",
  "075",
  "076",
  "077",
  "078",
  "079",
  "086",
  "090",
  "091",
] as const;

export type FilomenaShot = (typeof filomenaGallery)[number];
