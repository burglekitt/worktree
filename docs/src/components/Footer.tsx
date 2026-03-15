import Image from "next/image";
import { Footer as NextraFooter } from "nextra-theme-docs";
import { cliVersion, maintainers } from "../lib/site-meta";

export function Footer() {
  return (
    <NextraFooter>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        <div
          style={{
            alignItems: "center",
            display: "inline-flex",
            gap: "0.5rem",
          }}
        >
          <Image
            src="https://github.com/burglekitt.png?size=64"
            alt="Burglekitt"
            width={24}
            height={24}
            style={{ borderRadius: "999px" }}
          />
          <span>MIT {new Date().getFullYear()} © Burglekitt</span>
        </div>
        <div>CLI Version: v{cliVersion}</div>
        <div>
          <div style={{ marginBottom: "0.5rem" }}>Maintainers:</div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {maintainers.map((maintainer) => (
              <a
                key={maintainer.profileUrl}
                href={maintainer.profileUrl}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <Image
                  src={maintainer.avatarUrl}
                  alt={maintainer.name}
                  width={32}
                  height={32}
                  style={{ borderRadius: "999px" }}
                />
                {maintainer.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </NextraFooter>
  );
}
