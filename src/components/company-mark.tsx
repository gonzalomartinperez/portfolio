import Image from "next/image";
import styles from "./company-mark.module.css";

const companyImages: Record<string, string> = {
  rampy: "rampy.png",
  teamcubation: "teamcubation.png",
  "cooperativa-obrera": "cooperativa-obrera-100.jpg",
  pequeverso: "pequeverso-isotipo.webp",
  independent: "independent.jpg",
};

export function CompanyMark({ company }: { company: string }) {
  const image = companyImages[company];
  if (!image) return null;
  return (
    <span className={`${styles.tile} ${company === "pequeverso" ? styles.round : ""}`}>
      <Image
        alt=""
        src={`/images/companies/${image}`}
        width={40}
        height={40}
        className={styles.image}
        unoptimized
      />
    </span>
  );
}
