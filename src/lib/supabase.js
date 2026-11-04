import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (
  import.meta.env.VITE_SUPABASE_URL || ""
).trim();

const supabaseKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY || ""
).trim();

const hasInvalidCharacters = (value) => {
  return /[^\x20-\x7E]/.test(value);
};

console.log("Supabase configuration check:", {
  urlExists: Boolean(supabaseUrl),
  keyExists: Boolean(supabaseKey),
  urlHasInvalidCharacters: hasInvalidCharacters(supabaseUrl),
  keyHasInvalidCharacters: hasInvalidCharacters(supabaseKey),
  keyLength: supabaseKey.length,
});

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or API Key is missing.");
}

if (
  hasInvalidCharacters(supabaseUrl) ||
  hasInvalidCharacters(supabaseKey)
) {
  throw new Error("Supabase configuration contains invalid characters.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);