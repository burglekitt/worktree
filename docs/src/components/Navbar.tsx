import { Navbar as NextraNavbar } from "nextra-theme-docs";
import {
  projectLink,
  projectName,
  projectOwnerAvatarUrl,
  projectOwnerName,
  projectOwnerProfileUrl,
} from "../lib/site-meta";
import { ProfileAvatarLink } from "./ProfileAvatarLink";

export function Navbar() {
  return (
    <NextraNavbar
      logoLink={false}
      logo={
        <span
          style={{
            alignItems: "center",
            display: "inline-flex",
            fontWeight: 700,
            gap: "0.5rem",
          }}
        >
          <ProfileAvatarLink
            href={projectOwnerProfileUrl}
            name={projectOwnerName}
            avatarUrl={projectOwnerAvatarUrl}
            style={{ gap: 0 }}
          />
          {projectName}
        </span>
      }
      projectLink={projectLink}
    />
  );
}
