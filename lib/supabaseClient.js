
import { createClient } from '@supabase/supabase-js'
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://yekfgrbbsvfimdaokldr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlla2ZncmJic3ZmaW1kYW9rbGRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMTY1ODIsImV4cCI6MjA2OTc5MjU4Mn0.aNgs8wwJhcFPJTWJstMqfoqRmN9Xg8QrBmBdb5KxMcM'
//const supabase = createClient(supabaseUrl, supabaseKey)

export const supabase = createClient(supabaseUrl, supabaseKey);