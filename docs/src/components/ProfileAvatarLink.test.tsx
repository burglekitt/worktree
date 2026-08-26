import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { ProfileAvatarLink } from "./ProfileAvatarLink";

type MockImageProps = {
  alt?: string;
};

vi.mock("next/image", () => ({
  default: ({ alt }: MockImageProps) => <span role="img" aria-label={alt} />,
}));

describe("ProfileAvatarLink", () => {
  it("renders avatar link", () => {
    render(
      <ProfileAvatarLink
        href="https://github.com/northguild"
        name="northguild"
        avatarUrl="https://github.com/northguild.png?size=64"
      />,
    );

    const link = screen.getByRole("link");
    const image = screen.getByLabelText("northguild");

    expect(link).toHaveAttribute("href", "https://github.com/northguild");
    expect(image).toBeInTheDocument();
  });

  it.each`
    target
    ${"_blank"}
    ${"_self"}
    ${"_parent"}
    ${"_top"}
    ${undefined}
  `("sets target attribute when target is $target", ({ target }) => {
    render(
      <ProfileAvatarLink
        href="https://github.com/northguild"
        name="northguild"
        avatarUrl="https://github.com/northguild.png?size=64"
        target={target}
      />,
    );

    const link = screen.getByRole("link");
    if (target) {
      expect(link).toHaveAttribute("target", target);
    } else {
      expect(link).not.toHaveAttribute("target");
    }

    if (target === "_blank") {
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    } else {
      expect(link).not.toHaveAttribute("rel");
    }
  });

  it("shows profile name when configured", () => {
    render(
      <ProfileAvatarLink
        href="https://github.com/craig-o-curtis"
        name="Craig O. Curtis"
        avatarUrl="https://github.com/craig-o-curtis.png?size=64"
        showName
      />,
    );

    expect(screen.getByText("Craig O. Curtis")).toBeInTheDocument();
  });
});
