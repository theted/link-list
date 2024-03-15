import { FC } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { API_URL } from "@/constants";
import { useOptimisticMutation } from "@/api";
import { Cross2Icon } from "@radix-ui/react-icons";

type LinkProps = {
  url: string;
  title: string;
};

const Link = ({ url, title }: LinkProps) => (
  <a href={url} target="_blank" className="grow">
    {title}
  </a>
);

const classes = {
  li: "list-none border flex my-2 text-left p-2 transition-colors rounded-sm  hover:bg-red-700 hover:text-red-300",
  a: "ml-3 font-bold flex items-center opacity-0 hover:opacity-100",
};

export const LinkList = () => {
  const queryClient = useQueryClient();

  // TODO: use actual router route
  const urlParts = window.location.href.split("/");
  const links_url =
    urlParts.length === 5
      ? `${API_URL}/categories/${urlParts[4]}`
      : `${API_URL}/links`;

  const { isLoading, error, data } = useQuery({
    queryKey: ["links"],
    queryFn: () => fetch(links_url).then((res) => res.json()),
  });

  // TODO: refactor into reusable hook
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
      // -> alternatively, we can update the cache with the new data directly
      // queryClient.setQueryData(["links", id], newPost);
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });

  if (isLoading) return "Loading...";
  if (error) return error.message;

  return (
    <ul>
      {data.map((link: LinkProps & { id: number }) => (
        <li key={link.id} className={classes.li}>
          <Link {...link} />
          <a onClick={() => removeLink.mutate(link.id)} className={classes.a}>
            <Cross2Icon />
          </a>
        </li>
      ))}
    </ul>
  );
};
