import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_URL, URL_PATTERN } from "@/constants";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useOptimisticMutation } from "./api";

type LinkProps = {
  url: string;
  title: string;
};

const LinkFormInput = z.object({
  url: z
    .string()
    .nonempty("URL is required")
    .regex(URL_PATTERN, "URL is not valid"),
});

export const LinkForm = () => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<typeof LinkFormInput>({
    resolver: zodResolver(LinkFormInput),
  });

  const createLink = async (data: LinkProps) => {
    return fetch(`${API_URL}/links`, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  // TODO: refactor into reusable hook
  const useMutationHook = useMutation({
    mutationFn: (data) => {
      const currentUrl = window.location.href.split("/");

      return createLink({
        ...data,
        category: currentUrl.length === 5 ? currentUrl[4] : null,
      });
    },
    onMutate: async (newLink) => {
      await queryClient.cancelQueries({ queryKey: ["links"] });

      const currentLinks = queryClient.getQueryData(["links"]);
      const currentUrl = window.location.href.split("/");

      console.log({ currentUrl });

      queryClient.setQueryData(["links"], (old: LinkProps[]) => [
        ...old,
        {
          ...newLink,
          id: currentLinks ? currentLinks.length + 1 : 1,
          category: currentUrl.length === 5 ? currentUrl[4] : null,
          title: newLink.url,
        },
      ]);

      reset();

      return { currentLinks };
    },
    onError: (err, newLink, context) => {
      console.error({ err, newLink, context });
      queryClient.setQueryData(["links"], context.currentLinks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });

  const onSubmit: SubmitHandler<LinkFormInput> = (data) => {
    useMutationHook.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex gap-3">
      <Input {...register("url", { required: true })} />

      {errors && <span>{errors.message}</span>}
      <Button>Create link</Button>
    </form>
  );
};
