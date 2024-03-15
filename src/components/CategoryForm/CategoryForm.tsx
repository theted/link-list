import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/constants";
import { useQueryClient, useMutation } from "@tanstack/react-query";

type LinkProps = {
  url: string;
  title: string;
};

const LinkFormInput = z.object({
  name: z.string().nonempty("Title is required"),
});

export const CategoryForm = () => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<typeof LinkFormInput>({
    resolver: zodResolver(LinkFormInput),
  });

  const createCategory = async (data: LinkProps) => {
    return fetch(`${API_URL}/categories`, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  // TODO: refactor into reusable hook
  const useMutationHook = useMutation({
    mutationFn: createCategory,
    onMutate: async (newCategory) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });

      const currentLinks = queryClient.getQueryData(["categories"]);

      queryClient.setQueryData(["categories"], (old: LinkProps[]) => [
        ...old,
        newCategory,
      ]);

      reset();

      return { currentLinks };
    },
    onError: (err, newCategory, context) => {
      console.error({ err, newCategory, context });
      queryClient.setQueryData(["categories"], context.currentLinks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const onSubmit: SubmitHandler<LinkFormInput> = (data) => {
    console.log("CREATE CAT", data);
    useMutationHook.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex gap-3">
      <Input {...register("name", { required: true })} />
      {errors && <span>{errors.message}</span>}
      <Button>Create category</Button>
    </form>
  );
};
