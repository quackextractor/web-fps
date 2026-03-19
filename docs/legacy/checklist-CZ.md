# Project Checklist CZ

## 1. Architecture

* [ ] 1.1 Repo obsahuje README s popisem architektury aplikace (frontend, backend, databáze).
* [ ] 1.2 Repo obsahuje přehled použitých technologií a jejich verzí.
* [ ] 1.3 Projekt má jasnou strukturu složek (např. src, public, assets, components, api).
* [ ] 1.4 Logika aplikace je oddělena od uživatelského rozhraní.
* [ ] 1.5 Statické soubory (obrázky, CSS, JS) jsou odděleny od aplikační logiky.
* [ ] 1.6 Projekt obsahuje konfigurační soubor pro produkční prostředí.
* [ ] 1.7 Citlivé údaje (hesla, API klíče) nejsou uloženy v repozitáři.

## 2. Dependencies

* [ ] 2.1 Projekt obsahuje seznam všech externích knihoven a jejich verzí.
* [ ] 2.2 Všechny závislosti jsou instalovány pomocí správce balíčků (např. npm, pip).
* [ ] 2.3 Repo obsahuje lock soubor (např. package-lock.json).
* [ ] 2.4 Tým pravidelně kontroluje aktualizace závislostí.
* [ ] 2.5 Tým eviduje důvod použití každé externí knihovny.
* [ ] 2.6 Z projektu byly odstraněny nepoužívané knihovny.

## 3. API

* [ ] 3.1 Server vrací správné HTTP status kódy (200, 400, 404, 500).
* [ ] 3.2 API endpointy jsou dokumentované.
* [ ] 3.3 Neplatné požadavky vracejí srozumitelnou chybu.
* [ ] 3.4 Server nevrací interní chybové informace uživateli.
* [ ] 3.5 Server správně nastavuje Content-Type odpovědi.
* [ ] 3.6 API validuje vstupní data.
* [ ] 3.7 Velké odpovědi serveru jsou komprimovány (GZIP).

## 4. Performance

* [ ] 4.1 Obrázky jsou optimalizované a mají přiměřenou velikost.
* [ ] 4.2 Obrázky používají moderní formáty (např. WebP).
* [ ] 4.3 Nepoužívané CSS a JavaScript byly odstraněny.
* [ ] 4.4 JavaScript a CSS soubory jsou minifikované.
* [ ] 4.5 Počet HTTP requestů při načtení stránky byl analyzován.
* [ ] 4.6 Velké soubory jsou načítány až při potřebě (lazy loading).
* [ ] 4.7 Statické soubory jsou distribuovány přes CDN (Content Delivery Network).
* [ ] 4.8 Server používá kompresi přenášených dat.
* [ ] 4.9 Bylo provedeno měření výkonu pomocí nástroje Lighthouse.
* [ ] 4.10 Největší prvek stránky byl optimalizován pro rychlé načtení (LCP - Largest Contentful Paint).

## 5. Optimalization

* [ ] 5.1 Statické soubory mají nastavené HTTP hlavičky Cache-Control.
* [ ] 5.2 Cache je nastavena pro obrázky, CSS a JavaScript.
* [ ] 5.3 Tým ověřil funkčnost cache.
* [ ] 5.4 Při změně souborů dochází k invalidaci cache.
* [ ] 5.5 CDN cache je správně nastavena pro statické soubory.

## 6. SEO & Accesibility

* [ ] 6.1 Stránka má nastavený title.
* [ ] 6.2 Stránka má meta description.
* [ ] 6.3 Stránka používá správnou strukturu nadpisů.
* [ ] 6.4 Obrázky mají atribut alt.
* [ ] 6.5 Stránka je použitelná na mobilních zařízeních.

## 7. Security

* [ ] 7.1 Všechny vstupy uživatele jsou validovány.
* [ ] 7.2 Aplikace je chráněna proti XSS (Cross Site Scripting).
* [ ] 7.3 Aplikace je chráněna proti CSRF (Cross Site Request Forgery).
* [ ] 7.4 Databázové dotazy používají parametrizované dotazy.
* [ ] 7.5 Server nepřijímá neplatná nebo neúplná data.
* [ ] 7.6 Cookies mají nastavené atributy Secure a HttpOnly.
* [ ] 7.7 Byla provedena kontrola podle OWASP Top 10.

## 8. Testing

* [ ] 8.1 Aplikace byla otestována v několika prohlížečích.
* [ ] 8.2 Aplikace byla otestována na mobilním zařízení.
* [ ] 8.3 Byl proveden test neplatných vstupů.
* [ ] 8.4 Byl proveden test více současných hráčů.
* [ ] 8.5 Byl proveden základní výkonový test serveru.
* [ ] 8.6 Nalezené chyby byly zaznamenány do issue trackeru.

## 9. Monitoring

* [ ] 9.1 Aplikace zapisuje chyby do logu.
* [ ] 9.2 Logy obsahují čas chyby a typ chyby.
* [ ] 9.3 Logy jsou dostupné týmu pro analýzu.
* [ ] 9.4 Tým sleduje počet hráčů a her.
* [ ] 9.5 Je nasazen nástroj pro analytiku návštěvnosti.
* [ ] 9.6 Je použit nástroj pro kontrolu dostupnosti webu (uptime monitoring).

## 10. Deployment

* [ ] 10.1 Aplikace je nasazena na veřejném serveru.
* [ ] 10.2 Aplikace má veřejnou URL.
* [ ] 10.3 Produkční verze běží bez debug režimu.
* [ ] 10.4 Tým má připravený postup nasazení nové verze aplikace.
* [ ] 10.5 Opravy chyb lze nasadit bez výpadku aplikace.

## 11. Management

* [ ] 11.1 Repo obsahuje historii commitů všech členů týmu.
* [ ] 11.2 Každá změna kódu je přiřazena konkrétnímu autorovi.
* [ ] 11.3 Tým používá issue tracker pro evidenci úkolů a chyb.
* [ ] 11.4 CHANGELOG.md obsahuje záznamy práce jednotlivých členů týmu.
* [ ] 11.5 Každá oprava chyby je propojena s konkrétním commitem.

## 12. Team Scrapes

* [ ] 12.1 Merge konflikt vznikl v poslední minutě a nikdo nevěděl proč.
* [ ] 12.2 Nějaký commit zmizel a tým strávil čas jeho hledáním.
* [ ] 12.3 Některý člen změnil konfiguraci a ostatní museli řešit nefunkční build.
* [ ] 12.4 Pull request prošel review, ale při nasazení něco přestalo fungovat.
* [ ] 12.5 Projekt obsahoval „malou změnu“, která rozbila více částí aplikace.
* [ ] 12.6 Každý znal řešení problému jen ve svém lokálním prostředí.
* [ ] 12.7 Tým zjistil, že komunikace je stejně důležitá jako kód.