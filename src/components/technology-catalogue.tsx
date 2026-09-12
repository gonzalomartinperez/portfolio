"use client";
import Link from "next/link";
import { useState } from "react";
import type { Technology } from "@/content/technologies";
import { BrandMark } from "./brand-mark";
import styles from "./technology-catalogue.module.css";
export type CatalogueGroup = {
  id: string;
  name: string;
  evidence: string;
  technologies: Technology[];
};
type CatalogueCopy = {
  search: string;
  category: string;
  all: string;
  clear: string;
  empty: string;
  developing: string;
  results: string;
};
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
export function TechnologyCatalogue({
  groups,
  copy,
}: {
  groups: CatalogueGroup[];
  copy: CatalogueCopy;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const normalizedQuery = normalize(query.trim());
  const visibleGroups = groups
    .filter((group) => !category || category === group.id)
    .map((group) => ({
      ...group,
      technologies: group.technologies.filter((technology) =>
        normalize(
          [
            technology.name,
            technology.id,
            ...(technology.aliases ?? []),
            group.name,
            ...technology.evidence.map((item) => item.label),
          ].join(" "),
        ).includes(normalizedQuery),
      ),
    }))
    .filter((group) => group.technologies.length > 0);
  const count = visibleGroups.reduce((total, group) => total + group.technologies.length, 0);
  function clearFilters() {
    setQuery("");
    setCategory("");
  }
  return (
    <div className={styles.catalogue}>
      <div className={styles.controls}>
        <label>
          {copy.search}
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-controls="technology-results"
          />
        </label>
        <label>
          {copy.category}
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-controls="technology-results"
          >
            <option value="">{copy.all}</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="button button-secondary"
          onClick={clearFilters}
          disabled={!query && !category}
        >
          {copy.clear}
        </button>
      </div>
      <p className={styles.count} role="status" aria-live="polite">
        {count} {copy.results}
      </p>
      <div id="technology-results" className={styles.groups}>
        {visibleGroups.map((group) => (
          <section
            key={group.id}
            id={group.id}
            className={styles.group}
            aria-labelledby={`${group.id}-heading`}
          >
            <div className={styles.heading}>
              <h2 id={`${group.id}-heading`}>{group.name}</h2>
              <p>{group.evidence}</p>
            </div>
            <ul className={styles.items}>
              {group.technologies.map((technology) => (
                <li key={technology.id} id={`tech-${technology.id}`} className={styles.item}>
                  <div className={styles.name}>
                    {technology.icon && <BrandMark name={technology.icon} size={32} />}
                    <h3>{technology.name}</h3>
                  </div>
                  {technology.status === "developing" && (
                    <span className={styles.status}>{copy.developing}</span>
                  )}
                  <div className={styles.evidence}>
                    {technology.evidence.map((evidence) => (
                      <Link href={evidence.href} key={evidence.href}>
                        {evidence.label}
                        <span aria-hidden="true"> ↗</span>
                      </Link>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {count === 0 && (
          <div className={styles.empty}>
            <h2>{copy.empty}</h2>
            <button type="button" className="button button-secondary" onClick={clearFilters}>
              {copy.clear}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
