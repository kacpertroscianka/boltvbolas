# Everlast Candy War Room — odzyskanie konfiguracji i poprawki publikacji

## Co zostało odzyskane

Z oryginalnego eksportu projektu Bolt (`project-bolt-sb1-q3ntwvxl (2).zip`) odzyskano identyczny zestaw czterech zmiennych z `.env`:

- `NEXT_PUBLIC_SUPABASE_URL` — adres istniejącego backendu projektu;
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — publiczny (anon) klucz tego backendu;
- `CANDY_PASSWORD_HASH` — scrypt hash hasła do Candy War Room;
- `CANDY_SESSION_SECRET` — podpisywanie sesji Candy i token używany przez chronione RPC Supabase.

W prywatnym archiwum są umieszczone w **`.env.local` w katalogu głównym projektu**. Nie zostały zmienione. Brak jakiegokolwiek połączenia z nową lub wyczyszczoną bazą.

**Nie publikuj archiwum prywatnego ani `.env.local` w GitHub, nie udostępniaj go innym osobom.** Ten sekret był już w poprzednich eksportach, dlatego po odzyskaniu dostępu zaplanuj jego rotację, aktualizując jednocześnie aplikację i odpowiadającą jej konfigurację `app_config` w bazie. Niezgodny sekret blokuje dostęp do chronionych funkcji.

## Zmiany w kodzie

1. Usunięto wymóg pobierania `next/font/google` w czasie produkcyjnego buildu. Inter jest ładowany jako zwykły arkusz stylów w przeglądarce, a gdy jest niedostępny, działa font systemowy. Wygląd pozostał podobny.
2. `lib/supabase.ts` nie zgłasza już wyjątku podczas importowania strony w środowisku buildu, gdy nie ustawiono `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`. Nie używa fikcyjnych kluczy ani backendu. Uwierzytelnianie użytkownika wymaga prawdziwej konfiguracji.
3. `lib/auth-context.tsx`, `app/watchlist/page.tsx`, `app/character/[name]/page.tsx` obsługują niedostępny backend bez wywracania całego importu.
4. **Nie wykonano żadnej migracji SQL, nie zmieniono danych w bazie, hasła ani zasad wyniku wojny.**

## Jeśli używasz prywatnego ZIP-a

Rozpakuj i uruchom z katalogu zawierającego `package.json`:

```
npm ci
npm run typecheck
npm run lint
npm run build
npm run dev
```

Next.js automatycznie czyta `.env.local` na komputerze. Ta paczka jest wyłącznie do prywatnego importu / lokalnych testów i nie może trafić do publicznego ani prywatnego repozytorium bez usunięcia `.env.local` (bo repo jest również potencjalnym miejscem wycieku sekretów).

## Jeśli importujesz projekt z prywatnego GitHub repo do Bolt

1. Użyj **bezsekretowej** paczki `everlast-candy-war-room-build-fix-github-ready.zip`, bo import przez GitHub przenosi kod, a nie bezpieczne sekrety hostingu.
2. Dla właściwego projektu i hostingu ustaw cztery powyższe zmienne, kopiując ich wartości tylko z prywatnego `.env.local`. Nie wklejaj wartości do chatu Bolt. `NEXT_PUBLIC_*` musi istnieć **przed buildem**. Obie zmienne `CANDY_*` muszą być dostępne wyłącznie dla kodu serwera (nie używaj prefiksu `NEXT_PUBLIC_`).
3. **Nie zakładaj nowej pustej bazy.** Kod ma wskazywać na backend z oryginalnego projektu. Bolt mógł utworzyć i zarządzać bazą automatycznie.
4. Kliknij ponownie Build / Publish i przejrzyj dokładny log buildu. Jeśli wystąpi nowy błąd, potrzebne będą linie z błędem (`Error:`, `Failed to compile`, `Type error`, `ELIFECYCLE`) — nie sam komunikat „Build failed”.
5. Uwaga: nowe moduły Candy Visitors / War Call / Supplies / Frag Guard / Reports wymagają osobnych migracji bazodanowych z README faz 9–12. Nie uruchamiaj ich automatycznie na produkcji ani nie odtwarzaj wszystkich historycznych migracji.
6. Hasła kapitanów `CAPTAIN_PASSWORD_HASH*` nie były obecne w oryginalnym eksporcie; Captain Mode pozostanie niedostępny, dopóki osobno nie skonfigurujesz jego nowych hashy. **Nie zastępuj ich wspólnym hasłem Candy.**

## Ograniczenia przeprowadzonych testów

Sprawdzono składnię 114 plików TS/TSX i 269 importów lokalnych — 0 wykrytych błędów. Przywrócono wszystkie 4 oryginalne zmienne, zweryfikowano ich obecność i format hash/sekret. Pełny `npm ci` / `npm run build` nie mógł być wykonany w tym środowisku: `npm ci --offline` kończy się ENOTCACHED dla brakującego `zod`.

Ostatecznego powodu *konkretnego* błędu publikacji nie da się potwierdzić bez logu z Bolt. W tej paczce poprawiono dwie znane klasy problemów z kompilacją, ale nie jest to gwarancja publikacji.
