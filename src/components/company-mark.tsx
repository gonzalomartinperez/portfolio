import Image from "next/image";
import styles from "./company-mark.module.css";

const companyImages: Record<string, string> = {
  rampy: "rampy.png",
  teamcubation: "teamcubation.svg",
  "cooperativa-obrera": "cooperativa-obrera.png",
  pequeverso: "pequeverso-isotipo.webp",
  independent: "independent.jpg",
};

export function CompanyMark({ company }: { company: string }) {
  const image = companyImages[company];
  if (!image) return null;
  return (
    <span
      className={`${styles.tile} ${company === "pequeverso" ? styles.round : ""}`}
      data-company={company}
    >
      <Image
        alt=""
        src={`/images/companies/${image}`}
        width={48}
        height={48}
        className={styles.image}
        unoptimized
      />
    </span>
  );
}
