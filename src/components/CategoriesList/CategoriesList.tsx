import { Navigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { CategoryForm } from "../CategoryForm/CategoryForm";
import { Key } from "react";
import classes from "@/classes";
import { useGet } from "@/api";

export const CategoriesList = () => {
  const { isLoading, error, data } = useGet("categories", "categories");

  if (isLoading) return "Loading...";

  // TODO: handle token error in hook
  // if (data.message) {
  //   return <Navigate to="/login" />;
  // }

  if (error) return error.message;

  return (
    <ul className="rounded-lg">
      {data.map((category: { id: Key; name: string }) => (
        <li key={category.id} className={classes.li}>
          <Link to={`/categories/${category.id}`} className="grow">
            {category.name}
          </Link>
        </li>
      ))}

      <li>
        <CategoryForm />
      </li>
    </ul>
  );
};
