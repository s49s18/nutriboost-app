// hooks/usePasswordResetHandler.js
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';

export default function usePasswordResetHandler() {
  const [resetToken, setResetToken] = useState(null);

  useEffect(() => {
    const handleDeepLink = (event) => {
      const { path, queryParams } = Linking.parse(event.url);
      console.log('Deep link:', path, queryParams);

      if (path === 'reset-password' && queryParams?.token) {
        setResetToken(queryParams.token);
      }
    };

    const sub = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => sub.remove();
  }, []);

  return resetToken;
}
