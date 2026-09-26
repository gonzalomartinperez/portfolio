"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import styles from "./assistant-panel.module.css";

const AssistantPanel = dynamic(() => import("./assistant-panel"));
export function AssistantLauncher({ locale }: { locale: "en" | "es" }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={styles.launcher}>
          {locale === "es" ? "Preguntar" : "Ask AI"}
        </button>
      </DialogTrigger>
      {open && <AssistantPanel locale={locale} />}
    </Dialog>
  );
}
