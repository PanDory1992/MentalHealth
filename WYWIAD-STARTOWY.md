# WYWIAD STARTOWY — jednorazowy

**Jak system pozna, że to już się wydarzyło:** `CLAUDE.md`, punkt 0.2, każe zawołać
`search_sessions` z `tag: "wywiad-startowy"`. Jeśli nie ma żadnego wyniku, wywiad nigdy nie
został przeprowadzony — niezależnie od tego, ile innych sesji już istnieje. Jeśli choć jedna sesja
z tym tagiem istnieje, nawet niepełna, wywiad się nie powtarza. To sprawdzenie jest po tagu, nie
po ogólnej liczbie sesji, właśnie po to, żeby przerwanie w połowie nie zgubiło reszty pytań na
zawsze ani nie uruchomiło wywiadu drugi raz od zera.

**46 pytań, nie więcej.** To celowy kompromis. Prawdziwa, głęboka baza wiedzy o kimś buduje się
miesiącami organicznej rozmowy, nie jednym formularzem — ale jedno posiedzenie zerowe daje Claude
dużo więcej niż start od zera. Więcej pytań na starcie zaczyna działać jak przesłuchanie, nie
wywiad; to jest dokładnie to, przed czym ostrzega `DZIENNIK.md` (mierzenie zamienia się w egzamin).

## ZASADY PRZEPROWADZANIA

- Można pominąć dowolne pytanie, całe bloki, albo cały wywiad. Bez pytania "dlaczego nie chcesz
  odpowiedzieć" — pominięcie jest wystarczającą odpowiedzią.
- Nie trzeba zrobić tego za jednym razem. Można przerwać w dowolnym miejscu i wrócić później —
  dopóki nie ma sesji z tagiem `wywiad-startowy`, ten plik nadal się odpala.
- Bloki A, B, C, E, F, G, H, J nadają się do formatu tak/nie/50-50 + detal, gdzie interaktywna
  ramka jest dostępna. Bloki D i I lepiej zadać prozą — to nie są rzeczy, które dobrze się
  zamykają w jednym kliknięciu.
- Żadnej oceny odpowiedzi. Żadnego "to dobrze, że..." ani "warto by...". Zbierz, zapisz, idź dalej.
- Nie pytaj "dlaczego" o żadną z odpowiedzi dotyczących przeszłości (patrz `CLAUDE.md`, sekcja 3).

## PYTANIA

**A. Orientacja i codzienność**
1. Wiek albo rok urodzenia?
2. Gdzie mieszkasz i z kim?
3. Masz zwierzęta?
4. Czym się zajmujesz na co dzień — praca, nauka, coś innego?
5. Twoja praca/zajęcie to źródło stresu, oparcia, czy jedno i drugie naprzemiennie?
6. Masz dzieci albo osoby, którymi się na stałe opiekujesz?
7. Jesteś w związku? Możesz podać z kim i od kiedy, ale nie musisz.
8. Twoi rodzice żyją? Jaki masz z nimi kontakt teraz?
9. Masz rodzeństwo? Jaki jest z nimi kontakt?

**B. Zdrowie i wsparcie kliniczne**
10. Jesteś teraz w terapii i/lub farmakoterapii? Z kim (jeśli chcesz podać) i od kiedy?
11. Bierzesz jakiś lek na stałe, o którego porę chciałabyś, żebym pytała w codziennym dzienniku?
    Jeśli tak — jak mam nazwać to pole? (Jeśli wolisz, żeby DZIENNIK.md w ogóle o to nie pytał,
    powiedz to wprost — kolumna zostanie pusta.)
12. Jest coś zdiagnozowanego, o czym chcesz, żebym wiedziała? Możesz nie podawać nazwy, jeśli
    wolisz opisać zjawisko bez etykiety.
13. Masz jakieś przewlekłe dolegliwości somatyczne, o których warto wiedzieć w kontekście tego,
    jak się czujesz na co dzień?
14. Byłaś kiedyś wcześniej w terapii? Co pomogło, co nie pomogło?
15. Pijesz alkohol? Jeśli tak — zdarza się, że sięgasz po niego, żeby się uspokoić albo coś
    zagłuszyć?
