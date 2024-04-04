import { CategoriesList } from "@/components/CategoriesList/CategoriesList";
import { Page } from "@/components/Page/Page";

export const Home = () => {
  return (
    <Page showHome={false}>
      <CategoriesList />
    </Page>
  );
};
