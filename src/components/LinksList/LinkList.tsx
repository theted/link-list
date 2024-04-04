import { useQueryClient, useMutation } from "@tanstack/react-query";
import { API_URL } from "@/constants";
import { Cross2Icon, Pencil1Icon } from "@radix-ui/react-icons";
import classes from "@/classes";
import { useGet } from "@/api";

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

  const { isLoading, error, data } = useGet<LinkProps>(
    `categories/${window.location.href.split("/")[4]}`,
    "links"
  );

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
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });

  if (isLoading) return "Loading...";
  if (error) return error.message;

  const editLink = (data: any) => {
    console.log("edit!", data);
  };

  return (
    <>
      <h2 className="text-lg text-left font-bold">{data.category.name}</h2>
      <ul className="rounded-lg">
        {/* <pre>{JSON.stringify(data.category, null, 2)}</pre> */}
        {data.links.map((link: LinkProps & { id: number }) => (
          <li key={link.id} className={classes.li}>
            <Link {...link} />
            <a
              onClick={() => editLink(link.id)}
              onKeyDown={() => editLink(link.id)}
              className={classes.linkButton}
            >
              <Pencil1Icon />
            </a>
            <a
              onClick={() => removeLink.mutate(link.id)}
              onKeyDown={() => removeLink.mutate(link.id)}
              className={classes.linkButton}
            >
              <Cross2Icon />
            </a>
          </li>
        ))}
      </ul>
    </>
  );
};
