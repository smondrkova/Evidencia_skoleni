# Analýza vstupných dát

Dáta tvoria štyri prepojené tabuľky: zamestnanci, história absolvovaných školení, katalóg školení a dostupné termíny. Obsahujú informácie potrebné na prehľad proškolenosti aj odporúčanie termínov, ale pred výpočtami ich treba vyčistiť.

Export zachytáva stav k **1. 10. 2026**. Údaje sú podľa zadania vygenerované.

## 1. Súbory a formát

| Súbor | Počet záznamov | Oddelovač | Kódovanie |
| --- | ---: | --- | --- |
| `zamestnanci.csv` | 174 | čiarka | UTF-8 |
| `absolvovana_skoleni.csv` | 2 868 vrátane 3 pomocných riadkov | bodkočiarka | Windows-1250 |
| `katalog_skoleni.csv` | 10 | čiarka | UTF-8 |
| `terminy_skoleni.csv` | 34 | bodkočiarka | UTF-8 |

Počty označujú záznamy načítané CSV parserom, nie počet fyzických riadkov súboru. Niektoré poznámky obsahujú oddeľovače, úvodzovky aj zalomenia riadkov. Import preto musí používať CSV parser; nestačí rozdeliť text po riadkoch a bodkočiarkach.

## 2. Zamestnanci

Každý riadok predstavuje zamestnanca.

| Stĺpec | Význam |
| --- | --- |
| `id_zamestnance` | Jednoznačný identifikátor zamestnanca |
| `jmeno`, `prijmeni`, `email` | Identifikačné a kontaktné údaje |
| `utvar`, `pozice` | Organizačné zaradenie; určujú aj niektoré povinné školenia |
| `vedouci_email` | Odkaz na vedúceho cez e-mail |
| `datum_nastupu`, `datum_ukonceni`, `stav` | Údaje o pracovnom pomere |
| `rodne_cislo`, `poznamka` | Doplnkové údaje |

### Rozdelenie podľa stavu

| Stav v zdroji | Počet |
| --- | ---: |
| `aktivní` | 156 |
| `ukončen` | 12 |
| `rodičovská` | 6 |

### Zistené nezrovnalosti

- Identifikátory zamestnancov sú jedinečné.
- Päť zamestnancov nemá vyplnený útvar.
- Rovnaké útvary majú rôzne názvy, napríklad `Laboratoře` / `Laboratore`, `Správa budov` / `SPRÁVA BUDOV` / `Sprava budov` alebo `Studijní oddělení` / `Studijní` / `Studijni oddeleni`.
- Dva e-maily obsahujú medzery.
- Aj po základnej normalizácii sa dve e-mailové adresy opakujú. E-mail preto nie je vhodný ako jednoznačný identifikátor zamestnanca.
- Tri odkazy na vedúceho smerujú na neznámy e-mail a jeden odkaz chýba.
- Štyria aktívni zamestnanci majú vyplnený budúci dátum ukončenia. To samo osebe nie je chyba, ale plánovanie ho musí zohľadniť.
- Poznámky obsahujú texty začínajúce `=`, `+`, `-` a `@`. Pri exporte do tabuľkového procesora ich treba spracovať ako text, aby sa neinterpretovali ako vzorce.

Rodné čísla nie sú na splnenie účelu aplikácie potrebné. Odporúčanie je neprenášať ich do aplikačných dát ani ich nezobrazovať.

## 3. Katalóg školení

Katalóg obsahuje stĺpce `kod`, `nazev`, `platnost_mesicu`, `povinne_pro` a `poznamka`.

| Kód | Školenie | Platnosť v zdroji | Pre koho |
| --- | --- | --- | --- |
| `BOZP-Z` | BOZP – základné školenie | 24 mesiacov | Všetci |
| `POZ-OCH` | Požiarna ochrana | 24 mesiacov | Všetci |
| `GDPR` | Ochrana osobných údajov | 36 mesiacov | Všetci |
| `KYBER` | Kybernetická bezpečnosť | 12 mesiacov | Všetci |
| `PRV-POM` | Prvá pomoc | 36 mesiacov | Laboratóriá, správa budov, knižnica |
| `RIDIC` | Vodiči referenti | 12 mesiacov | Vodiči |
| `LAB-BEZ` | Bezpečná práca v laboratóriu | 24 mesiacov | Laboratóriá |
| `ZDVIH` | Obsluha zdvíhacích zariadení | `2 roky` | Technici údržby |
| `LEAD` | Základy vedenia ľudí | `0` | Vedúci |
| `ANGL` | Anglický jazyk – kurz | Neuvedená | Nepovinné |

