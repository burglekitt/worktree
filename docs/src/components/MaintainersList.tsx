import type { ElementType } from "react";
import { useMDXComponents } from "../../mdx-components";

type Maintainer = {
  name: string;
  profileUrl: string;
};

type MaintainersListProps = {
  maintainers: readonly Maintainer[];
};

export function MaintainersList({ maintainers }: MaintainersListProps) {
  const mdxComponents = useMDXComponents({});
  const Ul = (mdxComponents.ul ?? "ul") as ElementType;
  const Li = (mdxComponents.li ?? "li") as ElementType;
  const A = (mdxComponents.a ?? "a") as ElementType;

  return (
    <Ul>
      {maintainers.map((maintainer) => (
        <Li key={maintainer.profileUrl}>
          <A href={maintainer.profileUrl}>{maintainer.name}</A>
        </Li>
      ))}
    </Ul>
  );
}
