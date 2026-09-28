import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/** Small wrapper: run an action, toast errors/success, refresh the table state. */
export function useAct() {
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: async ({ fn }: { fn: () => Promise<unknown>; ok?: string | undefined }) => fn(),
    onSuccess: (_d, v) => {
      if (v.ok) toast.success(v.ok);
      void qc.invalidateQueries({ queryKey: ["rpg-state"] });
      void qc.invalidateQueries({ queryKey: ["rpg-library"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
  return {
    run: (fn: () => Promise<unknown>, ok?: string) => m.mutateAsync({ fn, ok }).catch(() => undefined),
    pending: m.isPending,
  };
}
