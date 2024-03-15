import { LinkList } from "@/components/LinksList/LinkList";
import { Link } from "react-router-dom";
import { HomeIcon } from "@radix-ui/react-icons";

export const Category = () => {
  return (
    <>
      <Link to="/">
        <HomeIcon className="bg-seondary-foreground" />
      </Link>

      <LinkList />
    </>
  );
};
