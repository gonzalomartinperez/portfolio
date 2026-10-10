import type { Locale } from "../domain/models";
import type { VisitorContext } from "../domain/visitor-context";
export type NativePresentation = {
  preferences: { locale: Locale; theme: "dark" | "light" };
  context?: VisitorContext | undefined;
  visible: boolean;
  focus: number;
  onMenuChange?: (open: boolean) => void;
};
