import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { API_URL } from "@/constants";
import { Cross2Icon } from "@radix-ui/react-icons";
import classes from "@/classes";

type LinkProps = {
  url: string;
  title: string;
};

const Link = ({ url, title }: LinkProps) => (
  <a href={url} target="_blank" className={classes.link}>
    {title}
  </a>
);

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
    <ul className="rounded-lg">
      {data.map((link: LinkProps & { id: number }) => (
        <li key={link.id} className={classes.li}>
          <Link {...link} />
          <a
            onClick={() => removeLink.mutate(link.id)}
            className={classes.closeButton}
          >
            <Cross2Icon />
          </a>
        </li>
      ))}
    </ul>
  );
};
