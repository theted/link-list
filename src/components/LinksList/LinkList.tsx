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

  const deleteLink = (id: number) => async () => {
    // TODO: use react-query to remove link from server
    console.log("deleting", id);
  };

  if (isLoading) return "Loading...";
  if (error) return error.message;

  return (
    <ul>
      {data.map((link: LinkProps & { id: number }) => (
        <li key={link.id}>
          <Link {...link} />
          <a onClick={deleteLink(link.id)}>X</a>
        </li>
      ))}
    </ul>
  );
};
