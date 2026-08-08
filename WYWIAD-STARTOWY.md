# WYWIAD STARTOWY — jednorazowy

Ten plik odpala się dokładnie raz: przy pierwszej rozmowie w tym workspace, gdy `list_sessions`
zwraca zero wyników (patrz `CLAUDE.md`, punkt 0.2). Po tym, jak istnieje choć jedna sesja — nigdy
więcej go nie proponuj, nawet jeśli odpowiedzi były częściowe albo w większości pominięte.

Cel: nie diagnoza, nie ocena. To baza orientacyjna, żeby Claude od pierwszej prawdziwej rozmowy
wiedział z kim rozmawia, zamiast zgadywać albo pytać od zera za każdym razem. Odpowiednik tego,
co u Mikiego powstało w dwa dni rozmów — tu skompresowane do jednego usiadania, bo nie każdy ma
ochotę na dwa dni.

## ZASADY PRZEPROWADZANIA

- Można pominąć dowolne pytanie, całe bloki, albo cały wywiad. Bez pytania "dlaczego nie chcesz
  odpowiedzieć" — pominięcie jest wystarczającą odpowiedzią.
- Nie trzeba zrobić tego za jednym razem. Można przerwać i wrócić — dopóki nie ma żadnej sesji
  w bridge'u, ten plik nadal się odpala.
- Pytania w blokach A-C i E-G nadają się do formatu tak/nie/50-50 + detal, gdzie interaktywna
  ramka jest dostępna. Bloki D i H lepiej zadać prozą — to nie są rzeczy, które dobrze się
  zamykają w jednym kliknięciu.
- Żadnej oceny odpowiedzi. Żadnego "to dobrze, że..." ani "warto by...". Zbierz, zapisz, idź dalej.
- Nie pytaj "dlaczego" o żadną z odpowiedzi dotyczących przeszłości (patrz `CLAUDE.md`, sekcja 3).

## PYTANIA

**A. Orientacja (fakty)**
1. Wiek albo rok urodzenia?
2. Gdzie mieszkasz i z kim?
3. Czym się zajmujesz na co dzień — praca, nauka, opieka nad kimś?
4. Masz dzieci albo osoby, którymi się na stałe opiekujesz?
5. Jesteś w związku? Możesz podać z kim, ale nie musisz.

**B. Obecne wsparcie kliniczne**
6. Jesteś teraz w terapii i/lub farmakoterapii? Z kim (jeśli chcesz podać) i od kiedy?
7. Bierzesz jakiś lek na stałe, o którego porę chciałabyś, żebym pytała w codziennym dzienniku?
   Jeśli tak — jak mam nazwać to pole? (Jeśli nie chcesz, żeby DZIENNIK.md w ogóle o to pytał,
   powiedz to wprost — kolumna zostanie pusta.)
8. Jest coś zdiagnozowanego, o czym chcesz, żebym wiedziała? Możesz nie podawać nazwy, jeśli wolisz
   opisać zjawisko bez etykiety.

**C. Punkt odniesienia — sen, energia, stres**
9. Jak wygląda Twój sen w normalnym, względnie spokojnym okresie — ile godzin, o jakiej porze?
10. Jak zwykle oceniasz swoją energię w skali 0-10 w typowy dzień?
11. Co zwykle podnosi Ci poziom stresu/spięcia, a co go realnie obniża?

**D. Krótko o przeszłości**
12. Byłaś kiedyś wcześniej w terapii? Co pomogło, co nie pomogło?
13. Jest coś z przeszłości, o czym już teraz wiesz, że chcesz z czasem popracować — nawet jeśli
    jeszcze nie dziś?

**E. Wsparcie społeczne**
14. Kto jest dla Ciebie najbliższą osobą, na którą realnie możesz liczyć?
15. Masz kogoś, przy kim możesz być szczera bez filtrowania się?

**F. Jak chcesz być prowadzona**
16. Wolisz bezpośredniość czy delikatniejsze podejście?
17. Chcesz częstych pytań z mojej strony, czy wolisz przestrzeń i ciszę, dopóki sama czegoś nie
    zaczniesz?
18. Chcesz, żebym sięgała do badań i źródeł, czy wystarczy prościej, bez cytowania literatury?
19. Chcesz codzienny rozszerzony check-in (nastrój, sny, plan na dzień), poza samą tabelką liczb
    w DZIENNIKU? Jeśli tak — czy ma zawierać pytanie o seks (był/nie był, jak się z nim czujesz),
    czy wolisz je pominąć? Domyślnie: bez rozszerzonego check-inu, dopóki nie powiesz inaczej.

