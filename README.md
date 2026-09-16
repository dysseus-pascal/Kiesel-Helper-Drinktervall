# Kiesel-Helper — Drinktervall

Die Beschreibung, mit der [Kiesel-Helper](https://github.com/dysseus-pascal/Kiesel-Helper)
die Werte von **Drinktervall** in die Gesundheitsakte des Telefons eintraegt.

Hier steht **kein Programmcode**. Nur ein Zettel: welche Uhr-App, welche Felder,
und was daraus werden soll. Kiesel-Helper kann das Eintragen bereits — er weiss
nur nicht, wofuer.

## Was passiert

Drinktervall haengt an die Nachricht, die es nach jedem getrunkenen Glas
ohnehin ans Telefon schickt, zwei Felder an: **wann** getrunken wurde und **wie
viel** in ein Glas geht. Diese Beschreibung macht daraus einen Eintrag ueber
getrunkenes Wasser.

Die Akte will eine Spanne, keinen Zeitpunkt — ein Glas trinkt sich nicht in
null Sekunden, und eine Spanne der Laenge null lehnt sie ab. Eine Minute ist
eine ehrliche Naeherung.

`nicht_zweimal_fuer: DRANK_AT` sorgt dafuer, dass eine erneut zugestellte
Nachricht — etwa nach einer verlorenen Bestaetigung — kein zweites Glas
eintraegt.

## Die Datei

`kiesel.json` besteht aus drei Teilen:

**`uuid`** — an welcher Uhr-App die Nachricht erkannt wird.

**`schluessel`** — die Felder, die diese Beschreibung benutzt, mit ihrer
Nummer. Die Nummern sind keine freie Wahl: sie ergeben sich aus der Reihenfolge
der `messageKeys` in der `package.json` von Drinktervall, beginnend bei 10000.

**`regeln`** — was zu tun ist. `wenn` nennt die Felder, die vorhanden sein
muessen, damit die Regel greift; `nicht_zweimal_fuer` verhindert, dass eine
erneut zugestellte Nachricht ein zweites Mal eingetragen wird; `eintrag`
beschreibt den Satz in der Akte.

## Warum die Pruefung

Die Schluesselnummern haengen an der Reihenfolge in einem **anderen** Repo. Wer
dort eine Zeile dazwischen einfuegt, verschiebt alle folgenden Nummern — und
diese Beschreibung traegt danach still falsche Werte ein. Kein Absturz, keine
Meldung, nur falsche Zahlen in einer Gesundheitsakte.

`tools/pruefe.js` holt deshalb die `package.json` von Drinktervall uebers Netz und
rechnet die Nummern nach. Es laeuft bei jedem Push hier **und woechentlich**,
denn die Aenderung, die es fangen soll, passiert drueben.

```bash
node tools/pruefe.js
```

## Grenze

Die Satzart `hydration` muss Kiesel-Helper bereits koennen. Eine Beschreibung
kann dem Rahmen keine neue Art beibringen — Berechtigungen fuer die
Gesundheitsakte stehen fest in der installierten App und lassen sich nicht
nachreichen. Welche Arten es gibt, steht im
[Katalog von Kiesel-Helper](https://github.com/dysseus-pascal/Kiesel-Helper#der-katalog).

## Lizenz

[CC0 1.0](LICENSE) — gemeinfrei.
