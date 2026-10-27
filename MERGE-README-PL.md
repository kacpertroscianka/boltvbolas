# Everlast Candy War Room — bezpieczne połączenie kodu Bolt + poprawek

**Status:** scalone źródła; poprawność składni TS/TSX sprawdzona; **NIE jest to wdrożenie ani potwierdzony pełny build**.

## Co jest w tej paczce?

- **Bazą** jest `project-bolt-sb1-q3ntwvxl (2).zip` (2026-10-26), a nie starsza kopia projektu.
- Włączono poprawki: częściowe ładowanie Analytics, właściwy kształt `level-guild-leaderboard`, obsługę brakującej postaci, wyszukiwanie zgonów/udziałów w PvP po nicku i nowy profil gracza.
- Dodano **Level & Experience Tracker** (`/level-tracker`), pomocniczy wzór EXP i pozycję w nawigacji.
- Poprawiono wyścig zapytań po zmianie filtrów Candy Awards.
- Dołączono **dwie nowe migracje SQL**, które **nie zostały wykonane** na bazie:
  1. `supabase/migrations/20261026110000_character_combat_events.sql`
  2. `supabase/migrations/20261026111000_fix_candy_awards_rankings.sql`
- Migracja rankingów naprawia także odwołania do `is_enemy_side()` i `is_friendly_side()`, których definicji nie ma w dostępnych migracjach, oraz ogranicza Participation do zidentyfikowanych graczy przeciwnej strony. **Historyczna przynależność gildyjna nie jest potwierdzana** — bieżąca lista gildii może różnić się od dawnej.
- Usunięto z paczki `.env` i zakodowany na stałe sekret w historycznej migracji `20261025131917_create_app_config_table.sql`.

## Bezpieczna kolejność wdrożenia

1. **Nie zastępuj jeszcze działającej produkcji.** Zachowaj oryginalny ZIP Bolt; wykonaj backup bazy, jej schematu, ustawień crona, Edge Functions i środowiskowych sekretów *w prywatnym menedżerze haseł*.
2. Przygotuj osobne środowisko testowe o zgodnym schemacie Supabase, jeżeli masz taką możliwość. **Nie uruchamiaj ponownie wszystkich migracji historycznych ani importów zgonów.**
3. Skonfiguruj wartości lokalne (`.env`) albo sekrety hostingu **poza repozytorium**, korzystając z `.env.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `CANDY_PASSWORD_HASH`, `CANDY_SESSION_SECRET`.
4. Sprawdź zgodność **aktualnego** `CANDY_SESSION_SECRET` z `public.app_config` (`key = 'candy_session_secret'`), zanim przetestujesz API. Oryginalna migracja zawierała rzeczywisty sekret; został z archiwum usunięty, ale nie zmieniło to stanu działającej bazy. **Zaplanuj rotację ujawnionego sekretu jednocześnie w hostingu i bazie**; bez synchronizacji wartości działająca strona może pokazać 0 lub błędy RPC.
5. Na kopii bazy uruchom **tylko nowe** dwie migracje SQL w podanej kolejności (po potwierdzeniu, że bazowe widoki, funkcje i kolumny istnieją). Są to `CREATE OR REPLACE FUNCTION`, bez usuwania rekordów. Zweryfikuj `get_combat_events_for_char` i `get_candy_awards` z prawidłową autoryzacją oraz testem odrzucania nieprawidłowego sekretu.
6. Zainstaluj zależności (`npm ci`), uruchom `npm run typecheck`, `npm run lint`, `npm run build` i `npm run dev`. Te polecenia **nie były wykonywane skutecznie w tym środowisku**, z powodu braku zależności z projektu.
7. Ręcznie przetestuj prawdziwe logowanie hasłem, `/api/data?q=level-guild-leaderboard`, profile postaci (`Deaths`, `Combat`, `Levels & Exp`), **Analytics**, **Candy Awards** (`Last Hit` i `Participation`) i `/level-tracker` na 24 h / 7 d / 30 d.
8. Porównaj wyniki Candy Awards z istniejącymi canonical death events. Sprawdź, że dashboard i jego scoreboard nie uległy zmianie; uruchom też test alertów, synchronizacji oraz War TV.
9. Dopiero po pozytywnych testach wgraj kod na produkcję i wykonaj te same dwie migracje na właściwej bazie, z przygotowanym rollbackiem funkcji SQL, i sprawdź dane po wdrożeniu.

## Ograniczenia, których nie ukrywamy

- **Nie przeprowadzono** end-to-end testu z prawdziwym Supabase ani przeglądarką. Zmienione SQL trzeba zweryfikować na kopii schematu.
- Limit profilu: do 2 000 zgonów i zdarzeń level oraz do 5 000 zdarzeń PvP postaci; UI pokazuje ostrzeżenie o osiągnięciu limitu. **Nie obiecujemy pełnej historii po jego przekroczeniu.**
- Level Tracker ogranicza zdarzenia dla szerokich okresów; wyniki 30-dniowe mogą być częściowe. EXP obliczane jest z levela jako minimalny próg, a nie prawdziwa wartość doświadczenia postaci.
- **Nie dodano** jeszcze licznika Candy Visitors ani komunikatu o darowiznach Tibia Coins. To oddzielne zadania po ustabilizowaniu wdrożenia.
- Dotychczasowe historyczne migracje / ustawienia serwera (w tym cron wyzwalający Edge Functions) nie były automatycznie wykonywane ani przeprojektowywane.
- W projekcie mogą istnieć inne starsze błędy niezwiązane ze scaleniem; ten audyt nie jest kompletnym pentestem.

## Szybki rollback

- Kod: ponownie wdróż niezmieniony oryginalny ZIP z Bolt.new.
- SQL: zachowaj przed wdrożeniem **definicje** aktualnych funkcji `public.get_candy_awards` i (jeśli istniała) `public.get_combat_events_for_char`; w razie regresji odtwórz je według backupu. Nie kasuj tabel z danymi.
- Jeśli zmieniasz sekret, rollback kodu bez spójnego ustawienia sekretu w bazie i hostingu nie przywróci dostępu — zaplanuj też konfigurację sekretów.
