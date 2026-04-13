import { getToday } from "@burglekitt/gmt";
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
  const year = getToday().split("-")[0];
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
            target="_blank"
          />
          <span>{`MIT ${year} © ${projectOwnerName}`}</span>
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
                target="_blank"
                showName
              />
            ))}
          </div>
        </div>
      </div>
    </NextraFooter>
  );
}
