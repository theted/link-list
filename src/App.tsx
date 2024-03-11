import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LinkList } from "./components/LinksList/LinkList";
import { LinkForm } from "./components/LinkForm/LinkForm";
import "./App.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <div className="main">
      <LinkList />
      <LinkForm />
    </div>
  </QueryClientProvider>
);

export default App;
