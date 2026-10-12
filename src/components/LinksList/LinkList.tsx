import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Cross2Icon, Pencil1Icon } from "@radix-ui/react-icons";
import classes from "@/classes";
import { useGet, deleteRequest } from "@/api";

type LinkProps = {
  url: string;
  title: string | null;
};

export type CategoryWithLinks = {
  category: { id: number; name: string };
  links: (LinkProps & { id: number })[];
};

const Link = ({ url, title }: LinkProps) => (
  <a href={url} target="_blank" className={classes.link}>
    {title ?? url}
  </a>
);

export const LinkList = () => {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const queryKey = ["links", id];

  const { isLoading, error, data } = useGet<CategoryWithLinks>(
    `categories/${id}`,
    queryKey
  );

  // TODO: refactor into reusable hook
  const removeLink = useMutation({
    mutationFn: (linkId: number) => deleteRequest(`links/${linkId}`),
    onMutate: async (linkId: number) => {
      await queryClient.cancelQueries({ queryKey });
      const previousItems =
        queryClient.getQueryData<CategoryWithLinks>(queryKey);

      if (previousItems) {
        queryClient.setQueryData<CategoryWithLinks>(queryKey, {
          ...previousItems,
          links: previousItems.links.filter((l) => l.id !== linkId),
        });
      }

      return { previousItems };
    },
    onError: (_err, _linkId, context) => {
      queryClient.setQueryData(queryKey, context?.previousItems);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  if (isLoading) return "Loading...";
  if (error) return error.message;
  if (!data) return null;

  const editLink = (data: any) => {
    console.log("edit!", data);
  };

  return (
    <>
      <h2 className="text-lg text-left font-bold">{data.category.name}</h2>
      <ul className="rounded-lg">
        {/* <pre>{JSON.stringify(data.category, null, 2)}</pre> */}
        {data.links.map((link) => (
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
