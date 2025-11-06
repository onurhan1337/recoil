import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export const USER_QUERY_KEY = ["user"] as const;

export function useUser() {
  return useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  });
}
