import { Link } from "react-router-dom";
import { CategoryForm } from "../CategoryForm/CategoryForm";
import classes from "@/classes";
import { useGet } from "@/api";

export type Category = { id: number; name: string };

export const CategoriesList = () => {
  const { isLoading, error, data } = useGet<Category[]>("categories", [
    "categories",
  ]);

  if (isLoading) return "Loading...";
  if (error) return error.message;

  return (
    <ul className="rounded-lg">
      {data?.map((category) => (
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
