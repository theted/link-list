import { Navigate } from "react-router-dom";
import { CategoriesList } from "@/components/CategoriesList/CategoriesList";
import { Page } from "@/components/Page/Page";
import { AuthIsNotSignedIn, AuthIsSignedIn } from "@/AuthProvider";

export const Home = () => {
  return (
    <Page showHome={false}>
      <AuthIsSignedIn>
        <CategoriesList />
      </AuthIsSignedIn>
      <AuthIsNotSignedIn>
        <Navigate to="/login" />
      </AuthIsNotSignedIn>
    </Page>
  );
};
