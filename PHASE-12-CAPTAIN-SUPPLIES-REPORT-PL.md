# Phase 12 — Captain Mode, Battle Supplies, After Battle Report

Źródło: **Phase 11**, bez resetowania istniejących funkcji, bazy i logowania.

## Nowe funkcje

1. **Captain Mode** — oddzielne hasła serwerowe dla Everlast, Terrory i/lub Owner. Kapitan musi się osobno zalogować. Backend, a nie sam UI, wymaga captain cookie przy tworzeniu/kończeniu War Calla oraz edycji/usuwaniu Frag Guarda. Sesja kapitana jest podpisana HMAC, HttpOnly, SameSite=Lax, trwa maks. 8 godzin. Wylogowanie ze strony usuwa captain cookie. Uwaga: są to role współdzielone hasłami, a nie indywidualne konta z audytem działań. Limit prób logowania w pamięci działa tylko dla danego procesu; na produkcji ustaw też rate limiting na hostingu/WAF.
2. **Battle Supplies Checklist** — przy aktywnym War Callu: potions, runes, amulets, backpack/bless, TeamSpeak. Każdy zalogowany hasłem Candy może zgłosić przygotowanie swojej wybranej postaci po wcześniejszym READY/OMW/AFK. Wszystko jest **deklaratywne**, nie czyta ekwipunku z gry. Status i notatka współdzielone przez bazę.
3. **After Battle Report** — po zakończeniu War Calla raport z kanonicznych zdarzeń Tibii w czasie od startu do `ended_at`. Potwierdzone/inferred last hity obu stron, zgony, PvE, ostatnie maks. 30 zdarzeń. **Dopasowanie wyłącznie czasowe, NIE zweryfikowana przynależność killów do akcji.** Starsze zakończone akcje bez `ended_at` wyświetlają niedostępność, zamiast zgadywania.

## Przed wdrożeniem

- Backup obecnego projektu Bolt + Supabase; najpierw kopia robocza.
- Zachowaj dotychczasowe zmienne środowiskowe i bazę; w ZIP-ie nie ma `.env`.
- Wdróż tylko brakujące migracje **w kolejności**:
  - `20261026170000_battle_command_and_frag_guard.sql` (Phase 10)
  - `20261026185000_team_rally_quality.sql` (Phase 11)
  - `20261027140000_captain_supplies_after_battle.sql` (Phase 12)
- Jeżeli starsze migracje były już uruchomione, nie odtwarzaj ich w ciemno. Stan produkcyjnego schematu trzeba porównać z migracjami przed uruchomieniem.
- Potrzebne mogą być też brakujące migracje z wcześniejszych etapów Phase 9; w szczególności licznik Candy Visitors wymaga własnej migracji.

## Konfiguracja Captain Mode (tylko na serwerze!)

W Terminalu lokalnym lub Bolt Code/Terminal, w folderze projektu:

`node scripts/generate-captain-hash.cjs`

Wybierz osobne, długie hasło (min. 12 znaków). Generator wypisze jedynie wartość zaczynającą się od `scrypt:`. Uruchom osobno dla każdego kapitana i ustaw w prywatnych zmiennych środowiskowych hostingu (NIE w repo ani w pliku udostępnianym publicznie):

- `CAPTAIN_PASSWORD_HASH_EVERLAST` — kapitan Everlast
- `CAPTAIN_PASSWORD_HASH_TERRORY` — kapitan Terrorów
- `CAPTAIN_PASSWORD_HASH` — opcjonalny Owner

**Nie zmieniaj `CANDY_SESSION_SECRET` bez planowej wymiany po stronie Supabase; Phase 12 wykorzystuje go tylko do podpisania *oddzielnego* captain cookie.** Zostaw oryginalną bramkę Candy w spokoju. Nie dawaj tym zmiennym prefiksu `NEXT_PUBLIC_`.

## Użytkowanie

1. Kapitan odblokowuje panel Captain Mode na `/battle-command` albo `/retro-frag-guard`.
2. Tworzy War Call.
3. Każdy członek teamu wybiera postać, oznacza READY/OMW/AFK, a potem uzupełnia checklistę Battle Supplies.
4. Kapitan kończy War Call.
5. W `Recent calls` wybierz `View battle report` — raport jest dostępny, gdy w Supabase zapisano `ended_at`.

## Ograniczenia, o których trzeba pamiętać

- Przy wspólnym haśle Candy aplikacja nadal **nie weryfikuje własności wybranej postaci**; READY i ekwipunek to samodzielne deklaracje. Oddzielny password kapitana kontroluje *administrację*, nie potwierdza tożsamości wszystkich graczy.
- NOWE RPC wymaga prawidłowego `CANDY_SESSION_SECRET`, zgodnego z obecną bazą. Nie udostępniaj go przeglądarce.
- Skulle pozostają ręcznie śledzone; last hity to nie unjusty.
- Nie testowano tych migracji na Twojej produkcyjnej bazie i nie wykonano pełnego buildu z zależnościami. Konieczne `npm run typecheck`, `npm run lint`, `npm run build` w środowisku ze zainstalowanymi paczkami i test w przeglądarce.
- War Call notifications działają tylko, gdy strona jest otwarta; Phase 12 nie dokłada web push po jej zamknięciu.

## Jak wgrać do obecnego projektu Bolt.new

**Najbezpieczniej: przez prywatne repo GitHub połączone z AKTUALNYM projektem Bolt.**

1. W aktualnej aplikacji Bolt kliknij nazwę projektu → **Duplicate** (kopię testową) lub **Export → Download** (backup).
2. Jeśli projekt jest już podłączony do prywatnego repo GitHub, użyj istniejącego repo. Jeśli nie — w Bolt podłącz GitHub przez ikonę GitHub; repo ustaw jako **Private**. Nie twórz nowej, pustej bazy danych zamiast istniejącej.
3. W GitHub Desktop sklonuj to repo; rozpakuj `everlast-candy-war-room-phase-12.zip`; **skopiuj zawartość folderu `project/`, a nie sam folder `project`**, do katalogu sklonowanego repo, zachowując katalog `.git` i lokalne sekrety. Alternatywnie skopiuj tylko pliki z ZIP `phase-12-only-changes.zip` do repo (folder `project/` odpowiada root repo).
4. Zobacz listę zmian `git diff`, potem Commit i Push. W Bolt sprawdź, czy istniejący projekt pobrał nowy commit; jeśli Twoja integracja nie synchronizuje zmian z zewnątrz, skorzystaj z jej aktualnego sposobu importu/synchronizacji lub popraw pliki ręcznie w Code view.
5. Przygotuj prywatne `CAPTAIN_PASSWORD_HASH_*` w konfiguracji serwera.
6. Dopiero po kopii bazy uruchom brakujące migracje SQL w Supabase, **jedną po drugiej**.
7. Sprawdź kolejno: logowanie Candy → zwykły użytkownik nie może utworzyć calla → captain może → READY → Supplies → End Call → Report → Frag Guard → reszta strony (scoreboard/alerts/Candy Awards).
8. Publikuj dopiero gdy przejdą testy. Nie nadpisuj na ślepo działającego projektu ZIP-em i nie wrzucaj `.env` do GitHuba.

**Nie zakładaj, że wrzucenie ZIP-a jako załącznika na czacie Bolt automatycznie podmieni pliki aplikacji.**
