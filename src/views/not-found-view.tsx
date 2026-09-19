import Link from "next/link";
import { Mark } from "@/components/mark";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cardVariants } from "@/components/ui/card";
import { getContent } from "@/content";
import { chrome } from "@/content/chrome";
import { type Locale, localePath } from "@/content/locales";
import { cn } from "@/lib/utils";
import styles from "./not-found.module.css";

export function NotFoundView({ locale }: { locale: Locale }) {
  const { siteCopy: copy } = getContent(locale);
  const spanish = locale === "es";
  const destinations = [
    {
      path: "/work",
      title: chrome[locale].nav.work,
      description: spanish
        ? "Experiencia, proyectos y contribuciones técnicas."
        : "Experience, projects and technical contributions.",
    },
    {
      path: "/cv",
      title: "CV",
      description: spanish
        ? "Perfil completo y documentos para descargar."
        : "Professional profile and downloadable documents.",
    },
    {
      path: "/contact",
      title: chrome[locale].nav.contact,
      description: spanish
        ? "Hablemos de tu equipo y sus próximos desafíos."
        : "Let’s talk about your team and its next challenges.",
    },
  ];
  return (
    <section className={cn("section frame", styles.page)} lang={locale}>
      <div className={styles.intro}>
        <div className={styles.art} aria-hidden="true">
          <span>4</span>
          <span className={styles.orbit}>
            <Mark size={80} />
          </span>
          <span>4</span>
        </div>
        <div className={styles.message}>
          <Badge variant="outline">{copy.notFound.eyebrow}</Badge>
          <h1>{copy.notFound.title}</h1>
          <p>{copy.notFound.body}</p>
          <Link className={buttonVariants()} href={localePath(locale, "/")}>
            {copy.actions.goHome}
            <span aria-hidden="true">→</span>
          </Link>
          <div className={styles.languageRecovery} lang="es">
            <p>Esta página no existe. Puedes seguir explorando el portfolio en español.</p>
            <Link className={buttonVariants({ variant: "outline" })} href="/es">
              Ir al inicio en español
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
      <nav
        className={styles.destinations}
        aria-label={spanish ? "Continuar explorando" : "Keep exploring"}
      >
        {destinations.map((destination) => (
          <Link
            data-slot="card"
            className={cn(cardVariants(), styles.destination)}
            href={localePath(locale, destination.path)}
            key={destination.path}
          >
            <h2>
              {destination.title}
              <span aria-hidden="true">→</span>
            </h2>
            <p>{destination.description}</p>
          </Link>
        ))}
      </nav>
    </section>
  );
}
