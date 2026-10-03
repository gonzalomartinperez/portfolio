import { BadgeCheck } from "lucide-react";
import type { Locale } from "@/content/locales";
import styles from "./production-badge.module.css";
import { Badge } from "./ui/badge";

export function ProductionBadge({ locale }: { locale: Locale }) {
  return (
    <Badge variant="outline" className={styles.badge}>
      <BadgeCheck size={14} aria-hidden="true" />
      {locale === "es" ? "En producción" : "In production"}
    </Badge>
  );
}
