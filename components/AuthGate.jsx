// components/AuthGate.tsx
import ThemedLoader from '../components/ThemedLoader';
import { useUser } from '../hooks/useUser';

export default function AuthGate({ children }) {
  const { authReady } = useUser();
  if (!authReady) return <ThemedLoader />;
  return children;
}
