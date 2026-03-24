import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";
import { Footer } from "./Footer";

type MockImageProps = {
  alt?: string;
};

type MockFooterProps = {
  children: ReactNode;
};

vi.mock("next/image", () => ({
  default: ({ alt }: MockImageProps) => <span role="img" aria-label={alt} />,
}));

vi.mock("nextra-theme-docs", () => ({
  Footer: ({ children }: MockFooterProps) => <footer>{children}</footer>,
}));

describe("Footer", () => {
  it("renders org and maintainer links", () => {
    render(<Footer />);

    expect(screen.getByText(/CLI Version: v\d+\.\d+\.\d+/)).toBeInTheDocument();
    expect(screen.getByText("Maintainers:")).toBeInTheDocument();

    const orgLink = screen.getByRole("link", { name: /burglekitt/ });
    expect(orgLink).toHaveAttribute("target", "_blank");
    expect(orgLink).toHaveAttribute("href", "https://github.com/burglekitt");

    expect(
      screen.getByRole("link", { name: /Baldur Páll Hólmgeirsson/ }),
    ).toHaveAttribute("target", "_blank");
    expect(
      screen.getByRole("link", { name: /Craig O\. Curtis/ }),
    ).toHaveAttribute("target", "_blank");
  });
});
