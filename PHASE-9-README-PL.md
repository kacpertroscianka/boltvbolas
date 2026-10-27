# Everlast Candy War Room — Phase 9 (bez wdrożenia na Supabase)

## Co zostało dodane w źródłach

1. **Candy Visitors** — miniaturowy widżet w nagłówku aplikacji (nie występuje na ekranie `/unlock` lub `/login`). Pokazuje liczbę **aktywnych, uwierzytelnionych sesji przeglądarki**, nie rzeczywistych unikalnych ludzi. Licznik odświeża się co **25 sekund**, a sesja jest uznawana za aktywną przez **90 sekund** od ostatniego potwierdzenia. Ukryte karty nie wysyłają potwierdzeń. Kilka kart tej samej sesji liczy się jako **jedna**. Brak dostępu do bazy oznacza **„—”**, nie fałszywe zero.
2. **Donate Tibia Coins** — mały przycisk przy `powered by Courier` w globalnej stopce. Otwiera pastelowe okienko z zachętą do dobrowolnego wysyłania **Tibia Coins w grze** na postać **Terror Parcel Courier**, aby wspierać rozwój strony i kolejne funkcje. Można skopiować nick. Nie ma linku płatniczego, zbierania danych konta Tibii ani żadnej integracji z płatnościami.

## Bezpieczeństwo licznika

- `POST /api/presence` najpierw sprawdza podpis i wygaśnięcie istniejącej sesji HttpOnly. Nie przyjmuje identyfikatora użytkownika od przeglądarki.
- Serwer oblicza nieodwracalny **HMAC tokenu sesji**, a do bazy przekazuje wyłącznie tę pseudonimową wartość. Baza nie przechowuje cookies, hasła, nazw postaci ani IP.
- Funkcja Supabase `touch_candy_presence` weryfikuje dotychczasowy sekret przez `verify_candy_secret`, usuwa przeterminowane wpisy i zwraca liczbę aktywnych rekordów.
- Tabela nie jest publicznie dostępna do odczytu/zapisu. Endpoint może się wyłącznie opierać na prawidłowej sesji i istniejącej konfiguracji Supabase.
- Żaden istniejący mechanizm logowania, scoringu, alarmów, synchronizacji czy tabela danych wojennych nie został zmieniony.

## Czego JESZCZE nie wykonano

**Nie uruchamiano migracji ani nie łączono się z produkcyjną bazą.** Potrzebna migracja:

`supabase/migrations/20261026143000_candy_visitors_presence.sql`

Bez niej interfejs działa, a licznik w nagłówku pokazuje „—” (funkcja jest niedostępna). Tak ma być; nie uruchamiaj migracji w ciemno.

Gdy będzie czas na Supabase:

1. Zachowaj backup i sprawdź, że poprawnie działa `public.verify_candy_secret(p_secret)` oraz odpowiadający mu wpis `app_config(key='candy_session_secret')`. **Nie kopiuj sekretu do kodu ani dokumentacji.**
2. Przetestuj migrację na środowisku testowym, potem (po backupie) wykonaj ją w produkcji. Migracja tworzy nową tabelę i nową funkcję RPC; nie usuwa innych rekordów.
3. Z prawidłową sesją otwórz `/api/presence` metodą `POST`. Odpowiedź powinna mieć HTTP 200 i JSON `{ "count": 1, "activeWindowSeconds": 90 }` przy jednej świeżo zalogowanej sesji. Bez autoryzacji ma zwrócić HTTP 401.
4. Sprawdź, że dwie karty z tą samą sesją nadal liczą się jako jedna. Osobna sesja dodaje jeden. Po 90 sekundach bez aktywności wygasa.
5. Potwierdź logowanie, Dashboard, Candy Awards, Candy Alerts i chronione API po migracji.

## Jak sprawdzić kod lokalnie

- Przygotuj własny `.env` w prywatnym środowisku; nie umieszczaj go w repozytorium ani w publicznym archiwum.
- W katalogu `project`: `npm ci`, `npm run typecheck`, `npm run lint`, `npm run build`.
- Uruchom `npm run dev` i sprawdź stopkę, kopiowanie nicku i wygląd telefonu. Realne dane licznika wymagają funkcji Supabase.

W tym pakiecie nie ma `.env` ani danych logowania. Weryfikacja produkcyjna i pełne testy z Supabase **nie są wykonane**.
