import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/constants";
import { Link } from "react-router-dom";
import { CategoryForm } from "../CategoryForm/CategoryForm";
import { Key } from "react";

export const CategoriesList = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetch(`${API_URL}/categories`).then((res) => res.json()),
  });

  if (isLoading) return "Loading...";
  if (error) return error.message;

  return (
    <ul>
      {data.map((category: { id: Key; name: string }) => (
        <li key={category.id}>
          <Link to={`/categories/${category.id}`}>{category.name}</Link>
        </li>
      ))}

      <li>
        <CategoryForm />
      </li>
    </ul>
  );
};
