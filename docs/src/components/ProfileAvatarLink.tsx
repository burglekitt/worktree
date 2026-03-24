import Image from "next/image";

type ProfileAvatarLinkProps = {
  href: string;
  name: string;
  avatarUrl: string;
  size?: number;
  showName?: boolean;
  style?: React.CSSProperties;
};

export function ProfileAvatarLink({
  href,
  name,
  avatarUrl,
  size = 32,
  showName = false,
  style,
}: ProfileAvatarLinkProps) {
  return (
    <a
      href={href}
      rel="noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        textDecoration: "none",
        color: "inherit",
        ...style,
      }}
    >
      <Image
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        style={{ borderRadius: "999px" }}
      />
      {showName ? <span>{name}</span> : null}
    </a>
  );
}
