import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID, API_URL } from "@/constants";
import { useAuth } from "../AuthProvider";
import { authenticate, validateToken } from "@/helpers";

const GoogleAuth = () => {
  const { signIn } = useAuth();
  const currentLoginData = JSON.parse(localStorage.getItem("loginData")) || {};
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
        // console.log(credentialResponse);
        // const authenticationResult = await authenticate(
        //   credentialResponse.credential
        // );
        // console.log({ authenticationResult });

        fetch(`${API_URL}/auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential: credentialResponse.credential,
            client_id: GOOGLE_CLIENT_ID,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            // TODO: should be handled by Auth provider only
            console.log({ JWT_DATA: data.payload });
            setLoginData(data.payload);
            localStorage.setItem("loginData", JSON.stringify(data.payload));
            document.cookie = `token=${credentialResponse.credential}`;
            signIn();
          });
      }}
      onError={() => {
        console.log("Login Failed");
      }}
    />
  );
};

export default GoogleAuth;
