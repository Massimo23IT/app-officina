# Officina

PWA cross platform per gestire auto, interventi e manutenzione di un’officina.

Versione 1.1.0. Dati salvati solo sul dispositivo con IndexedDB, modalità offline, promemoria interventi, report HTML/CSV, ricerca ricambi e backup opzionalmente cifrati.

## Aprire l’app

App online: https://officina-auto-manutenzione.maxdan01.chatgpt.site (accesso privato).

Per l’avvio sul computer: `python3 avvia_locale.py`. Per installare su iPhone/iPad, Android, Windows e Mac usare l’indirizzo HTTPS e seguire la guida in fondo alla Home. Il pacchetto non contiene APK o IPA.

## Sviluppo e verifiche

`npm test` esegue i test unitari. `tests/browser.mjs` contiene il QA di integrazione con Playwright. I file in `dist/` costituiscono la distribuzione statica; i moduli sorgente sono nella radice.

Vedi LEGGIMI.md e INSTALLAZIONE_IPHONE_LOCALE.md. Prima di cambiare dispositivo o installazione esportare un backup JSON.

Il repository è privato. Il codice distribuito al browser è comunque accessibile agli utenti autorizzati dell’app.
