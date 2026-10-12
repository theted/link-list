import { Navigate } from "react-router-dom";
import { LinkList } from "@/components/LinksList/LinkList";
import { LinkForm } from "@/components/LinkForm/LinkForm";
import { Page } from "@/components/Page/Page";
import { AuthIsNotSignedIn, AuthIsSignedIn } from "@/AuthProvider";

export const Category = () => {
  return (
    <Page>
      <AuthIsSignedIn>
        <LinkList />
        <LinkForm />
      </AuthIsSignedIn>
      <AuthIsNotSignedIn>
        <Navigate to="/login" />
      </AuthIsNotSignedIn>
    </Page>
  );
};
