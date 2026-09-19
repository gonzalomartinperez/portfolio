"use client";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { Technology } from "@/content/technologies";
import styles from "./technology-catalogue.module.css";
import { TechnologyMark } from "./technology-mark";
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
      <Card className={styles.controls}>
        <div className={styles.field}>
          <Label htmlFor="technology-search">{copy.search}</Label>
          <Input
            id="technology-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-controls="technology-results"
          />
        </div>
        <div className={styles.field}>
          <Label htmlFor="technology-category">{copy.category}</Label>
          <NativeSelect
            id="technology-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-controls="technology-results"
          >
            <NativeSelectOption value="">{copy.all}</NativeSelectOption>
            {groups.map((group) => (
              <NativeSelectOption key={group.id} value={group.id}>
                {group.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <Button
          variant="outline"
          type="button"
          onClick={clearFilters}
          disabled={!query && !category}
        >
          {copy.clear}
        </Button>
      </Card>
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
                <li key={technology.id} id={`tech-${technology.id}`}>
                  <Card className={styles.item}>
                    <div className={styles.name}>
                      <TechnologyMark technology={technology} size={32} />
                      <h3>{technology.name}</h3>
                    </div>
                    {technology.status === "developing" && (
                      <Badge variant="outline" className={styles.status}>
                        {copy.developing}
                      </Badge>
                    )}
                    <div className={styles.evidence}>
                      {technology.evidence.map((evidence) => (
                        <Link href={evidence.href} key={evidence.href}>
                          {evidence.label}
                          <span aria-hidden="true"> ↗</span>
                        </Link>
                      ))}
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {count === 0 && (
          <div className={styles.empty}>
            <h2>{copy.empty}</h2>
            <Button variant="outline" onClick={clearFilters}>
              {copy.clear}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
