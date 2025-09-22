import React, { createContext, useState, useEffect } from 'react';
import { requestNotificationPermission } from '../lib/notifications';

export const NotificationContext = createContext({
  permissionGranted: false,
});

export const NotificationPermissionProvider = ({ children }) => {
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const allowed = await requestNotificationPermission();
      setPermissionGranted(allowed);
    };
    checkPermissions();
  }, []);

  return (
    <NotificationContext.Provider value={{ permissionGranted }}>
      {children}
    </NotificationContext.Provider>
  );
};
