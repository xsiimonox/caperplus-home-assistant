# Änderungsprotokoll

## 0.3.0

- Gemeinsame Aquarium-Designsprache 0.2.0: Türkis, einheitliche Karten, Typografie, Bedienelemente und Tastaturfokus.
- Hell-/Dunkelmodus folgt Home Assistant beziehungsweise dem Browser in eigenständigen Ansichten.
- Gerätefunktionen, Eingabeentwürfe und vorhandene Funktionssperren bleiben erhalten.


Versionsschema: MAJOR.MINOR.PATCH. Neue Funktionen erhöhen MINOR,
Fehlerkorrekturen PATCH; inkompatible Änderungen erhöhen MAJOR.

## 0.2.2

- TLS-Verbindung zu `api.gizwits.com` mit der dort benötigten Cipher
  `AES128-SHA` ermöglicht; CA- und Hostnamenprüfung bleiben aktiviert.
- TLS-Fehler bei der Anmeldung zeigen zusätzlich den OpenSSL-Fehlergrund.
- Eigenes Aquarium-Logo für Panel und Dokumentation.
- Versionsnummern in Manifest, README, Frontend-URL, Git-Tags und Releases
  vereinheitlicht.
- Prüfung: TLS-Handshake mit CA-Bündel erfolgreich, keine Kontoanmeldung und
  keine Gerätekalibrierung beim Verbindungstest ausgeführt.

## 0.2.1

- Genauere, bereinigte Fehlermeldungen während der Einrichtung.
- Zeitlimit für Login und Messwertabruf auf 30 Sekunden erhöht.

## 0.2.0

- Aquarium-Seitenleiste mit Sensorwerten, Verlaufskurven und Kalibrierungsseite.
- Geräteauswahl, WLAN-Status und mobile Darstellung.

## 0.1.0

- Experimentelle Cloud-Integration für Q2 und pH-Kalibrierungsaktion.
