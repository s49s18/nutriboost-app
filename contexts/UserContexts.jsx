import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { AppState } from 'react-native';
import { useRouter } from 'expo-router';

// Erstelle den Kontext
export const UserContext = createContext();

// Erstelle den User-Provider
export const UserProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null); // enthält jetzt Auth- und Profil-Daten
  const [loading, setLoading] = useState(true);

  // Lade die Benutzerdaten (inkl. Profil) aus Supabase
  const loadUser = async (session) => {
    if (!session) {
      setUser(null);
      return;
    }
    
    // Rufe die Profilinformationen ab
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      setUser(session.user); // Verwende die Basis-Sitzung, auch wenn das Profil fehlschlägt
      return;
    }

    // Kombiniere die Benutzerdaten und das Profil
    const fullUser = {
      ...session.user,
      profile: profile || null,
    };
    
    setUser(fullUser);
  };

  // Initial Session laden und auf Änderungen reagieren
  useEffect(() => {
    const handleSession = async () => {
      // Lade die initiale Session beim App-Start
      const { data: { session } } = await supabase.auth.getSession();
      await loadUser(session);
      setLoading(false);
    };

    handleSession();

    // Listener für An- und Abmeldungen
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await loadUser(session);
      }
    );

    // Bereinigung des Listeners, wenn die Komponente entfernt wird
    return () => {
     if (subscription) subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async s => {
      if (s === 'active') {
        const { data: { session } } = await supabase.auth.getSession();
        await loadUser(session);
      }
    });
    return () => sub.remove();
  }, []);


  // Login-Funktion
  async function login(email, password) {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }
      
      // Profildaten werden sofort nach erfolgreichem Login geladen
      await loadUser(data.session);
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message || 'Unbekannter Fehler'};
    }
  }

  // Logout
  async function logout() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }
      // Der Zustand wird durch den onAuthStateChange-Listener auf null gesetzt.
      // setLoading hier zu setzen ist unnötig, da der nächste Zustand bereits verarbeitet wird.
      // Fallback: falls onAuthStateChange nicht rechtzeitig reagiert
      setUser(null);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message};
    }
  }

  // Reset Password
  async function resetPassword(email) {
    setLoading(true);
    try {
      const redirectUrl = Linking.createURL('reset-password');
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
      
      setLoading(false);

      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message || 'Unbekannter Fehler' };
    }
  }


  // Update Users Password
  async function updateUser(password) {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message || 'Unbekannter Fehler' };
    }
  }


  // Register
  async function register(email, password, firstname, lastname) {
    setLoading(true);
  
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
  
      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }
  
      if (!data.user) {
        setLoading(false);
        return {
          success: false,
          message: 'Bitte bestätige deine E-Mail-Adresse via Link in der Mail.'
        };
      }
  
      // Profil in Tabelle einfügen
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          firstname,
          lastname
        }]);
  
      if (profileError) {
        setLoading(false);
        console.log(profileError.message);
        return { success: false, error: 'User konte nicht registriert werden.'};
      }
  
      // User-Context setzen
      setUser({
        ...data.user,
        profile: { firstname, lastname }
      });
  
      setLoading(false);
      return { success: true };
  
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message || 'Unbekannter Fehler' };
    }
  } 

  // Bild hochladen
  const uploadProfileImage = async (userId, localUri) => {
    try {
      // Dateiendung bestimmen
        console.log('FileSystem:', FileSystem);
      console.log('EncodingType:', FileSystem.EncodingType);
      
      const fileExt = localUri.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Datei in Base64 lesen
      const base64Data = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Base64 → ArrayBuffer (korrekte Methode für React Native)
      const fileBuffer = decode(base64Data);

      // Datei zu Supabase Storage hochladen
      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      // Öffentliche URL holen
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.error('Upload failed:', err);
      return null;
    }
  };


    // Profil aktualisieren
    const updateProfile = async (updates) => {
      if (!user?.id) return false;

      let updatesWithAvatar = { ...updates };

      if (updates.avatar_url && updates.avatar_url.startsWith('file://')) {
        const uploadedUrl = await uploadProfileImage(user.id, updates.avatar_url);
        if (!uploadedUrl) return false;
        updatesWithAvatar.avatar_url = uploadedUrl;
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updatesWithAvatar)
        .eq('id', user.id)
        .select('*');

      if (error || !data || data.length === 0) return false;

      setUser(prev => ({ ...prev, profile: { ...prev.profile, ...updatesWithAvatar } }));
      return true;
    };




/*   const updateProfile = async ({ firstname, lastname }) => {
    if (!user?.id) {
      console.error("No user ID available");
      return false;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ firstname, lastname })
      .eq('id', user.id)
      .select('*');             // sicherstellen, dass die Daten zurückkommen

    if (error) {
      console.error("Error updating profile:", error);
      return false;
    }

    if (!data || data.length === 0) {
      console.error("Update affected 0 rows - check user ID and table!" + user.id);
      return false;
    }

    // Aktualisiere den Context / State
    setUser(prev => ({ ...prev, profile: { ...prev.profile, firstname, lastname } }));
    return true;
  };
 */
  async function deleteProfile() {
    if (!user) return { success: false, error: 'Kein Benutzer angemeldet' };
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message || 'Unbekannter Fehler' };
    }
  }

  async function deleteUser() {
    if (!user) return { success: false, error: 'Kein Benutzer angemeldet' };
    setLoading(true);
    try {
      const { error } = await supabase.auth.deleteUser();

      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      setUser(null);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message || 'Unbekannter Fehler' };
    }
  }

  return (
    <UserContext.Provider value={{ user, login, logout, register, resetPassword, updateUser, uploadProfileImage, updateProfile, deleteProfile, deleteUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}
