-- Supabase: povolit UPDATE/INSERT pro ingest endpoint
-- Spusť v SQL Editoru jednou

-- metrics: allow upsert
create policy "service upsert metrics" on metrics
  for all using (true) with check (true);

-- countries: allow score updates
create policy "service update countries" on countries
  for update using (true) with check (true);
