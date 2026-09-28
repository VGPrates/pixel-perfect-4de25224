import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getLibrary, getMyState } from "./api";
import { fetchCustomIcons } from "./icons";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isPending, setPending] = useState(true);
  useEffect(() => {
    if (false) {
      setPending(false);
      return;
    }
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setPending(false);
    });
    void supabase.auth.getSession().then(({ data: d }) => {
      setSession(d.session);
      setPending(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return { session, user: session?.user ?? null, isPending };
}

export function useRpgState(enabled = true) {
  return useQuery({ queryKey: ["rpg-state"], queryFn: getMyState, enabled });
}

export function useLibrary() {
  return useQuery({ queryKey: ["rpg-library"], queryFn: getLibrary });
}

/** Loads the GM's imported icons into the shared icon registry. */
export function useCustomIcons() {
  return useQuery({ queryKey: ["custom-icons"], queryFn: fetchCustomIcons });
}

/** Live sync: any change at the table refreshes everyone's view. */
export function useTableSync() {
  const qc = useQueryClient();
  useEffect(() => {
    let t: number | undefined;
    const refresh = (key: string) => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        void qc.invalidateQueries({ queryKey: ["rpg-state"] });
        if (key === "lib") void qc.invalidateQueries({ queryKey: ["rpg-library"] });
      }, 120);
    };
    const channel = supabase.channel("mesa-sync");
    for (const table of ["characters", "inventory_items", "character_effects", "character_conditions", "profiles"]) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => refresh("state"));
    }
    for (const table of ["equipment", "effects", "conditions"]) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => refresh("lib"));
    }
    channel.subscribe();
    return () => {
      window.clearTimeout(t);
      void supabase.removeChannel(channel);
    };
  }, [qc]);
}
