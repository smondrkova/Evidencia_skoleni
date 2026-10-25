# Ciele a návrh aplikácie

## Hlavné ciele a priority prvej verzie

Cieľom je v rozsahu 3–4 hodín pripraviť použiteľný základ: **prehľad stavu povinných školení a jednoduché odporúčanie termínov**. Úspešná prvá verzia umožní kolegovi odpovedať: „Kto potrebuje aké školenie a na ktorý dostupný termín ho odporúčame?“

### Priorita 1: Základný prehľad

- Tabuľka zamestnancov s útvarom a stavom pracovného pomeru; stavy jednotlivých školení sa zobrazujú v detaile zamestnanca.
- Rozlíšenie stavov: **platné, čoskoro expiruje, expirované, chýba, neisté údaje**.
- Vyhľadávanie podľa mena a filtrovanie podľa útvaru a problémového stavu.
- Jednoduchý detail alebo rozbalenie zamestnanca so zoznamom jeho školení.
- Viditeľný dátum vyhodnotenia **1. 10. 2026**.

### Priorita 2: Odporúčanie termínov

- Pre chýbajúce, expirované alebo čoskoro expirujúce školenia odporučiť vhodný termín.
- Rešpektovať zostávajúcu kapacitu a uprednostniť naliehavé prípady.
- Predchádzať časovým kolíziám navrhnutých účastí jedného zamestnanca.
- Zobraziť dôvod odporúčania alebo vysvetliť, prečo vhodný termín chýba.
- Výstup zobraziť v jednoduchej tabuľke: zamestnanec, školenie, dôvod a odporúčaný termín.
- Jasne uviesť, že ide o návrh na kontrolu, pretože export neobsahuje zoznam už prihlásených osôb.

### Nevyhnutný základ a odovzdanie

- Spoľahlivo spracovať CSV: odstrániť pomocné riadky a úplné duplicity, zjednotiť jednoznačné varianty hodnôt a označiť nejasnosti.
- Pochybné údaje nesmú vytvoriť falošný dojem platného školenia.
- Vynechať rodné čísla z aplikačných dát.
- Aplikáciu nasadiť a odovzdať odkaz na aplikáciu aj GitHub repozitár.
- Pripraviť stručný README, text k riešeniu do jednej strany a pravdivý záznam použitia AI.

Nasledujúci návrh architektúry podporuje tieto priority.

## Základný prístup

Odporúčaná architektúra je **statická webová aplikácia s oddelenou logikou spracovania dát a plánovania školení**.

Technológie sú **React + TypeScript**, zostavenie cez **Vite**.

## Tok dát

```text
Pôvodné CSV
    ↓
Import a validácia pri zostavení aplikácie
    ↓
Normalizované JSON dáta + zoznam problémov
    ↓
Doménová logika v TypeScripte
    ↓
Webové rozhranie
```

## 1. Import dát ako samostatný krok

CSV sa spracujú pred zostavením aplikácie. Importér zabezpečí:

- správne kódovanie a oddeľovače,
- odstránenie pomocných riadkov a úplných duplicít,
- normalizáciu dátumov, útvarov, cien a jednoznačných variantov kódov,
- evidenciu konfliktov a nejasných údajov,
- vynechanie rodných čísel a nepotrebných poznámok.

Výstupom budú normalizované dáta a report problémov. Pri každom probléme zostane odkaz na súbor a zdrojový záznam.

Neisté údaje importér automaticky neopraví. Napríklad `BOZP-X` zostane na kontrolu. Podrobné zistenia o zdrojových dátach sú v [data_notes.md](data_notes.md).

## 2. Doménová logika nezávislá od rozhrania

Samostatné funkcie budú riešiť:

| Oblasť | Zodpovednosť |
| --- | --- |
| Povinnosti | Aké školenia má zamestnanec absolvovať podľa útvaru a pozície |
| Platnosť | Či je školenie platné, expirované, chýba alebo je výsledok neistý |
| Priority | Čo treba riešiť najskôr |
| Plánovanie | Ktorý použiteľný termín odporučiť a prečo |

Všetky výpočty budú prijímať **referenčný dátum ako parameter**. Predvolene to bude **1. 10. 2026**, teda dátum exportu. Výsledky tak budú opakovateľné a testovateľné.

## 3. Jednoduchý a vysvetliteľný plánovač

