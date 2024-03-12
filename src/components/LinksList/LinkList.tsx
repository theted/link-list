import { FC } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { API_URL } from "@/constants";
import { useOptimisticMutation } from "@/api";

type LinkProps = {
  url: string;
  title: string;
};

const Link = ({ url, title }: LinkProps) => (
  <a href={url} target="_blank">
    {title}
  </a>
);

export const LinkList = () => {
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["links"],
    queryFn: () => fetch(`${API_URL}/links`).then((res) => res.json()),
  });

  const removeLink = useMutation({
    mutationFn: (id: number) => {
      return fetch(`${API_URL}/links/${id}`, {
        method: "DELETE",
      });
    },
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["links"] });
      const previousItems = queryClient.getQueryData(["links"]);
      queryClient.setQueryData(["links"], (old) =>
        old.filter((l) => l.id !== id)
      );
      return { previousItems };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["links"], context.previousItems);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });

  if (isLoading) return "Loading...";
  if (error) return error.message;

  return (
    <ul>
      {data.map((link: LinkProps & { id: number }) => (
        <li key={link.id}>
          <Link {...link} />
          <a onClick={() => removeLink.mutate(link.id)}>X</a>
        </li>
      ))}
    </ul>
  );
};
