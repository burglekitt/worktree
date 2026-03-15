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
  it("renders avatar external link", () => {
    render(
      <ProfileAvatarLink
        href="https://github.com/burglekitt"
        name="burglekitt"
        avatarUrl="https://github.com/burglekitt.png?size=64"
      />,
    );

    const link = screen.getByRole("link");
    const image = screen.getByLabelText("burglekitt");

    expect(link).toHaveAttribute("href", "https://github.com/burglekitt");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
    expect(image).toBeInTheDocument();
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
