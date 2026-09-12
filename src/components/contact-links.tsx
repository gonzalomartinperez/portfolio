import { BrandMark } from "./brand-mark";
import styles from "./contact-links.module.css";

export type ContactChannel = {
  /** Key into the brand icon set. */
  icon: string;
  name: string;
  detail: string;
  href: string;
  /** Mail clients should open in place; profiles are better in a new tab. */
  external: boolean;
  /** Appended to the accessible name when the link leaves the page. */
  newTabHint: string;
};

/**
 * Contact channels as labelled icon links.
 *
 * External links open in a new tab and say so in their accessible name, because a link that
 * moves someone out of the site without warning is disorienting for anyone who cannot see the
 * new tab appear.
 */
export function ContactLinks({ channels }: { channels: readonly ContactChannel[] }) {
  return (
    <ul className={styles.list}>
      {channels.map((channel) => (
        <li key={channel.href}>
          <a
            aria-label={
              channel.external
                ? `${channel.name}: ${channel.detail} (${channel.newTabHint})`
                : `${channel.name}: ${channel.detail}`
            }
            className={styles.link}
            href={channel.href}
            rel={channel.external ? "noopener noreferrer me" : undefined}
            target={channel.external ? "_blank" : undefined}
          >
            <BrandMark name={channel.icon} size={22} />
            <span className={styles.label}>
              <span className={styles.name}>{channel.name}</span>
              <span className={styles.detail}>{channel.detail}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** The same channels as bare icons, for places where the labels would be noise. */
export function ContactIcons({ channels }: { channels: readonly ContactChannel[] }) {
  return (
    <ul className={styles.compact}>
      {channels.map((channel) => (
        <li key={channel.href}>
          <a
            aria-label={channel.external ? `${channel.name} (${channel.newTabHint})` : channel.name}
            className={styles.iconOnly}
            href={channel.href}
            rel={channel.external ? "noopener noreferrer me" : undefined}
            target={channel.external ? "_blank" : undefined}
          >
            <BrandMark name={channel.icon} size={18} />
          </a>
        </li>
      ))}
    </ul>
  );
}