Pravidlá povinnosti sú uložené ako text:

- `VSICHNI` — povinné pre všetkých.
- `UTVAR:Laboratoře;Správa budov;Knihovna` — povinné pre uvedené útvary.
- `POZICE:Řidič` — povinné pre uvedenú pozíciu.
- `NEPOVINNE` — nepovinné školenie.

### Potrebné rozhodnutia

- Hodnotu `2 roky` pri `ZDVIH` normalizovať na 24 mesiacov.
- Význam `0` pri `LEAD` zdokumentovať. Jednorazové školenie bez expirácie je rozumný predpoklad, ale zdroj ho výslovne nepotvrdzuje.
- Prázdna platnosť automaticky neznamená neobmedzenú platnosť.
- Pred vyhodnotením pravidiel zjednotiť názvy útvarov.

## 4. Absolvované školenia

Ide o históriu absolvovaní. Jeden zamestnanec môže mať viac záznamov vrátane opakovaných absolvovaní rovnakého školenia.

| Stĺpec | Význam |
| --- | --- |
| `id_zaznamu` | Identifikátor záznamu absolvovania |
| `id_zamestnance` | Odkaz na zamestnanca |
| `zamestnanec` | Textové meno zamestnanca; na spájanie používať ID |
| `kod_skoleni` | Odkaz na katalóg školení |
| `datum_absolvovani` | Dátum absolvovania |
| `platnost_do` | Evidovaný koniec platnosti |
| `poskytovatel` | Poskytovateľ školenia |
| `cena_kc` | Cena v Kč |
| `poznamka` | Voľný text |

### Pomocné riadky a duplicity

- Tri záznamy nie sú absolvovania: komentár k exportu, opakovaná hlavička a súhrnný riadok `Celkem`.
- Po ich odobratí zostáva 2 865 riadkov pred deduplikáciou a ďalšou validáciou.
- Sedem riadkov je úplne duplicitných.
- Ďalších osem identifikátorov sa opakuje s rozdielnym obsahom. Tieto konflikty nemožno vyriešiť jednoduchým odstránením úplných duplicít.

### Väzby a kódy

- Deväť záznamov odkazuje na neexistujúcich zamestnancov `E9001` až `E9009`.
- Kódy majú nadbytočné medzery, rôznu veľkosť písmen a varianty ako `POZ_OCH`, `BOZP Z`, `KYB3R`, `BOZP-X` či `GDPR-2`.
- Orezanie medzier a zjednotenie veľkosti písmen sú jednoduché normalizácie. Opravy nejasných kódov vyžadujú explicitné mapovanie alebo kontrolu; nemožno automaticky predpokladať ich význam.

### Dátumy a platnosť

- Dátumy kombinujú ISO zápis (`2019-01-06`), české zápisy (`6. 1. 2019`, `07.01.2019`) aj číselné hodnoty, ktoré môžu predstavovať excelové dátumy.
- Dva dátumy absolvovania sú z roku 1900.
- Päť parsovateľných dátumov absolvovania je po dátume exportu 1. 10. 2026. Nemožno ich bez kontroly započítať ako už absolvované školenia.
- Pri ôsmich záznamoch je parsovateľný koniec platnosti skorší než absolvovanie.
- V surovom súbore má 49 záznamov prázdne `platnost_do`; tento počet zahŕňa aj dva pomocné riadky s prázdnymi hodnotami.
- Chýbajúca platnosť môže znamenať neúplný údaj alebo školenie bez expirácie. Treba ju posudzovať podľa katalógu a zdokumentovaných pravidiel.

### Ceny a textové hodnoty

- Ceny obsahujú rôzne zápisy, napríklad `1 150,00`, `550,- Kč`, `zdarma`, prázdne aj záporné hodnoty.
- Záporné ceny treba označiť na kontrolu; ich význam zdroj nevysvetľuje.
- Názvy poskytovateľov sa líšia aj veľkosťou písmen.
- Poznámky obsahujú úvodzovky, bodkočiarky aj zalomenia riadkov.

