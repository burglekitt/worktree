import { Footer as NextraFooter } from "nextra-theme-docs";
import {
  cliVersion,
  maintainers,
  projectOwnerAvatarUrl,
  projectOwnerName,
  projectOwnerProfileUrl,
} from "../lib/site-meta";
import { ProfileAvatarLink } from "./ProfileAvatarLink";

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
          <ProfileAvatarLink
            href={projectOwnerProfileUrl}
            name={projectOwnerName}
            avatarUrl={projectOwnerAvatarUrl}
            style={{ gap: 0 }}
          />
          <span>
            MIT {new Date().getFullYear()} ©{" "}
            <a
              href={projectOwnerProfileUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: "inherit" }}
            >
              {projectOwnerName}
            </a>
          </span>
        </div>
        <div>CLI Version: v{cliVersion}</div>
        <div>
          <div style={{ marginBottom: "0.5rem" }}>Maintainers:</div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {maintainers.map((maintainer) => (
              <ProfileAvatarLink
                key={maintainer.profileUrl}
                href={maintainer.profileUrl}
                name={maintainer.name}
                avatarUrl={maintainer.avatarUrl}
                showName
              />
            ))}
          </div>
        </div>
      </div>
    </NextraFooter>
  );
}
