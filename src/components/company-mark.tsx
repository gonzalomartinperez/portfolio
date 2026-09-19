import Image from "next/image";
import styles from "./company-mark.module.css";

const companies = new Set(["rampy", "teamcubation", "cooperativa-obrera", "pequeverso"]);

export function CompanyMark({ company }: { company: string }) {
  if (!companies.has(company)) return null;
  return (
    <span className={styles.tile}>
      <Image
        alt=""
        src={`/images/companies/${company}.png`}
        width={40}
        height={40}
        className={styles.image}
        unoptimized
      />
    </span>
  );
}
