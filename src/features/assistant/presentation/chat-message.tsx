"use client";
import { memo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { copy, type Locale } from "../copy";
import type { Message } from "../domain/models";
import { CopyAnswer } from "./copy-answer";
import { cx } from "./styles";

function safeUrl(url: string): string {
  return /^https:\/\//i.test(url) ? url : "";
}

export const ChatMessage = memo(function ChatMessage({
  message,
  locale,
  onFeedback,
  rating,
}: {
  message: Message;
  locale: Locale;
  onFeedback: (id: string, rating: "up" | "down") => void;
  rating: "up" | "down" | undefined;
}) {
  const t = copy[locale];
  return (
    <article className={cx(`message ${message.role}`)}>
      <div className={cx("message-meta")}>
        <span className={cx("message-avatar")} aria-hidden="true">
          {message.role === "user" ? t.you.slice(0, 1) : "G"}
        </span>
        <strong>{message.role === "user" ? t.you : t.assistant}</strong>
      </div>
      <div className={cx("message-body")}>
        <div className={cx("markdown")}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            skipHtml
            urlTransform={safeUrl}
            components={{
              img: () => null,
              a: ({ children, href }) =>
                href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ) : (
                  <span>{children}</span>
                ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        {message.citations.length > 0 && (
          <details className={cx("sources")}>
            <summary>
              {t.sources} · {message.citations.length}
            </summary>
            <ul>
              {message.citations.map((citation) => (
                <li key={citation.id}>
                  <a href={citation.url} target="_blank" rel="noopener noreferrer">
                    <span className={cx("source-kind")}>
                      {citation.source_type === "code" ? t.code : t.document}
                    </span>
                    <span className={cx("source-title")}>{citation.label}</span>
                    {citation.start_line && citation.end_line && (
                      <span className={cx("source-lines")}>
                        L{citation.start_line ?? ""}–{citation.end_line ?? ""} ↗
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}
        {message.role === "assistant" && (
          <div className={cx("answer-actions")}>
            <CopyAnswer content={message.content} locale={locale} />
            <fieldset className={cx("feedback")}>
              <legend className={cx("sr-only")}>{t.feedback}</legend>
              <Button
                variant="ghost"
                type="button"
                aria-pressed={rating === "up"}
                onClick={() => onFeedback(message.id, "up")}
              >
                {t.up}
              </Button>
              <Button
                variant="ghost"
                type="button"
                aria-pressed={rating === "down"}
                onClick={() => onFeedback(message.id, "down")}
              >
                {t.down}
              </Button>
              {rating && <span role="status">{t.thanks}</span>}
            </fieldset>
          </div>
        )}
      </div>
    </article>
  );
});
