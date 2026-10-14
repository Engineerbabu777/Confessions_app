

import "react-native-url-polyfill/auto"


import { createClient } from "@supabase/supabase-js"
import AsyncStorage from "@react-native-async-storage/async-storage"

const supabaseUrl = "https://evbefkbjkaclwtyikmum.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2YmVma2Jqa2FjbHd0eWlrbXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MTI2MDcsImV4cCI6MjEwNzQ4ODYwN30.OlPlFgGNg-ZkXrMZhacK1voqeiREjnU-M_FiLcXBx0w";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})
