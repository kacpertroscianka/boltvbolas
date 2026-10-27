# Everlast Candy War Room — Phase 11: powiadomienia, gotowość teamu, Frag Watch

## Dodane funkcje

### 1. Powiadomienia o War Callach

- Nowy niewielki przełącznik `War Call ON/OFF` w górnym pasku aplikacji.
- Po świadomym włączeniu: sprawdzanie **aktywnego War Calla co 12 sekund**, powiadomienie systemowe przeglądarki (jeśli użytkownik zezwolił), toast w aplikacji i sygnał dźwiękowy (jeśli przeglądarka pozwoliła na audio).
- Po odświeżeniu można ponownie uaktywnić dźwięk ikonką głośnika — ograniczenia autoplay są narzucane przez przeglądarkę.
- Próbujemy ograniczać powtórne alerty między kartami poprzez `localStorage` i krótki lock. To rozwiązanie best-effort, nie gwarancja idealnie pojedynczego powiadomienia w bardzo specyficznych warunkach wyścigu.
- **Ważne:** to powiadomienia przeglądarkowe **gdy aplikacja jest otwarta** (karta w tle może być opóźniana przez system). To nie jest natywny Web Push działający przy całkowicie zamkniętej stronie. Ten wymaga osobnego service workera, bazy subskrypcji i VAPID.
- Nowy endpoint RPC `get_active_team_war_call` zwraca maksymalnie jeden rekord zamiast całej historii co 12 s.

### 2. Automatyczny Frag Watch

- Nowa analiza ręcznie zgłoszonych unjustów z progami Retro Open PvP:
  - **RED** 3/24h, 5/7d, 10/30d,
  - **BLACK** 6/24h, 10/7d, 20/30d.
- Kategoria `NEAR RED` i `NEAR BLACK`, gdy zgłoszony wynik jest dokładnie o 1 niższy od odpowiedniego progu.
- `CHECK MANUALLY`, gdy ostatnia ręczna aktualizacja ma ponad 24 h i nie ma już wyższego ostrzeżenia.
- Automatyczne sortowanie ryzykownych postaci na górze `Retro Frag Guard` oraz mały pasek ostrzeżeń na stronie `Battle Command`.
- **Te wartości są tylko ręczne i nie są potwierdzeniem rzeczywistego skulla ani liczby unjustified kills z Tibii.**
- Zmieniono liczenie obserwowanych last hitów na pełną agregację 30-dniową w Supabase (zamiast pobierania i ucinania do ostatnich 5000 eventów).

### 3. Mini panel teamu na dashboardzie

- `Team Rally`: Alliance online, Enemy online, READY/OMW, aktywny War Call i do 12 nicków online z profesjami.
- Wykorzystuje **ten sam zestaw OnlineSummary**, który jest już pobierany przez dashboard; nie odpytuje TibiaData dodatkowo.
- Część związaną z War Callem odświeża co 30 s podczas aktywnej karty.
- Brak odpowiedzi z backendu to `—`, nie wymyślone `0`.

### Dodatkowe poprawki

- Wprowadzono bezpieczne generowanie anonimowego identyfikatora przeglądarki (`crypto.randomUUID`) dla statusu gotowości.
- Czas zbiórki wpisywany lokalnie jest przesyłany do API jako jednoznaczny ISO UTC; wyświetla się w lokalnej strefie czasowej użytkownika.
- RPC weryfikuje, że zgłaszana postać należy aktualnie do Everlast lub Terrory, a zgłoszenie dotyczy aktywnego calla. Nadal **nie weryfikuje, kto fizycznie steruje danym nickiem**.
- Żadnej zmiany historycznych deathów, scoreboardu, synchronizacji ani autoryzacji sesji.

## Migracje SQL — NIE URUCHAMIAĆ W CIEMNO NA PRODUKCJI

W kolejności (po potwierdzeniu backupu i na bazie testowej):

1. `supabase/migrations/20261026170000_battle_command_and_frag_guard.sql` (z Phase 10; jeśli już wykonana, NIE wykonywać ponownie bez sprawdzenia)
2. `supabase/migrations/20261026185000_team_rally_quality.sql` (Phase 11; dodaje nowe RPC i walidację statusów)

Jeśli korzystasz z migracji Phase 9 (licznik Candy Visitors), również wymagają one osobnego wdrożenia. Brak nowych RPC będzie pokazywany w UI jako brak dostępności, a nie licznik zero.

## Testy i ograniczenia

- ✅ Syntaktycznie sprawdzono 110 plików TypeScript/TSX, 0 błędów parsera.
- ✅ 12 testów przypadków dla progów/świeżości fragów.
- ✅ W archiwum nie ma `.env` ani innych celowo pakowanych sekretów.
- ⚠️ Nie udało się wykonać `npm ci` offline (brak pakietu `zod` w cache), więc pełny typecheck/build NIE są potwierdzone.
- ⚠️ Nie testowano z produkcyjnym Supabase ani w przeglądarce po wdrożeniu.
- ⚠️ Wspólne hasło aplikacji nie definiuje osobnych ról kapitana; obecnie każdy znający hasło ma potencjalnie dostęp do funkcji operacyjnych, łącznie z edycją Frag Guard. Zalecane wprowadzenie Captain/Admin Role przed szerokim udostępnieniem teamowi.

## Testy do wykonania po podłączeniu Supabase

1. Logowanie poprawnym hasłem, brak dostępu do API bez sesji.
2. Jedna aktywna zbiórka: utworzenie, zmiana statusów, zakończenie.
3. Powiadomienie przy utworzeniu nowej zbiórki z innej przeglądarki (i test braku powiadomienia o starej zbiórce).
4. Po opt-in powiadomienie z dźwiękiem, in-app toast, odświeżenie w tle.
5. Kilka otwartych kart tej samej przeglądarki nie powoduje kilku zgłoszeń statusu.
6. Ostrzeżenia 2/3, 3/3, 5/6, 6/6 w 24h oraz 7-/30-dniowe analogiczne.
7. `stale` na wpisie starszym niż 24 h.
8. Agregat 30-dniowy na pełnej bazie zgadza się z SQL, nie jest limitowany do 5000.
9. Dashboard nadal wyświetla prawdziwy war score, alerty i gildie.

## Co dalej?

Najważniejszy kolejny etap: **Captain permissions** (osobne uprawnienia do tworzenia/kończenia calli i zmiany fragów), a potem prawdziwy **Web Push** z workerem i VAPID dla całkowicie zamkniętej strony.