16. Masz jakąś regularną aktywność fizyczną albo coś, co traktujesz jako formę odreagowania?

**C. Punkt odniesienia — sen, energia, stres**
17. Jak wygląda Twój sen w normalnym, względnie spokojnym okresie — ile godzin, o jakiej porze?
18. Jak zwykle oceniasz swoją energię w skali 0-10 w typowy dzień?
19. Co zwykle podnosi Ci poziom stresu/spięcia?
20. Co go realnie obniża?
21. Jak wygląda u Ciebie "zły dzień" — po czym go rozpoznajesz?
22. Jak wygląda "dobry dzień"?
23. Zauważasz u siebie jakiś cykl (hormonalny, sezonowy, tygodniowy), który wpływa na nastrój
    albo energię?

**D. Krótko o przeszłości**
24. Jest coś z dzieciństwa albo młodości, o czym już teraz wiesz, że chcesz z czasem popracować —
    nawet jeśli jeszcze nie dziś?
25. Jest coś z przeszłości, co uważasz za już zamknięte, przepracowane?
26. Jest jakiś moment albo okres, który uważasz za punkt zwrotny na plus?

**E. Wsparcie społeczne**
27. Kto jest dla Ciebie najbliższą osobą, na którą realnie możesz liczyć?
28. Masz kogoś, przy kim możesz być szczera bez filtrowania się?
29. Czujesz się częściej samotna, czy raczej otoczona ludźmi, kiedy tego potrzebujesz?

**F. Praca / to, czym się zajmujesz**
30. Co w Twojej pracy/zajęciu daje Ci najwięcej satysfakcji?
31. Co jest w niej najbardziej męczące?
32. Jest coś zawodowego, co chciałabyś zmienić w najbliższym czasie?

**G. Jak chcesz być prowadzona**
33. Wolisz bezpośredniość czy delikatniejsze podejście?
34. Chcesz częstych pytań z mojej strony, czy wolisz przestrzeń i ciszę, dopóki sama czegoś nie
    zaczniesz?
35. Chcesz, żebym sięgała do badań i źródeł, czy wystarczy prościej, bez cytowania literatury?
36. Kiedy mówisz "nie wiem" — wolisz, żebym dopytał, czy żebym to zostawił?
37. Chcesz podsumowania na koniec rozmowy (co ustaliliśmy), czy to zbędne?
38. Chcesz codzienny rozszerzony check-in (nastrój, sny, plan na dzień), poza samą tabelką liczb
    w DZIENNIKU? Jeśli tak — czy ma zawierać pytanie o seks (był/nie był, jak się z nim czujesz),
    czy wolisz je pominąć? Domyślnie: bez rozszerzonego check-inu, dopóki nie powiesz inaczej.

**H. Granice**
39. Jest jakiś temat, do którego nie mam wracać z własnej inicjatywy, dopóki sama go nie zaczniesz?
40. Jest osoba, o której nie chcesz, żebym pytała, nawet jeśli się gdzieś pojawi w rozmowie?
41. Jest coś, co ma zostać wyłącznie między Tobą a terapeutką/psychiatrą, a nie trafiać tutaj wcale?
42. Chcesz, żebym z czasem budował "wzorce" — powtarzające się obserwacje o Tobie — czy wolisz,
    żeby to zostało czystym dziennikiem bez teorii na Twój temat?

**I. Bezpieczeństwo — raz, wprost**
43. Zdarzyło Ci się kiedykolwiek mieć myśli o odebraniu sobie życia albo o zrobieniu sobie
    krzywdy? Pytam wprost i bez oceny — to nie test, tylko punkt odniesienia na wypadek, gdybym
    musiał kiedyś zareagować szybko. Możesz pominąć to pytanie tak samo jak każde inne.
44. Jest ktoś, do kogo mogłabyś zadzwonić w środku nocy, gdyby było naprawdę źle?

**J. Po co Ci to narzędzie**
45. Czego oczekujesz od tego workspace'u — dziennika dla siebie, przygotowania materiału do
    terapii, czy jednego i drugiego?
