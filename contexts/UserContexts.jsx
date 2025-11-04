import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { AppState } from 'react-native';
import { useRouter } from 'expo-router';

// Erstelle den Kontext
export const UserContext = createContext({
  user: null,
  authReady: false,
  loading: false,
  login: async () => ({ success: false }),
  logout: async () => ({ success: false }),
})

// Erstelle den User-Provider
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // Lade die Benutzerdaten (inkl. Profil) aus Supabase
  const loadUser = async (session) => {
    if (!session) {
      setUser(null);
      return;
    }
    
    try {
    // Rufe die Profilinformationen ab
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

     if (error) {
      console.error('Error fetching profile:', error.message);
      setUser(session.user);
     } else {
      // Kombiniere die Benutzerdaten und das Profil
       setUser({ ...session.user, profile: profile ?? null })
     }
    } catch (e) {
    console.error('Profile fetch exception:', e)
    setUser(session.user)
   }
  };

  // 1) Initiale Session laden
  useEffect(() => {
    let mounted = true
    let watchdog = setTimeout(() => {
      if (mounted) setAuthReady(true)        // Fallback nach 3.5s
    }, 3500)

    ;(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        await loadUser(session)
      } finally {
        if (mounted) setAuthReady(true)      // Normaler Weg
        clearTimeout(watchdog)
      }
    })()

    return () => { mounted = false; clearTimeout(watchdog) }
  }, [])

  // 2) Auth-Events
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await loadUser(session)
    })
    return () => { sub.subscription?.unsubscribe() }
  }, [])

  // 3) Beim Zurückkommen in den Vordergrund re-checken
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (s) => {
      if (s === 'active') {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          await loadUser(session)
        } catch (e) {
          console.error('AppState getSession failed:', e)
        }
      }
    })
    return () => sub.remove()
  }, [])


  // Login-Funktion
  async function login(email, password) {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { success: false, error: error.message }
      await loadUser(data.session)
      return { success: true }
    } catch (err) {
      return { success: false, error: err?.message ?? 'Unbekannter Fehler' }
    } finally {
      setLoading(false)
    }
  }

  // Logout
  async function logout() {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) return { success: false, error: error.message }
      setUser(null) // falls das Event mal klemmt, sofort visuell raus
      return { success: true }
    } catch (err) {
      return { success: false, error: err?.message ?? 'Unbekannter Fehler' }
    } finally {
      setLoading(false)
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
    <UserContext.Provider value={{ user, login, logout, register, resetPassword, updateUser, uploadProfileImage, updateProfile, deleteProfile, deleteUser, loading, authReady }}>
      {children}
    </UserContext.Provider>
  );
}
