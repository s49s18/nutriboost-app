import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../hooks/useUser';
import { format } from 'date-fns';

export const NutrientsContext = createContext();

export function NutrientsProvider({ children }) {
  const { user } = useUser();

  const [allNutrients, setAllNutrients] = useState([]);
  const [trackedNutrients, setTrackedNutrients] = useState([]);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingTracked, setLoadingTracked] = useState(true);
  const [takenToday, setTakenToday] = useState({}); // { nutrient_id: true/false }

  const todayStr = format(new Date(), 'yyyy-MM-dd'); // YYYY-MM-DD


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

  // ------------------ Toggle Taken + Daily Completion ------------------
  async function toggleTaken(userId, nutrientId) {
    const alreadyTaken = takenToday[nutrientId] === true;

    const newTakenToday = { ...takenToday, [nutrientId]: !alreadyTaken };
    setTakenToday(newTakenToday);

    if (!alreadyTaken) {
      const { error } = await supabase.from("user_nutrient_log")
        .insert([{ user_id: userId, nutrient_id: nutrientId, date: todayStr, taken: true }]);

        if (error) {
          console.error("Fehler beim Einfügen:", error);
          return;
        }

      } else {
        await supabase.from("user_nutrient_log")
          .delete()
          .eq("user_id", userId)
          .eq("nutrient_id", nutrientId)
          .eq("date", todayStr);
      }

        //setTakenToday((prev) => ({ ...prev, [nutrientId]: true }));

    await updateDailyCompletion(newTakenToday);
  }


  async function updateDailyCompletion(takenState) {
    // Prüfen, ob heute alle getrackten Nutrients genommen wurden
    if (!user) return;
    const allTakenToday = trackedNutrients.every(id => takenState[id]);

    if (allTakenToday) {
      console.log("Upsert started")
      // Upsert: Tag speichern
      const { error } = await supabase
        .from("user_daily_completion")
        .upsert({ user_id: user.id, date: todayStr }, { onConflict: ["user_id", "date"] });

      if (error) console.error("Fehler beim Upsert Daily Completion:", error);
    } else {
      // Tag löschen, falls nicht mehr alles genommen
      const { error } = await supabase
        .from("user_daily_completion")
        .delete()
        .eq("user_id", user.id)
        .eq("date", todayStr);

      if (error) console.error("Fehler beim Löschen Daily Completion:", error);
    }
  }

  // ------------------ Weekly Streak ------------------
   function getCurrentWeekDates() {
    const today = new Date();
    const day = today.getDay(); // 0=Sun, 1=Mon, ...
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((day + 6) % 7));
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(format(d, 'yyyy-MM-dd'));
    }
    return dates;
  }

  async function loadWeekStreak() {
    if (!user) return [];
    const weekDates = getCurrentWeekDates(); // z.B. ["2025-10-01", ...]

    const { data, error } = await supabase
      .from("user_daily_completion")
      .select("date")
      .eq("user_id", user.id)
      .gte("date", weekDates[0])
      .lte("date", weekDates[6]);

    if (error) {
      console.error("Fehler beim Laden der Streak:", error);
      return [];
    }

    return weekDates.map(d => data.some(entry => entry.date === d)); // Array von true/false
  }

  async function loadCurrentStreak() {
    try {
      if (!user?.id) return 0;

      const { data, error } = await supabase
        .from("user_daily_completion")
        .select("date")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error || !Array.isArray(data)) return 0;

      // 1. Alle Datum-Strings, Duplikate entfernen
      const uniqueDates = [...new Set(
        data
          .map(d => d?.date)
          .filter(Boolean)
      )];

      if (uniqueDates.length === 0) return 0;

      // 2. Heute und gestern als Strings
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      // 3️. Streak Startpunkt
      let streak = 0;
      let currentDate;

      if (uniqueDates.includes(todayStr)) {
        currentDate = todayStr; // heute eingetragen
      } else if (uniqueDates.includes(yesterdayStr)) {
        currentDate = yesterdayStr; // heute noch nichts, starte bei gestern
      } else {
        return 0; // keine Streak aktuell
      }

      // 4️. Streak hochzählen rückwärts
      while (uniqueDates.includes(currentDate)) {
        streak++;
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 1);
        currentDate = d.toISOString().split("T")[0];
      }

      return streak;
    } catch (err) {
      console.error("Fehler beim Laden der Streak:", err);
      return 0;
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
        deleteNutrient,
        loadWeekStreak,
        loadCurrentStreak,
      }}
    >
      {children}
    </NutrientsContext.Provider>
  );
}
