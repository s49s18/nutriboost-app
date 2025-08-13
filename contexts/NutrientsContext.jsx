import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { UserContext } from "./UserContexts";

export const NutrientsContext = createContext();

export function NutrientsProvider({ children }) {
  const { user } = useContext(UserContext); 

  const [allNutrients, setAllNutrients] = useState([]);
  const [trackedNutrients, setTrackedNutrients] = useState([]);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingTracked, setLoadingTracked] = useState(true);
  const [takenToday, setTakenToday] = useState({}); // { nutrient_id: true/false }

  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD


  useEffect(() => {
    fetchAllNutrients();
  }, []);

  // wenn sich User anmeldet, die nutrients laden für diesen User
  useEffect(() => {
    if (user) {
      fetchTrackedNutrients(user.id);
    } else {
      setTrackedNutrients([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadTakenToday(user.id);
    }
  }, [user, trackedNutrients]);

  // Alle Nährstoffe laden
  async function fetchAllNutrients() {
    setLoadingAll(true);
    try {
      const { data, error } = await supabase.from('nutrients').select('*').order('name');
      if (error) throw error;

      setAllNutrients(data);
      setLoadingAll(false);
      return data;
    } catch (err) {
      console.error('Fehler beim Laden aller Nährstoffe:', err.message);
      setLoadingAll(false);
      return [];
    }
  }

  // Nährstoff nach ID
  async function fetchNutrientById(id) {
    try {
      const { data, error } = await supabase
        .from('nutrients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Fehler beim Laden des Nährstoffs:', err.message);
      return null;
    }
  }

  // Vom User verfolgte Nährstoffe
  async function fetchTrackedNutrients(userId) {
    setLoadingTracked(true);
    try {
       const { data, error } = await supabase
        .from('user_nutrients')
        .select('nutrient_id')
        .eq('user_id', userId);

      if (!error && data) {
        setTrackedNutrients(data.map(item => item.nutrient_id));
      }
    } catch (err) {
      console.error('Fehler beim Laden der Benutzer-Nährstoffe:', err.message);
      setTrackedNutrients([]);
    }
    setLoadingTracked(false);
  }

  // Toggle (hinzufügen oder entfernen)
  async function toggleTrackedNutrient(userId, nutrientId) {
    const isTracked = trackedNutrients.includes(nutrientId);
    let updated;

    try {
      if (isTracked) {
        const { error } = await supabase
          .from('user_nutrients')
          .delete()
          .eq('user_id', userId)
          .eq('nutrient_id', nutrientId);

        if (error) throw error;
        updated = trackedNutrients.filter(id => id !== nutrientId);
      } else {
        const { error } = await supabase
          .from('user_nutrients')
          .insert([{ user_id: userId, nutrient_id: nutrientId }]);

        if (error) throw error;
        updated = [...trackedNutrients, nutrientId];
      }
    } catch (err) {
      console.error('Fehler beim Ändern des Nährstoff-Status:', err.message);
      return;
    }

    setTrackedNutrients(updated);
  }

   async function loadTakenToday(userId) {
    const { data, error } = await supabase
      .from("user_nutrient_log")
      .select("nutrient_id, taken")
      .eq("user_id", userId)
      .eq("date", todayStr);

    if (error) {
      console.error("Fehler beim Laden:", error);
      return;
    }

    const statusMap = {};
    data.forEach((row) => {
      statusMap[row.nutrient_id] = row.taken;
    });
    setTakenToday(statusMap);
  }

  async function toggleTaken(userId, nutrientId) {
    const alreadyTaken = takenToday[nutrientId] === true;

    if (alreadyTaken) {
      // Falls wieder abwählen => löschen oder taken=false
      const { error } = await supabase
        .from("user_nutrient_log")
        .delete()
        .eq("user_id", userId)
        .eq("nutrient_id", nutrientId)
        .eq("date", todayStr);

      if (error) {
        console.error("Fehler beim Löschen:", error);
        return;
      }

      setTakenToday((prev) => ({ ...prev, [nutrientId]: false }));
    } else {
      // Falls markieren => einfügen
      const { error } = await supabase.from("user_nutrient_log").insert([
        {
          user_id: user.id,
          nutrient_id: nutrientId,
          date: todayStr,
          taken: true,
        },
      ]);

      if (error) {
        console.error("Fehler beim Einfügen:", error);
        return;
      }

      setTakenToday((prev) => ({ ...prev, [nutrientId]: true }));
    }
  }

  // Neuen Nährstoff erstellen
  async function createNutrient(data) {
    try {
      const { data: newData, error } = await supabase
        .from('nutrients')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      setAllNutrients(prev => [...prev, newData]);
      return newData;
    } catch (err) {
      console.error('Fehler beim Erstellen des Nährstoffs:', err.message);
      return null;
    }
  }

  // Nährstoff löschen
  async function deleteNutrient(id) {
    try {
      const { error } = await supabase
        .from('nutrients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAllNutrients(prev => prev.filter(n => n.id !== id));
      return true;
    } catch (err) {
      console.error('Fehler beim Löschen des Nährstoffs:', err.message);
      return false;
    }
  }

  return (
    <NutrientsContext.Provider
      value={{
        allNutrients,
        fetchAllNutrients,
        fetchNutrientById,
        trackedNutrients,
        fetchTrackedNutrients,
        loadingTracked,
        loadingAll,
        toggleTrackedNutrient,
        takenToday,
        toggleTaken,
        createNutrient,
        deleteNutrient
      }}
    >
      {children}
    </NutrientsContext.Provider>
  );
}
