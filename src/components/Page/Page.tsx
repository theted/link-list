import { FC, ReactNode } from "react";
import { Link } from "react-router-dom";
import { HomeIcon } from "@radix-ui/react-icons";

interface PageProps {
  children: ReactNode;
  showHome?: boolean;
}

export const Page: FC<PageProps> = ({ children, showHome }) => {
  return (
    <>
      {showHome !== false && (
        <Link to="/">
          <HomeIcon
            className=""
            style={{
              height: "30px",
              width: "30px",
            }}
          />
        </Link>
      )}

      <div className="bg-secondary border border-secondary rounded-lg p-6 mt-3">
        {children}
      </div>
    </>
  );
};
