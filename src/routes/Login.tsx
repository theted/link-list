import { Page } from "@/components/Page/Page";
import GoogleAuth from "@/components/GoogleAuth";
import { useAuth } from "@/AuthProvider";

export const Login = () => {
  const { signOut, authStatus, userData } = useAuth();
  const isLoggedin = authStatus === 1;

  return (
    <Page>
      <div>
        {isLoggedin ? (
          <>
            <p>Logged-in user</p>
            <button onClick={signOut}>Log out</button>
            <pre className="text-left">{JSON.stringify(userData, null, 2)}</pre>
          </>
        ) : (
          <GoogleAuth />
        )}
      </div>
    </Page>
  );
};
