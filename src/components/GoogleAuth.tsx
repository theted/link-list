import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../AuthProvider";
import { authenticate } from "@/helpers";

const GoogleAuth = () => {
  const { signIn } = useAuth();
  const currentLoginData = JSON.parse(localStorage.getItem("loginData") ?? "{}");
  // console.log({ currentLoginData });

  const [loginData, setLoginData] = useState(currentLoginData);

  // TODO: use auth provider context
  if (loginData?.exp) {
    const expired = Date.now() >= loginData.exp * 1000;

    if (!expired) {
      // TODO: set into Auth context
      return (
        <div className="text-left mb-6 border border-slate-600 p-6">
          <pre>{JSON.stringify(loginData, null, 2)}</pre>
        </div>
      );
    }
  }

  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        const data = await authenticate(credentialResponse.credential);

        if (!data.token) {
          console.log("Login Failed", data.message);
          return;
        }

        // TODO: should be handled by Auth provider only
        setLoginData(data.payload);
        localStorage.setItem("loginData", JSON.stringify(data.payload));
        localStorage.setItem("token", data.token);
        signIn(data.payload);
      }}
      onError={() => {
        console.log("Login Failed");
      }}
    />
  );
};

export default GoogleAuth;
