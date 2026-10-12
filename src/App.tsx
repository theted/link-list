import { useAuth } from "./AuthProvider";
import { AppShell } from "./components/AppShell";
import { Splash } from "./components/Splash/Splash";

// Signed out, every route shows the splash; signing in lands on the same URL
const App = () => {
  const { signedIn } = useAuth();
  return signedIn ? <AppShell /> : <Splash />;
};

export default App;
