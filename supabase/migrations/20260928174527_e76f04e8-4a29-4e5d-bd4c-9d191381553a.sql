CREATE TABLE public.hidden_icons (
  key text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hidden_icons TO authenticated;
GRANT ALL ON public.hidden_icons TO service_role;
ALTER TABLE public.hidden_icons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hi read" ON public.hidden_icons FOR SELECT TO authenticated USING (true);
CREATE POLICY "hi gm write" ON public.hidden_icons FOR ALL TO authenticated USING (is_gm(auth.uid())) WITH CHECK (is_gm(auth.uid()));
ALTER PUBLICATION supabase_realtime ADD TABLE public.hidden_icons;