Plánovač použije deterministický algoritmus:

1. Vytvorí požiadavky na povinné školenia.
2. Zoradí ich: chýbajúce a expirované, potom podľa blížiacej sa expirácie.
3. Vyhľadá najskorší vhodný termín s voľnou kapacitou.
4. Pri každom pridelení zníži zostávajúcu kapacitu a skontroluje kolízie ostatných navrhnutých účastí.
5. Ak vhodný termín nenájde, uvedie konkrétny dôvod.

Pri platnom školení sa pokúsi nájsť termín pred expiráciou. Ak existuje iba neskorší termín, upozorní na vzniknutú medzeru v platnosti.

Návrh vždy vysvetlí dôvod odporúčania, napríklad: „Platnosť končí 20. 11., odporúčaný termín 11. 11.“

Keďže export neobsahuje mená prihlásených, výsledok musí byť označený ako **návrh na kontrolu**, nie uskutočnená registrácia.

## 4. Rozhranie prvej verzie

- **Prehľad zamestnancov:** tabuľka, vyhľadávanie, filtre podľa útvaru a problémového stavu, rozbaliteľný detail školení.
- **Odporúčané termíny:** tabuľka návrhov s dôvodmi a požiadavkami, pre ktoré chýba vhodný termín.

Problémy ovplyvňujúce výsledok sa zobrazia pri príslušných údajoch. Samostatný dashboard, filter podľa vedúceho a obrazovka kvality dát sú možné rozšírenia nad rámec prvej verzie.

Zvolený referenčný dátum a pôvod dát majú byť viditeľné.

## 5. Organizácia kódu a testovanie

```text
scripts/
  import-data.ts
src/
  data/             # Vygenerované očistené dáta
  domain/
    requirements.ts # Kto musí absolvovať aké školenie
    validity.ts     # Vyhodnotenie platnosti
    priorities.ts   # Poradie naliehavosti
    planner.ts      # Odporúčanie termínov
  components/
  pages/
  types/
tests/
docs/
```

## Ako funguje odporúčanie termínov

Na stránke Training needs sa najprv vytvoria priority pre aktívnych zamestnancov.
Ukončení zamestnanci sú v tejto časti vynechaní. Povinné školenie má prioritu 1,
ak chýba záznam alebo jeho platnosť skončila. Prioritu 2 má školenie, ktorého
platnosť skončí v deň vyhodnotenia alebo do 30 dní. Platné školenia sa do priorít
nezaraďujú a neisté údaje idú do časti Needs review.

Priority sa zoradia takto:

1. priorita 1 pred prioritou 2,
2. starší dátum skončenia platnosti pred neskorším; chýbajúci dátum je na začiatku,
3. ID zamestnanca,
4. kód školenia.

Pre každú prioritu sa hľadajú plánované, budúce termíny s platnými údajmi a
voľnou kapacitou. Vyberie sa najskorší termín, ktorý sa zmestí pred koniec
platnosti. Ak taký neexistuje, použije sa najskorší neskorší termín a aplikácia
upozorní na možnú medzeru v platnosti. Pri výbere sa zohľadňuje aj dátum
ukončenia pracovného pomeru, časová kolízia školení rovnakého zamestnanca a
voľné miesta, ktoré už boli pridelené skorším návrhom.

### Obmedzenia a možné skreslenia

- Poradie je technické pravidlo, nie skutočná personálna priorita. Ak má
  niekoľko zamestnancov rovnakú naliehavosť, skorší návrh dostane miesto skôr
  podľa ID.
- Export obsahuje iba počet obsadených miest, nie zoznam prihlásených osôb.
  Aplikácia preto vytvára simulovaný návrh a znižuje iba dočasne vypočítanú
  kapacitu.
- Alternatívy v detaile termínu sú vhodné kandidátske termíny v okamihu
  výpočtu. Nie sú potvrdením, že konkrétny zamestnanec už nie je prihlásený
  inde alebo že sa kapacita medzičasom nezmenila.
- Pri voľných termínoch sa preferuje najskorší dátum, nie cena, miesto,
  preferencia zamestnanca ani pracovné náklady.
- Kolízie sa kontrolujú iba medzi návrhmi vytvorenými aplikáciou. Existujúce
  prihlásenia nie sú v exporte dostupné.
