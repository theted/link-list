import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { postRequest } from "@/api";
import type { Category } from "@/components/CategoriesList/CategoriesList";

const CategoryFormInput = z.object({
  name: z.string().nonempty("Title is required"),
});

type CategoryFormInput = z.infer<typeof CategoryFormInput>;

export const CategoryForm = () => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(CategoryFormInput),
  });

  const createCategory = async (data: CategoryFormInput) =>
    postRequest("categories", data);

  // TODO: refactor into reusable hook
  const useMutationHook = useMutation({
    mutationFn: createCategory,
    onMutate: async (newCategory) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });

      const currentCategories = queryClient.getQueryData<Category[]>([
        "categories",
      ]);

      queryClient.setQueryData<Category[]>(["categories"], (old = []) => [
        ...old,
        { ...newCategory, id: -Date.now() },
      ]);

      reset();

      return { currentCategories };
    },
    onError: (err, newCategory, context) => {
      console.error({ err, newCategory, context });
      queryClient.setQueryData(["categories"], context?.currentCategories);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const onSubmit: SubmitHandler<CategoryFormInput> = (data) => {
    useMutationHook.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex gap-3">
      <Input {...register("name", { required: true })} />
      {errors.name && <span>{errors.name.message}</span>}
      <Button>Create category</Button>
    </form>
  );
};
