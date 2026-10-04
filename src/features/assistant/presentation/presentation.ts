import type { Locale } from "../domain/models";
export type NativePresentation = {
  preferences: { locale: Locale; theme: "dark" | "light" };
  visible: boolean;
  focus: number;
  onMenuChange?: (open: boolean) => void;
};
