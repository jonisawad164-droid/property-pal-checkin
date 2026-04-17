import { supabase } from "@/integrations/supabase/client";

export const signOut = async () => {
  await supabase.auth.signOut();
  window.location.href = "/auth";
};
