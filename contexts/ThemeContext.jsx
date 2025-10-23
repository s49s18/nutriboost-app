import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../hooks/useUser';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { user } = useUser();
  const colorScheme = Appearance.getColorScheme(); // light / dark
  const [themeName, setThemeName] = useState(colorScheme || 'light');

  // Beim Login gespeichertes Theme laden
  useEffect(() => {
    if (user) fetchUserTheme();
  }, [user]);

  const fetchUserTheme = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('theme')
      .eq('id', user.id)
      .single();

    if (!error && data?.theme) {
      setThemeName(data.theme);
    }
  };

  // Theme wechseln & in DB speichern
  const toggleTheme = async () => {
    const newTheme = themeName === 'light' ? 'dark' : 'light';
    setThemeName(newTheme);

    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ theme: newTheme })
      .eq('id', user.id);

    if (error) console.error('Fehler beim Speichern des Themes:', error);
  };

  return (
    <ThemeContext.Provider value={{ themeName, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
