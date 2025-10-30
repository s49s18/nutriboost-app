import { useUser } from "../../hooks/useUser";
import { Redirect } from "expo-router";
import ThemedLoader from "../ThemedLoader";

const UserOnly = ({ children }) => {
  const { user, authReady } = useUser();
  if (!authReady) return <ThemedLoader />; // nur bis zur Initial-Entscheidung
  if (!user) return <Redirect href="/" />;
  return children;
};

export default UserOnly;
