import { useUser } from "../../hooks/useUser";
import { Redirect } from "expo-router";
import ThemedLoader from "../ThemedLoader";

const GuestOnly = ({ children }) => {
  const { user, authReady } = useUser();
  if (!authReady) return <ThemedLoader />; // nur bis zur Initial-Entscheidung
  if (user) return <Redirect href="/dashboard" />;
  return children;
};

export default GuestOnly;
