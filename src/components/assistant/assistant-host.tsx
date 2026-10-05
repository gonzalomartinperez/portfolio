"use client";

import { Maximize2, Minimize2, Minus, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { holdPageMotion } from "@/components/motion-state";
import { Button } from "@/components/ui/button";
import styles from "./assistant-host.module.css";
import { AssistantLoading } from "./assistant-loading";

const Assistant = dynamic(() => import("@/features/assistant/entry"), {
  ssr: false,
  loading: AssistantLoading,
});

export function AssistantHost() {
  const routePathname = usePathname();
  // A localized missing route can hydrate from a differently routed server fallback.
  const [pathname, setPathname] = useState("");
  useEffect(() => setPathname(routePathname), [routePathname]);
  const locale = pathname === "/es" || pathname.startsWith("/es/") ? "es" : "en";
  const page = pathname === "/assistant" || pathname === "/es/assistant";
  const [opened, setOpened] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [focus, setFocus] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const lastPage = useRef(page);
  const wasVisible = useRef(false);
  const visible = opened || page;
  const modal = visible && (historyOpen || (!page && (expanded || mobile)));
  const es = locale === "es";

  useEffect(() => {
    if (wasVisible.current && !visible) launcher.current?.focus();
    wasVisible.current = visible;
  }, [visible]);
  useEffect(() => {
    if (page) {
      setLoaded(true);
      setFocus((value) => value + 1);
    } else if (lastPage.current) setOpened(false);
    lastPage.current = page;
  }, [page]);
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setTheme(root.dataset.theme === "light" ? "light" : "dark");
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 620px)");
    const viewport = window.visualViewport;
    const update = () => {
      setMobile(media.matches);
      host.current?.style.setProperty(
        "--assistant-viewport-height",
        `${viewport?.height ?? window.innerHeight}px`,
      );
      host.current?.style.setProperty("--assistant-viewport-top", `${viewport?.offsetTop ?? 0}px`);
    };
    update();
    media.addEventListener("change", update);
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    return () => {
      media.removeEventListener("change", update);
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
    };
  }, []);
  useEffect(() => {
    if (page || modal) return holdPageMotion();
  }, [page, modal]);
  useEffect(() => {
    if (!page) return;
    const footer = document.querySelector("body > footer");
    const previous = footer?.hasAttribute("inert");
    footer?.setAttribute("inert", "");
    return () => {
      if (!previous) footer?.removeAttribute("inert");
    };
  }, [page]);
  useEffect(() => {
    if (!modal) return;
    const siblings = Array.from(document.body.children).filter(
      (element) => !element.contains(host.current),
    );
    const previous = siblings.map((element) => element.hasAttribute("inert"));
    siblings.forEach((element) => {
      element.setAttribute("inert", "");
    });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      siblings.forEach((element, index) => {
        if (!previous[index]) element.removeAttribute("inert");
      });
      document.body.style.overflow = overflow;
    };
  }, [modal]);
  function open() {
    setLoaded(true);
    setOpened(true);
    setFocus((value) => value + 1);
  }
  function minimize() {
    setOpened(false);
    setExpanded(false);
  }
  function keys(event: KeyboardEvent<HTMLElement>) {
    if (event.defaultPrevented) return;
    if (event.key === "Escape" && !page) {
      event.preventDefault();
      minimize();
    }
    if (event.key !== "Tab" || !modal) return;
    const controls = Array.from(
      surface.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]',
      ) ?? [],
    ).filter((element) => element.getClientRects().length && !element.closest("[inert]"));
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
  return (
    <div ref={host} className={styles.host} data-assistant-host>
      {!page && (
        <Button
          ref={launcher}
          variant="default"
          className={styles.launcher}
          onClick={open}
          aria-expanded={visible}
          aria-controls="portfolio-assistant"
          hidden={visible}
        >
          <Sparkles aria-hidden="true" />
          {es ? "Preguntar a la IA" : "Ask AI"}
        </Button>
      )}
      {loaded && (
        <section
          ref={surface}
          id="portfolio-assistant"
          hidden={!visible}
          inert={!visible}
          className={`${styles.surface} ${expanded ? styles.expanded : ""} ${page ? styles.page : ""}`}
          {...(modal ? { role: "dialog", "aria-modal": true } : { role: "region" })}
          aria-label={es ? "Asistente de Gonzalo" : "Gonzalo’s assistant"}
          onKeyDown={keys}
        >
          <div className={styles.toolbar} inert={historyOpen}>
            <span>{es ? "Asistente de Gonzalo" : "Gonzalo’s assistant"}</span>
            {!page && (
              <div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={
                    expanded
                      ? es
                        ? "Restaurar panel"
                        : "Restore panel"
                      : es
                        ? "Ampliar panel"
                        : "Expand panel"
                  }
                  onClick={() => setExpanded((value) => !value)}
                >
                  {expanded ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={es ? "Minimizar asistente" : "Minimize assistant"}
                  onClick={minimize}
                >
                  <Minus aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>
          <div className={styles.chat}>
            <Assistant
              presentation={{
                preferences: { locale, theme },
                visible,
                focus,
                onMenuChange: setHistoryOpen,
              }}
            />
          </div>
        </section>
      )}
    </div>
  );
}
