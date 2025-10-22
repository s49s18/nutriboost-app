
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

const SUPABASE_URL = 'https://yekfgrbbsvfimdaokldr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlla2ZncmJic3ZmaW1kYW9rbGRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMTY1ODIsImV4cCI6MjA2OTc5MjU4Mn0.aNgs8wwJhcFPJTWJstMqfoqRmN9Xg8QrBmBdb5KxMcM'
//const supabase = createClient(supabaseUrl, supabaseKey)

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,           
    persistSession: true,           
    autoRefreshToken: true,         
    detectSessionInUrl: false,   
  },
});