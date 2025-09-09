import React, { createContext, useState, useEffect, useContext } from "react";
import {Colors } from "../constants/Colors";
import { supabase } from "../lib/supabaseClient";
import { UserContext } from "./UserContexts";

export const ColorContext = createContext();

export const ColorProvider = ({ children }) => {
  const { user } = useContext(UserContext);
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

  const mergedColors = { ...Colors, ...customColors };
  console.log("mergedColors:", mergedColors);

  const editableKeys = ["primary","secondary","tertiary","quaternary","quinary","senary"];

    const editableColors = editableKeys.reduce((acc, key) => {
    acc[key] = mergedColors[key] || Colors[key];
    return acc;
    }, {});

    console.log("Editable Farben:", editableColors); // sollte jetzt Werte enthalten


  return (
    <ColorContext.Provider value={{ mergedColors, updateColors, loading, colors: editableColors }}>
      {children}
    </ColorContext.Provider>
  );
};
