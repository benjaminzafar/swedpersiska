# SwedPersiska (سوئد پرشیا)

En modern, tvåspråkig (Svenska & فارسی) marknadsplats och mötesplats för den persiska och iranska gemenskapen i Sverige. Byggd med modern React 19, Vite, Tailwind CSS, Lucide Icons och Supabase.

---

## 🌟 Huvudfunktioner

1. **Bilingual Upplevelse (Svenska / فارسی)**:
   - Direkt växling mellan svenska och persiska (med dynamisk LTR/RTL layout).
   - Skräddarsydd persisk typografi med Google Font `Vazirmatn`.

2. **Kategorier för persers vardag i Sverige**:
   - 🏠 **Bostad & Rum (مسکن و اجاره)**: Lägenheter, andrahand, rum i Stockholm, Göteborg, Malmö etc.
   - 🥘 **Restauranger & Mat (رستوران و مواد غذایی)**: Kolgrill, kebab, persiska bagerier (Sangak/Barbari) och matbutiker.
   - ⚖️ **Tjänster & Tolk (خدمات، دارالترجمه و حقوقی)**: Auktoriserade översättare, tolkar, jurister och rådgivare.
   - 💼 **Jobb & Karriär (کار و استخدام)**: Jobbannonser och rekrytering.
   - 🛍️ **Köp & Sälj (خرید و فروش)**: Persiska mattor, möbler, elektronik, böcker.
   - 🚗 **Fordon (خودرو)**.
   - 🎉 **Evenemang & Förening (رویدادها و جشن‌ها)**: Nowruz, Yalda, konserter.

3. **Referensnummer & PIN för Annonsörer**:
   - När en användare lägger upp en annons genereras ett unikt **Referensnummer** (t.ex. `SP-2611-B891`) och en **4-siffrig PIN-kod**.
   - Under fliken **"Hantera min annons"** kan användaren ange referensnummer + PIN för att:
     - Se visningsstatistik
     - Redigera uppgifter
     - **Permanent ta bort sin annons** direkt från databasen när den är såld/uthyrd.

4. **Direkta Kontaktvägar**:
   - Snabbknappar för Ring, WhatsApp, Telegram och E-post direkt i annonsvyn.

5. **Astryx Dark Luxury Adminpanel**:
   - Modern mörk panel i NT360 / CCTV-BUSINESS-stil (`#11141a`).
   - Nyckeltal (KPI:er), annonshantering med VIP-toggle, dölj/aktivera och permanent radering.
   - Telegram Bot & Chat ID-konfiguration för automatiserade notiser vid nya annonser.
   - Standardlösenord: `admin`.

---

## 🚀 Kom igång

### 1. Starta utvecklingsservern
```bash
cd C:\Users\sadeq\Desktop\swedpersiska
npm run dev
```

### 2. Bygg för produktion
```bash
npm run build
```

---

## 🗄️ Databas (Supabase)

Tabellerna är färdigskapade och anslutna till Supabase:
- `public.swedpersiska_ads`: Annonser med referensnummer, PIN, kategorier, städer, kontaktvägar och foton.
- `public.swedpersiska_settings`: Admin- och Telegram-inställningar.
