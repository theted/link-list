import { LinkList } from "@/components/LinksList/LinkList";
import { LinkForm } from "@/components/LinkForm/LinkForm";
import { Page } from "@/components/Page/Page";

export const Category = () => {
  return (
    <Page>
      <LinkList />
      <LinkForm />
    </Page>
  );
};
