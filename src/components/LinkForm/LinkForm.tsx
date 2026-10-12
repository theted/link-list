import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { URL_PATTERN } from "@/constants";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { postRequest } from "@/api";
import type { CategoryWithLinks } from "@/components/LinksList/LinkList";

const LinkFormInput = z.object({
  url: z
    .string()
    .nonempty("URL is required")
    .regex(URL_PATTERN, "URL is not valid"),
});

type LinkFormInput = z.infer<typeof LinkFormInput>;

export const LinkForm = () => {
  const queryClient = useQueryClient();
  const { id: category } = useParams();
  const queryKey = ["links", category];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LinkFormInput>({
    resolver: zodResolver(LinkFormInput),
  });

  // TODO: refactor into reusable hook
  const useMutationHook = useMutation({
    mutationFn: (data: LinkFormInput) =>
      postRequest("links", { ...data, category }),
    onMutate: async (newLink) => {
      await queryClient.cancelQueries({ queryKey });

      const current = queryClient.getQueryData<CategoryWithLinks>(queryKey);

      if (current) {
        queryClient.setQueryData<CategoryWithLinks>(queryKey, {
          ...current,
          links: [
            ...current.links,
            { ...newLink, id: -Date.now(), title: newLink.url },
          ],
        });
      }

      reset();

      return { current };
    },
    onError: (err, newLink, context) => {
      console.error({ err, newLink, context });
      queryClient.setQueryData(queryKey, context?.current);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const onSubmit: SubmitHandler<LinkFormInput> = (data) => {
    useMutationHook.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex gap-3">
      <Input {...register("url", { required: true })} />

      {errors.url && <span>{errors.url.message}</span>}
      <Button>Create link</Button>
    </form>
  );
};
