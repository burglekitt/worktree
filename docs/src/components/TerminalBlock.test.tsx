import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { TerminalBlock } from "./TerminalBlock";

type MockCodeProps = {
  children: ReactNode;
  "data-language"?: string;
};

type MockPreProps = {
  children: ReactNode;
  "data-language"?: string;
};

vi.mock("nextra/components", () => ({
  Code: ({ children, "data-language": language }: MockCodeProps) => (
    <code className="nextra-code" data-language={language}>
      {children}
    </code>
  ),
  Pre: ({ children, "data-language": language }: MockPreProps) => (
    <pre data-language={language}>{children}</pre>
  ),
}));

describe("TerminalBlock", () => {
  it("renders command in code block with default bash language", () => {
    render(<TerminalBlock>worktree config</TerminalBlock>);

    const pre = screen.getByText("worktree config").closest("pre");
    const code = screen.getByText("worktree config").closest("code");

    expect(pre).toHaveAttribute("data-language", "bash");
    expect(code).toHaveAttribute("data-language", "bash");
  });

  it("renders multiline commands and trims surrounding whitespace", () => {
    render(
      <TerminalBlock language="sh">
        {`
          echo one
          echo two
        `}
      </TerminalBlock>,
    );

    expect(screen.getByText("echo one")).toBeInTheDocument();
    expect(screen.getByText("echo two")).toBeInTheDocument();

    const code = screen.getByText("echo one").closest("code");
    expect(code).toHaveAttribute("data-language", "sh");
  });
});