Nejasné kódy, konfliktné záznamy a podozrivé dátumy majú zostať označené na kontrolu, aby aplikácia nepotvrdila platné školenie na základe pochybného údaja.

## 5. Termíny školení

Každý riadok obsahuje `id_terminu`, `kod_skoleni`, `datum`, `cas`, `misto`, `kapacita`, `obsazeno`, `cena_na_osobu` a `stav`.

Identifikátory termínov sú jedinečné. Z 34 termínov je 32 označených ako `plánováno` a dva ako `zrušeno`.

### Obmedzenie registrácií

Export obsahuje iba počet prihlásených (`obsazeno`), nie zoznam konkrétnych osôb. Vieme určiť nominálny počet voľných miest, ale nevieme overiť, či už je konkrétny zamestnanec prihlásený.

Odporúčanie termínu preto nemožno považovať za potvrdenú registráciu. Preplnené termíny nemajú voľné miesta a vyžadujú upozornenie na nesúlad. Pravdepodobnú duplicitu termínov nemožno bez overenia započítať ako dve nezávislé kapacity.

## 6. Väzby medzi súbormi

```text
zamestnanci.id_zamestnance ← absolvovana_skoleni.id_zamestnance
katalog_skoleni.kod        ← absolvovana_skoleni.kod_skoleni
katalog_skoleni.kod        ← terminy_skoleni.kod_skoleni
```

- Zamestnanec môže mať viac absolvovaní.
- Druh školenia môže mať viac absolvovaní aj viac termínov.
- Odkaz na vedúceho sa nachádza v zamestnancoch ako e-mail, ktorý nemusí byť jednoznačný ani platný.
- Priame prepojenie zamestnanca s termínom v exportoch chýba.

## 7. Odporúčania pre aplikáciu

1. Ako predvolený referenčný dátum použiť **1. 10. 2026**, aby prehľad zodpovedal exportu. Pri inom dátume jasne uviesť, že ide o prepočet nad historickým exportom.
2. Oddeliť pôvodné hodnoty, normalizované údaje a zoznam validačných problémov. Zachovať dohľadateľnosť opráv.
3. Rozlišovať stavy **platné**, **čoskoro expiruje**, **expirované**, **chýba** a **neisté údaje**. Hranicu „čoskoro“ explicitne zvoliť a uviesť.
4. Povinnosti odvodzovať z normalizovaného útvaru a pozície. Pri chýbajúcom útvare netvrdiť, že útvarové školenie nie je povinné.
5. Zdokumentovať pravidlá pre rodičovskú dovolenku, ukončené pracovné pomery, jednorazové školenia a chýbajúce konce platnosti.
6. Pri vyhodnocovaní histórie nezapočítavať budúce absolvovania ako dokončené a nevyriešiť konflikty iba výberom najväčšieho dátumu.
7. Pri odporúčaní termínov uprednostniť chýbajúce a expirované povinné školenia, potom najbližšie expirácie. Pri návrhu uviesť dôvod priority.
8. Zohľadniť dátum termínu, platnosť školenia, voľnú kapacitu, časové kolízie navrhnutých účastí a dátum ukončenia pracovného pomeru.
9. Vylúčiť zrušené a minulé termíny, termíny bez voľných miest a termíny s nevyriešenými kritickými chybami.
10. Návrh prihlásenia označiť ako odporúčanie vyžadujúce kontrolu existujúcich registrácií.
11. Rodné čísla vynechať a pri prípadnom CSV exporte ošetriť hodnoty, ktoré by tabuľkový procesor mohol interpretovať ako vzorce.

## 8. Limity analýzy

Uvedené počty opisujú zdrojové dáta a zistené nezrovnalosti. Nejde o konečné počty platných absolvovaní ani o vypočítanú mieru proškolenosti.

Presnú mieru proškolenosti nemožno spoľahlivo uviesť bez rozhodnutia, ako riešiť konflikty a nejasné záznamy. Surové počty absolvovaní by ju skresľovali. Odporúčania a možné interpretácie v tomto dokumente sú návrhy pravidiel, nie potvrdené vlastnosti zdrojových dát.
