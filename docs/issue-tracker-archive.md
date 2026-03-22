# 📋 Projektový Issue Tracker (Retroaktivní Archiv)

Tento dokument slouží jako oficiální evidence všech úkolů a hlášených chyb v projektu Industrialist. Každý bod technického zadání byl převeden na formální "Issue" s unikátním ID pro sledování v Changelogu.

## 🏗️ Sekce 1: Architektura a Infrastruktura
- **#23 (1.1):** Dokumentace architektury (README)
- **#24 (1.2):** Přehled verzí technologií
- **#25 (1.3):** Adresářová struktura projektu
- **#26 (1.4):** Separace logiky od UI
- **#27 (1.5):** Separace statických souborů
- **#28 (1.6):** Produkční konfigurační šablona (.env.production.example)
- **#29 (1.7):** Ochrana citlivých dat v repozitáři

## 📦 Sekce 2: Závislosti a Balíčky
- **#30 (2.1-2.2):** Správa externích knihoven a verzí
- **#32 (2.3):** Implementace lock souboru (pnpm-lock.yaml)
- **#33 (2.4):** Pravidelné kontroly aktualizací závislostí
- **#34 (2.5):** Dokumentace důvodů pro použití knihoven
- **#35 (2.6):** Audit a odstranění nepoužitých knihoven

## 🌐 Sekce 3: API a Server
- **#33 (3.1):** Správné HTTP status kódy (200, 400, 404, 500)
- **#34 (3.3):** Srozumitelné chybové hlášky pro klienta
- **#35 (3.4):** Maskování interních chyb serveru
- **#36 (3.6):** Validace vstupních dat (Zod)
- **#37 (3.7):** GZIP komprese odpovědí serveru

## ⚡ Sekce 4: Výkon a Formáty
- **#38 (4.1):** Optimalizace velikosti obrázků
- **#39 (4.2):** Převod textur na moderní formát (WebP)
- **#40 (4.3):** Purge nepoužitého CSS/JS
- **#41 (4.5):** Analýza počtu HTTP požadavků
- **#42 (4.6):** Implementace Lazy Loading pro těžké komponenty
- **#43 (4.7):** Konfigurace Vercel CDN (assetPrefix)
- **#44 (4.9):** Lighthouse výkonnostní audit
- **#45 (4.10):** Optimalizace LCP (Largest Contentful Paint)

## 🎨 Sekce 5: Optimalizace a Cache
- **#46 (5.1-5.2):** Cache-Control hlavičky pro statické soubory
- **#47 (5.3):** Verifikace funkčnosti cache
- **#48 (5.4):** Invalidation cache při změně souborů (verzionování)
- **#49 (5.5):** Explicitní konfigurace Edge CDN cache

## ♿ Sekce 6: SEO a Přístupnost
- **#50 (6.3):** Sémantická struktura nadpisů (h1-h3)
- **#51 (6.4):** Alt atributy a aria-labels pro vizuální prvky
- **#52 (6.5):** Responzivní design a mobilní použitelnost

## 🛡️ Sekce 7: Bezpečnost
- **#54 (7.1):** Validace uživatelských vstupů (Auth/Save)
- **#55 (7.2):** Ochrana proti XSS (Sanitizace/CSP)
- **#56 (7.3):** Ochrana proti CSRF (Origin check)
- **#57 (7.5):** Striktní odmítání nevalidních dat (400)
- **#58 (7.6):** Secure a HttpOnly atributy pro session cookies
- **#59 (7.7):** OWASP Top 10 bezpečnostní audit

## 🧪 Sekce 8: Testování
- **#60 (8.1-8.2):** Cross-browser a fyzické mobilní testování
- **#61 (8.3):** Testy nevalidních vstupů (API Rejection)
- **#62 (8.4):** Zátěžové testy (Artillery/K6)
- **#63 (8.5):** Performance testy serveru
- **#64 (8.6):** Evidence chyb v issue trackeru

## 📈 Sekce 9: Monitoring
- **#65 (9.2):** Standardizace formátu logů (Timestamp/Error Type)
- **#66 (9.3):** Integrace nástroje pro analýzu logů (Sentry)
- **#67 (9.4):** Monitoring počtu hráčů a herních metrik
- **#68 (9.6):** Uptime monitoring (website availability)

## 🚀 Sekce 10: Deployment
- **#69 (10.1-10.2):** Produkční deployment a veřejná URL
- **#70 (10.3):** Deaktivace Debug módu v produkci
- **#71 (10.4):** CI/CD deployment procedure (GitHub Workflows)
- **#72 (10.5):** Zero-downtime deployment strategie

## 📂 Sekce 11-12: Management a Retrospektiva
- **#73 (11.1-11.2):** Audit historie commitů a autorství
- **#74 (11.5):** Propojení bug-fixů s commity
- **#75 (12.1-12.7):** Týmová retrospektiva (Team Scrapes)
