import { Link } from "react-router-dom";

export const ErrorPage = () => {
  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <Link to="/">Go home</Link>
      </p>
    </div>
  );
};