46. Jak często realnie planujesz z niego korzystać — codziennie, kilka razy w tygodniu,
    sporadycznie?

## CO ZROBIĆ Z ODPOWIEDZIAMI

1. Zapisz całość jako jedną sesję (albo kilka, jeśli wywiad rozbity na kilka rozmów) przez
   `create_session`, tag `wywiad-startowy` + `kluczowe`, `raw_input` = jej słowa verbatim.
2. Z bloku A — dopisz krótkie, wyłącznie faktyczne podsumowanie do `CLAUDE.md`, sekcja 1, z
   pointerem do tej sesji. Bez interpretacji.
3. Z bloku H — przepisz nazwane granice do `WZORCE.md`, sekcja GRANICE — NIE RUSZAĆ Z WŁASNEJ
   INICJATYWY, z cytatem i datą.
4. Z bloku B/pytania 11 — jeśli potwierdziła lek do śledzenia, dopisz nazwę pola do `DZIENNIK.md`
   i do `CLAUDE.md` punkt 0.3. Jeśli nie — zostaw jak jest, puste.
5. Z bloku G/pytania 38 — jeśli chce rozszerzony check-in, zaktualizuj `CLAUDE.md` punkt 0.3b z
   jej wyborem co do pytania o seks (włączone/pominięte). Jeśli nie chce w ogóle — punkt 0.3b
   zostaje nieaktywny, nie usuwaj go z pliku, tylko nie stosuj.
6. Jeśli w bloku B/D padnie imię terapeutki/psychiatry i chce, żeby było zapisane — dopisz je do
   `CLAUDE.md`, sekcja 4, obok zdania "Nie zastępuj terapii".
7. Odpowiedź na pytanie 43 nie zmienia żadnego pliku automatycznie poza samą sesją — to nie jest
   pole do śledzenia w czasie, tylko jednorazowy punkt odniesienia. Zasada z `CLAUDE.md` sekcja 5
   (reaguj natychmiast przy jakimkolwiek sygnale kryzysu) obowiązuje niezależnie od odpowiedzi tutaj.

## ŹRÓDŁA I INSPIRACJA

Struktura pytań (bloki A-C, E-F, J) czerpie z typowego wywiadu wstępnego (biopsychospołecznego)
stosowanego w gabinetach terapeutycznych — orientacja, obecne wsparcie, historia, sieć społeczna,
cel kontaktu. Blok H (granice) i mechanizm "zapytaj raz, potem szanuj" są przeniesione wprost z
tego, co sprawdziło się w analogicznym workspace przez dwa miesiące pracy. Sformułowanie pytania o
myśli samobójcze w bloku I (pytanie wprost, bez oceny, jednorazowo) odpowiada rekomendacjom
dotyczącym przesiewowego pytania o ideację samobójczą przy pierwszym kontakcie — m.in.
[American Academy of Pediatrics, Screening for Suicide Risk in Clinical Practice](https://www.aap.org/en/patient-care/blueprint-for-youth-suicide-prevention/strategies-for-clinical-settings-for-youth-suicide-prevention/screening-for-suicide-risk-in-clinical-practice/)
oraz [CAMH, Suicide Risk: Detecting & Assessing Suicidality](https://www.camh.ca/en/professionals/treating-conditions-and-disorders/suicide-risk/suicide---detecting-and-assessing-suicidality) —
bezpośrednie, spokojne pytanie nie zwiększa ryzyka i jest standardem, nie wyjątkiem. Zakres bloku B
(diagnoza, leki, dotychczasowe leczenie, używki) jest strukturalnie zbliżony do domen pytanych w
Adverse Childhood Experiences Questionnaire i podobnych narzędziach przesiewowych — bez kopiowania
samego, chronionego kwestionariusza, tylko zakresu tematycznego
([przegląd ACE-Q](https://novopsych.com/assessments/trauma/adverse-childhood-experiences-questionnaire-ace-q/)).

To narzędzie nie stawia diagnoz i nie zastępuje konsultacji klinicznej — patrz `CLAUDE.md`,
sekcja 4 i 5.
