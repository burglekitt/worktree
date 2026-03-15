import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { Navbar } from "./Navbar";

type MockImageProps = {
  alt?: string;
};

type MockNavbarProps = {
  logo: ReactNode;
  projectLink: string;
};

vi.mock("next/image", () => ({
  default: ({ alt }: MockImageProps) => <span role="img" aria-label={alt} />,
}));

vi.mock("nextra-theme-docs", () => ({
  Navbar: ({ logo, projectLink }: MockNavbarProps) => (
    <div>
      <div>{logo}</div>
      <a href={projectLink}>Project Link</a>
    </div>
  ),
}));

describe("Navbar", () => {
  it("renders project brand and links", () => {
    render(<Navbar />);

    expect(screen.getByText("Worktree")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Project Link" })).toHaveAttribute(
      "href",
      "https://github.com/burglekitt/worktree",
    );
    expect(screen.getByRole("link", { name: "burglekitt" })).toHaveAttribute(
      "href",
      "https://github.com/burglekitt",
    );
  });
});
