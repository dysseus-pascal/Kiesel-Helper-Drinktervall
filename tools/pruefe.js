#!/usr/bin/env node
// Prueft die Beschreibung gegen die Uhr-App.
//
//   node tools/pruefe.js
//
// WARUM ES DIESES SKRIPT GIBT: die Schluesselnummern in kiesel.json sind keine
// freie Wahl. Sie ergeben sich aus der REIHENFOLGE der messageKeys in der
// package.json von Drinktervall - der erste Eintrag ist 10000, der zweite 10001 und
// so fort. Wer dort eine Zeile DAZWISCHEN einfuegt, verschiebt alle folgenden
// Nummern, und diese Beschreibung traegt danach still falsche Werte in die
// Gesundheitsakte ein. Kein Absturz, keine Meldung - nur falsche Zahlen.
//
// Die package.json liegt in einem ANDEREN Repo. Deshalb holt dieses Skript sie
// uebers Netz und rechnet die Nummern nach. Es laeuft bei jedem Push hier UND
// woechentlich, denn die Aenderung, die es fangen soll, passiert drueben.
//
// Exitcode 0 = die Beschreibung passt zur Uhr-App.
'use strict';

const fs = require('fs');
const path = require('path');

const APP = 'Drinktervall';
const QUELLE =
  'https://raw.githubusercontent.com/dysseus-pascal/' + APP + '/main/package.json';

function lies(datei) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', datei), 'utf8'));
}

async function hole(url) {
  const antwort = await fetch(url);
  if (!antwort.ok) throw new Error(url + ' -> HTTP ' + antwort.status);
  return antwort.json();
}

// Die Nummern, wie der Pebble-Bau sie vergibt: Reihenfolge ab 10000.
function nummern(pkg) {
  const aus = {};
  const liste = (pkg.pebble && pkg.pebble.messageKeys) || [];
  liste.forEach((k, i) => {
    if (typeof k === 'string') aus[k] = 10000 + i;
  });
  return aus;
}

async function main() {
  const beschreibung = lies('kiesel.json');
  const pkg = await hole(QUELLE);
  const echt = nummern(pkg);

  let fehler = 0;
  const melde = (text) => { fehler++; console.log('  FEHLER ' + text); };
  const gut = (text) => console.log('  ok     ' + text);

  // 1. Die UUID
  const uuidEcht = pkg.pebble && pkg.pebble.uuid;
  if (beschreibung.uuid !== uuidEcht) {
    melde('UUID weicht ab: Beschreibung ' + beschreibung.uuid + ', App ' + uuidEcht);
  } else {
    gut('UUID stimmt');
  }

  // 2. Jede benutzte Schluesselnummer
  for (const [name, nummer] of Object.entries(beschreibung.schluessel || {})) {
    if (!(name in echt)) {
      melde('Schluessel "' + name + '" gibt es in ' + APP + ' nicht mehr');
    } else if (echt[name] !== nummer) {
      melde('"' + name + '": Beschreibung sagt ' + nummer + ', App sagt ' + echt[name]);
    } else {
      gut('"' + name + '" = ' + nummer);
    }
  }

  // 3. Jeder in einer Regel genannte Schluessel muss oben deklariert sein.
  //    Sonst stuende in der Regel ein Name, den niemand einer Nummer zuordnet.
  const bekannt = new Set(Object.keys(beschreibung.schluessel || {}));
  for (const regel of beschreibung.regeln || []) {
    const benutzt = new Set(regel.wenn || []);
    if (regel.nicht_zweimal_fuer) benutzt.add(regel.nicht_zweimal_fuer);
    for (const feld of Object.values(regel.eintrag || {})) {
      if (feld && typeof feld === 'object' && feld.aus) benutzt.add(feld.aus);
    }
    for (const name of benutzt) {
      if (!bekannt.has(name)) melde('Regel nennt "' + name + '", der nicht deklariert ist');
    }
  }
  if (!fehler) gut('alle Regeln nennen nur deklarierte Schluessel');

  console.log('');
  console.log('Fehler: ' + fehler);
  process.exit(fehler ? 1 : 0);
}

main().catch((e) => {
  console.error('Pruefung nicht moeglich: ' + e.message);
  process.exit(2);
});
