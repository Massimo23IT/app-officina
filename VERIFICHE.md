# Verifiche di Officina PWA 1.0

## Eseguite

- Controllo sintassi dei moduli JavaScript e compilazione sintattica del launcher Python.
- 15 test Node su normalizzazione/duplicati, km, importi, date, collegamenti, lavori/litri/costo, scadenze, storico, importazione della versione SwiftUI, backup e cifratura.
- Cifratura: roundtrip AES-GCM, password errata, ciphertext manomesso, IV differenti, separazione fra archivio e backup, limiti password e parametri KDF.
- Test del flusso reale in Chromium headless con Playwright, viewport iniziale 390 × 844.
- Creazione auto, blocco targa duplicata, lavori/olio/filtri/costo, modifica auto e intervento, eliminazione intervento e auto senza modificare altre schede.
- Persistenza dopo ricaricamento della pagina.
- Testo contenente tag HTML e gestore evento rimasto testo; nessuna esecuzione e nessuna immagine iniettata.
- Prossimo controllo raggiunto aggiornando i km.
- Download del backup cifrato e verifica che il file esportato non contenga targa o nome cliente in chiaro.
- Attivazione cifratura locale, verifica del record IndexedDB cifrato, blocco alla riapertura e password errata/corretta.
- Ricaricamento offline con service worker attivo, sblocco offline e creazione di una seconda auto senza connessione.
- Ripristino del backup cifrato con conferma e copia interna dell’archivio precedente.
- Due istanze dell’archivio: il secondo salvataggio con revisione vecchia viene bloccato.
- Errore di scrittura (database chiuso): la modifica non viene pubblicata nello stato in memoria.
- Header CSP con `frame-ancestors 'none'` e `X-Content-Type-Options: nosniff` controllati nella risposta HTTP.
- Assenza di overflow orizzontale nelle schermate verificate a 320, 390, 768 e 1440 pixel.
- Ispezione visiva degli screenshot mobile e desktop; corretto lo spazio del testo di ricerca rispetto all’icona.
- Integrità e riferimenti delle risorse nel pacchetto; ZIP verificato.

## Da eseguire sul dispositivo dell’utente

Non sono stati eseguiti test su un iPhone fisico, Safari/WebKit o Android fisico. L’emulazione di dimensioni schermo in Chromium non sostituisce queste prove.

- [ ] Installazione da HTTPS locale attendibile su iPhone/iPad e Android.
- [ ] Prima apertura, chiusura completa e riapertura offline dall’icona.
- [ ] Salvataggio e ripristino dei backup tramite File su iPhone.
- [ ] Condivisione della scheda da iOS e fallback download testo.
- [ ] Tastiera e campi data/numero, in verticale e orizzontale.
- [ ] Testo ingrandito, VoiceOver/TalkBack e contrasto in modalità scura.
- [ ] Auto-blocco dopo 10 minuti e comportamento quando l’app rimane in background.
- [ ] Richiesta di spazio persistente e comportamento del browser specifico.
- [ ] Aggiornamento del service worker mantenendo lo stesso indirizzo del server locale.

Prima di inserire dati reali, prova con DEMO001, esporta un backup e ripristinalo. Mantieni una copia esterna dello storico.

## Ripetere i test automatici

Con Node 20 o successivo, nella cartella dell’app:

```bash
npm test
```

Per il flusso browser, soltanto in un ambiente di sviluppo:

```bash
npm install --no-save playwright
npx playwright install chromium
node tests/browser.mjs
```

Il test avvia e chiude un server Python locale sulla porta 8099, usa un profilo browser isolato con dati fittizi ed esegue le operazioni su quel profilo. Occorre anche Python 3. Per l’uso dell’app basta invece il launcher Python: non sono necessarie queste dipendenze di test.
