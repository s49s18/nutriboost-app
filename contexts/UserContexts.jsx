import { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // dein Supabase-Client

export const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    // 1. Prüfe, ob User schon eingeloggt ist (Session)
    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getSession();
            setUser(data.session?.user ?? null);
            setLoading(false);
        };

        getSession();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);



    async function login(email, password) {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);

        if (error) {
            return { error: error.message }; // Fehler an UI zurückgeben
        }

        setUser(data.user);
        return { user: data.user };
    }


    // 2. Registrierung mit E-Mail + Passwort + Profil anlegen
    async function register(email, password, firstname, lastname) {
        console.log("Registrierung läuft...");
        setLoading(true);

        try {
          const { data, error } = await supabase.auth.signUp({ email, password });

          if (error) {
             setLoading(false);
             return { success: false, error: error.message };
          }

          // Falls E-Mail-Bestätigung aktiviert ist und kein user zurückkommt
          if (!data.user) {
           setLoading(false);
           return {
              success: false,
              error: null,
              message: 'Bitte bestätige deine E-Mail-Adresse via Link in der Mail.'
            };
          }

          console.log("user:", data.user);

            // Optional: Profil in DB anlegen
            /*
            const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ id: data.user.id, email, firstname, lastname }]);
            if (profileError) {
            return { success: false, error: profileError.message };
            }
            */

          setUser(data.user);
          setLoading(false);  
          return { success: true, user: data.user };

        } catch (err) {
            setLoading(false);
            return { success: false, error: err.message || 'Unbekannter Fehler' };
        }
    }


    async function logout() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.log("Logout error:", error.message);
        } else {
            setUser(null);
            console.log("Logged out");
        }
    }

    return (
        <UserContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </UserContext.Provider>
    );
}