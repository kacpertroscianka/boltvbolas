# 🍬 Everlast Candy War Room — Final Polish (Phase 12)

**Podstawa:** Phase 11, uzupełniona o Phase 12 (Captain Mode, Supplies, After Battle Report) i globalny UX/QA polish.
**World:** Sinistra / Retro Open PvP. **Gildie:** Everlast + Terror Squad (Terrory) vs Mandatory Again.

## Co zostało zmienione

### Globalne powiadomienia na KAŻDEJ podstronie
- `GlobalAlertsProvider` w trwałym `app/layout.tsx` uruchamia **jeden** `useAlertEngine` dla całej aplikacji (wcześniej tylko `/alerts`).
- Podstrona `/alerts` jest teraz **panelem sterowania** tym samym globalnym silnikiem: historia, opcje, dźwięki, filtry i testy.
- Polling startuje tylko przy zweryfikowanej sesji Candy; po przejściu na inną podstronę działa dalej, dopóki aplikacja jest otwarta i włączono alerty w ustawieniach.
- Zatrzymuje powielone równoczesne zapytania. Nakłada mały overlap czasowy, aby nie pominąć wydarzeń o takich samych timestampach.
- Starsze ustawienia z localStorage są łączone z domyślnymi filtrami bez resetowania zapisanych preferencji.
- W nawigacji jest licznik nieprzeczytanych alertów. Na War TV globalne toasty mają wyższy z-index niż ekran telewizji.

### Nawigacja i UX
- Wszystkie wewnętrzne linki z toastów i historii alertów przechodzą przez `next/link`, więc nie resetują globalnego silnika.
- Sidebar/mobile menu używają `aria-current` dla wybranej strony i zamykają menu po zmianie ścieżki.
- Wspólne strony: `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`.
- Powitalny toast nie zasłania powiadomień, nie pojawia się przed odblokowaniem i wyświetla się raz na sesję karty.
- „Sinistra” w headerze nie jest błędnie oznaczona jako potwierdzone połączenie LIVE.

### Stabilność danych
- War TV: `Promise.allSettled` i jawne ostrzeżenia o niepełnych danych zamiast awarii całego odświeżania.
- Analytics, War Verification, War Replay i War Sessions: czytelne ostrzeżenia o niedostępnych danych; zachowanie dostępnych wyników.
- **Nie zmieniono** kanonicznych reguł Last Hit/Participation ani przeliczania wyniku wojny.

### Moduły teamowe Phase 12
- **Captain Mode:** osobny hash hasła/serwerowa sesja kapitana, kontrola API tworzenia/zamykania War Calli i edycji Frag Guarda.
- **Battle Supplies Checklist:** samodzielne deklaracje przygotowania potions, runes, amulet, backpack i TeamSpeak, przypięte do aktywnej zbiórki.
- **After Battle Report:** podsumowanie historycznych zdarzeń z przedziału czasowego zakończonego War Calla. **Nie jest dowodem**, że wszystkie zgony były z tej bitwy.
- Zachowano moduły Phase 9–11: Candy Visitors, Tibia Coins info, Battle Command, Frag Watch, Team Rally, War Call notifier.

## Wymagania Supabase — NIE URUCHOMIONO NA PRODUKCJI

Zanim nowe moduły zaczną zapisywać dane, najpierw sprawdź w Supabase, które migracje **już** są zastosowane. Wykonuj wyłącznie brakujące zmiany na kopii bazy, w kolejności:

1. `20261026110000_character_combat_events.sql` (jeśli brak)
2. `20261026111000_fix_candy_awards_rankings.sql` (jeśli brak)
3. `20261026143000_candy_visitors_presence.sql` (jeśli brak)
4. `20261026170000_battle_command_and_frag_guard.sql`
5. `20261026185000_team_rally_quality.sql`
6. `20261027140000_captain_supplies_after_battle.sql`

Nie odtwarzaj całego katalogu historycznych migracji na działającej produkcji — część zawiera stare importy, konfiguracje i zmiany schematu.

**Sekrety:** `.env` nie jest w paczce. Uzupełnij zmienne w ustawieniach hostingu/Bolt; nigdy nie wrzucaj `.env`, haseł, kluczy `service_role` do GitHub. CANDY_SESSION_SECRET musi odpowiadać konfiguracji bazy zgodnie z wcześniejszymi migracjami. Jeśli był publicznie ujawniony, zaplanuj bezpieczną rotację obu stron.

