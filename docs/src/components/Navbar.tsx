import Image from "next/image";

import { Navbar as NextraNavbar } from "nextra-theme-docs";
import {
  projectLink,
  projectName,
  projectOwnerAvatarUrl,
  projectOwnerName,
} from "../lib/site-meta";

export function Navbar() {
  return (
    <NextraNavbar
      logo={
        <span
          style={{
            alignItems: "center",
            display: "inline-flex",
            fontWeight: 700,
            gap: "0.5rem",
          }}
        >
          <Image
            src={projectOwnerAvatarUrl}
            alt={projectOwnerName}
            width={24}
            height={24}
            style={{ borderRadius: "999px" }}
          />
          {projectName}
        </span>
      }
      projectLink={projectLink}
    />
  );
}
