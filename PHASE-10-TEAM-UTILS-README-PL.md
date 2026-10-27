# Everlast Candy War Room — Phase 10 Team Utils

## Co zostało dodane

### 1) Candy Battle Command
Nowa strona: `/battle-command`

Funkcje:
- tworzenie jednego aktywnego **War Call** dla teamu,
- szybkie statusy gotowości: **READY / ON MY WAY / AFK**,
- gotowy przycisk **Copy TS call** do skopiowania komunikatu na Discord / TeamSpeak,
- podgląd **Alliance online** (Everlast + Terrory),
- podgląd **Enemy online** (Mandatory Again),
- **team composition** po vocationach,
- lista odpowiedzi teamu na aktywny call,
- lista ostatnich calli.

API / dane:
- `app/api/battle-command/route.ts`
- nowe RPC w Supabase: `get_team_war_calls`, `get_team_war_call_responses`, `create_team_war_call`, `upsert_team_war_call_response`, `end_team_war_call`

### 2) Retro Frag Guard
Nowa strona: `/retro-frag-guard`

Funkcje:
- ręczny tracker unjustów per postać,
- progi dla Retro Open PvP pokazane w UI:
  - 24h: Red 3 / Black 6
  - 7 dni: Red 5 / Black 10
  - 30 dni: Red 10 / Black 20
- jasny podział na:
  - **manual unjust counts**
  - **observed PvP last hits** z war logów,
- tabela ryzyka dla alliance,
- możliwość dodawania / aktualizacji / usuwania wpisów.

API / dane:
- `app/api/frag-guard/route.ts`
- nowe RPC w Supabase: `get_retro_frag_guard_entries`, `upsert_retro_frag_guard_entry`, `delete_retro_frag_guard_entry`

## Nawigacja
Dodałem pozycje:
- `Battle Command`
- `Retro Frag Guard`

## Migracja SQL do odpalenia
Uruchom plik:

`supabase/migrations/20261026170000_battle_command_and_frag_guard.sql`

To doda:
- tabelę `team_war_calls`
- tabelę `team_war_call_responses`
- tabelę `retro_frag_guard_entries`
- wszystkie potrzebne funkcje RPC

## Ważne ograniczenie
TibiaData **nie mówi**, czy kill był justified/unjustified, więc:
- **Frag Guard nie zgaduje skulla na sztywno**,
- observed PvP last hits są tylko **kontekstem**,
- realne unjusty prowadzi się ręcznie w tabeli.

## Gotowe pliki główne
- `app/battle-command/page.tsx`
- `app/retro-frag-guard/page.tsx`
- `app/api/battle-command/route.ts`
- `app/api/frag-guard/route.ts`
- `supabase/migrations/20261026170000_battle_command_and_frag_guard.sql`
- aktualizacja `components/app-shell.tsx`
- aktualizacja `lib/types.ts`
- aktualizacja `lib/queries.ts`
- aktualizacja `app/api/data/route.ts`
