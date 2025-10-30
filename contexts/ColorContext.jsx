import React, { createContext, useState, useEffect, useContext } from "react";
import {Colors } from "../constants/Colors";
import { supabase } from "../lib/supabaseClient";
import { useUser } from '../hooks/useUser';

export const ColorContext = createContext();

export const ColorProvider = ({ children }) => {
  const { user } = useUser();
  const [customColors, setCustomColors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchColors();
  }, [user]);

  const fetchColors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("colors") // Spalte in JSON Format in profiles anlegen
      .eq("id", user.id)
      .single();

    if (!error && data?.colors) {
      setCustomColors(data.colors);
    }
    setLoading(false);
  };

  const updateColors = async (newColors) => {
    setCustomColors(newColors);

    const { error } = await supabase
      .from("profiles")
      .update({ colors: newColors })
      .eq("id", user.id);

    if (error) console.error("Fehler beim Speichern:", error);
  };

  const resetColors = async () => {
    try {
      setCustomColors({}); // Lokalen State zurücksetzen
      const { error } = await supabase
        .from("profiles")
        .update({ colors: null }) // Datenbank zurücksetzen
        .eq("id", user.id);

      if (error) throw error;
    } catch (err) {
      console.error("Fehler beim Zurücksetzen der Farben:", err);
    }
  };

  const mergedColors = { ...Colors, ...customColors };

  const editableKeys = ["primary","secondary","tertiary","quaternary"];

    const editableColors = editableKeys.reduce((acc, key) => {
    acc[key] = mergedColors[key] || Colors[key];
    return acc;
    }, {});


  return (
    <ColorContext.Provider value={{ mergedColors, updateColors, resetColors, loading, colors: editableColors }}>
      {children}
    </ColorContext.Provider>
  );
};