**Captain:** wygeneruj hash hasła komendą `node scripts/generate-captain-hash.cjs` i dodaj odpowiednio `CAPTAIN_PASSWORD_HASH`, `CAPTAIN_PASSWORD_HASH_EVERLAST` i/lub `CAPTAIN_PASSWORD_HASH_TERRORY` **tylko** na serwerze. Bez tej konfiguracji tryb kapitana pozostaje zablokowany. Nie używaj wspólnego hasła Candy jako hasła kapitana.

## Jak importować do Bolt.new bez ryzyka dla aktualnej strony

Najbardziej przewidywalna ścieżka: **prywatne repo GitHub → import tego repo w Bolt jako NOWY projekt testowy**. Bolt obsługuje dwukierunkową synchronizację z GitHub.

1. Zachowaj działającą stronę i jej kopię. **Nie nadpisuj od razu obecnego projektu Bolt.**
2. Rozpakuj ZIP `everlast-candy-war-room-final-polish-github-ready.zip` — plik `package.json` ma być w katalogu głównym repozytorium.
3. Stwórz **prywatne** repo GitHub, np. `everlast-candy-war-room-test`. Dodaj do repo zawartość rozpakowanego ZIP-a (bez dodatkowego katalogu `project/`).
4. W Bolt.new użyj integracji GitHub i opcji importu istniejącego repozytorium. Utwórz odrębny projekt testowy.
5. Skonfiguruj zmienne środowiskowe prywatnie, połącz tę samą bazę **tylko jeśli rozumiesz skutki testów**; do prób zapisów zalecana jest kopia bazy.
6. Sprawdź `npm ci`, `npm run typecheck`, `npm run lint`, `npm run build`; testy przeglądarkowe z prawdziwymi kontami/sesjami i Supabase.
7. Dopiero po wynikach testów zaplanuj wdrożenie do projektu opublikowanego. Import nowego repo do Bolt **nie oznacza** automatycznej podmiany starego adresu/deploymentu.

Ważne: bezpośrednie przesłanie ZIP-a do czatu w Bolt nie jest udokumentowaną metodą bezpiecznego nadpisania istniejącego projektu. Repozytorium daje historię zmian i możliwość wycofania.

## Lista testów QA po uruchomieniu

- Odblokuj hasłem, przejdź po kolei przez menu desktop/mobile; brak 404, poprawny aktywny link.
- Na `/alerts` włącz Candy Alerts, zostaw otwarte `/` i potem `/enemy-tracker` i `/war-tv`. Testuj nowy **prawdziwy** event level-up/down oraz death. Powiadomienie, dźwięk (po odblokowaniu audio) i historia powinny działać niezależnie od podstrony.
- Otwórz kilka kart: powiadomienia nie powinny się mnożyć, a licznik odwiedzających powinien liczyć jedną sesję jako jednego gościa.
- Przetestuj Captain Mode z poprawnym/błędnym hasłem, zmianę składu, statusy READY / OMW / AFK, Supplies i raport zakończonej akcji.
- Sprawdź rozdzielenie manual unjust i observed last hits, a także etykiety ryzyka oraz przestarzałe wpisy.
- Sprawdź Candy Awards, Analytics, Level Tracker, profile postaci, War Sessions, War Replay, Verification, Watchlist i działanie alertów podczas przejść.
- Przetestuj czas ładowania przy wolnym API / braku Supabase — komunikaty błędów muszą być widoczne, nie fałszywe `0`.
- Sprawdź mobile, klawiaturę, fullscreen War TV, linki do postaci i stopkę `powered by Courier` + donację **Tibia Coins in-game**.

## Potwierdzone testy lokalne w paczce

- `node scripts/preflight-check.cjs`: kontrola istnienia lokalnych importów i stron, połączenia globalnych alertów i wymaganych migracji.
- Parser TypeScript: 114 plików TS/TSX — zero błędów składni.
- Logika Frag Guarda: 12/12 przypadków progów/stale.
- ZIP: kontrola integralności, obecności plików, braku `.env`.

**Nie potwierdzono**: pełny `npm run build`, `npm run typecheck`, `npm run lint`, rzeczywiste testy E2E i migracje na Supabase. Lokalna próba `npm ci --offline` nie mogła pobrać potrzebnych zależności. Nie oznaczaj release'u jako produkcyjnie zweryfikowanego bez tych kroków.