**G. Granice**
20. Jest jakiś temat, do którego nie mam wracać z własnej inicjatywy, dopóki sama go nie zaczniesz?
21. Jest coś, co ma zostać wyłącznie między Tobą a terapeutką/psychiatrą, a nie trafiać tutaj wcale?

**H. Bezpieczeństwo — jedno pytanie, raz**
22. Zdarzyło Ci się kiedykolwiek mieć myśli o odebraniu sobie życia albo o zrobieniu sobie krzywdy?
    Pytam wprost i bez oceny — to nie jest test, tylko punkt odniesienia na wypadek, gdybym
    kiedykolwiek musiał zareagować szybko. Możesz pominąć to pytanie tak samo jak każde inne.

**I. Po co Ci to narzędzie**
23. Czego oczekujesz od tego workspace'u — dziennika dla siebie, przygotowania materiału do
    terapii, czy jednego i drugiego?

## CO ZROBIĆ Z ODPOWIEDZIAMI

1. Zapisz całość jako jedną sesję (albo kilka, jeśli wywiad rozbity na kilka rozmów) przez
   `create_session`, tag `wywiad-startowy` + `kluczowe`, `raw_input` = jej słowa verbatim.
2. Z bloku A — dopisz krótkie, wyłącznie faktyczne podsumowanie do `CLAUDE.md`, sekcja 1, z
   pointerem do tej sesji. Bez interpretacji.
3. Z bloku G — przepisz nazwane granice do `WZORCE.md`, sekcja GRANICE — NIE RUSZAĆ Z WŁASNEJ
   INICJATYWY, z cytatem i datą.
4. Z bloku B/pytania 7 — jeśli potwierdziła lek do śledzenia, dopisz nazwę pola do `DZIENNIK.md`
   i do `CLAUDE.md` punkt 0.3. Jeśli nie — zostaw jak jest, puste.
5. Z bloku F/pytania 19 — jeśli chce rozszerzony check-in, zaktualizuj `CLAUDE.md` punkt 0.3b z
   jej wyborem co do pytania o seks (włączone/pominięte). Jeśli nie chce w ogóle — punkt 0.3b
   zostaje nieaktywny, nie usuwaj go z pliku, tylko nie stosuj.
6. Jeśli w bloku B/D padnie imię terapeutki/psychiatry i chce, żeby było zapisane — dopisz je do
   `CLAUDE.md`, sekcja 4, obok zdania "Nie zastępuj terapii".
7. Odpowiedź na pytanie 22 nie zmienia żadnego pliku automatycznie poza samą sesją — to nie jest
   pole do śledzenia w czasie, tylko jednorazowy punkt odniesienia. Zasada z `CLAUDE.md` sekcja 5
   (reaguj natychmiast przy jakimkolwiek sygnale kryzysu) obowiązuje niezależnie od odpowiedzi tutaj.

## ŹRÓDŁA I INSPIRACJA

Struktura pytań (bloki A-C, E, I) czerpie z typowego wywiadu wstępnego (biopsychospołecznego)
stosowanego w gabinetach terapeutycznych — orientacja, obecne wsparcie, historia, sieć społeczna,
cel kontaktu. Blok G (granice) i mechanizm "zapytaj raz, potem szanuj" są przeniesione wprost z
tego, co sprawdziło się u Mikiego w tym samym workspace przez dwa miesiące pracy. Sformułowanie
pytania o myśli samobójcze w bloku H (pytanie wprost, bez oceny, jednorazowo) odpowiada
rekomendacjom dotyczącym przesiewowego pytania o ideację samobójczą przy pierwszym kontakcie —
m.in. [American Academy of Pediatrics, Screening for Suicide Risk in Clinical Practice](https://www.aap.org/en/patient-care/blueprint-for-youth-suicide-prevention/strategies-for-clinical-settings-for-youth-suicide-prevention/screening-for-suicide-risk-in-clinical-practice/)
oraz [CAMH, Suicide Risk: Detecting & Assessing Suicidality](https://www.camh.ca/en/professionals/treating-conditions-and-disorders/suicide-risk/suicide---detecting-and-assessing-suicidality) —
bezpośrednie, spokojne pytanie nie zwiększa ryzyka i jest standardem, nie wyjątkiem. Zakres bloku B
(diagnoza, leki, dotychczasowe leczenie) jest strukturalnie zbliżony do domen pytanych w
Adverse Childhood Experiences Questionnaire i podobnych narzędziach przesiewowych — bez kopiowania
samego, chronionego kwestionariusza, tylko zakresu tematycznego ([przegląd ACE-Q](https://novopsych.com/assessments/trauma/adverse-childhood-experiences-questionnaire-ace-q/)).

To narzędzie nie stawia diagnoz i nie zastępuje konsultacji klinicznej — patrz `CLAUDE.md`,
sekcja 4 i 5.
