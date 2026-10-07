# Officina PWA 1.0 — solo locale

App in italiano per gestire le auto e gli interventi di un meccanico. Un solo progetto utilizzabile su iPhone, Android, tablet e computer. L’icona e la schermata iniziale usano il meccanico creato prendendo la foto fornita come riferimento.

## Avvio sul Mac o PC

1. Estrai lo ZIP in una cartella stabile, per esempio `Officina`.
2. Su Mac puoi usare `Avvia_Officina.command`; in alternativa apri Terminale dentro quella cartella.
3. Esegui:

```bash
python3 avvia_locale.py
```

Su Windows, se il comando si chiama `py`, usa `py avvia_locale.py`. Occorre Python 3. Apri `http://localhost:8080/` se il browser non si apre automaticamente. Mantieni lo stesso indirizzo e la stessa porta: cambiare origine crea un archivio locale separato. Non aprire `index.html` con un doppio clic.

Il server distribuisce soltanto i file dell’app: **non riceve né conserva auto, clienti o interventi**. L’archivio vive in IndexedDB nel browser/app sul dispositivo. Per impostazione predefinita il server ascolta soltanto sul computer (`127.0.0.1`). Nessuna installazione npm è necessaria per usare l’app.

Dopo il primo caricamento completo e l’attivazione del service worker, Officina può riaprirsi e registrare lavori anche senza connessione al server. Verifica questa funzione sul dispositivo prima dell’uso reale. Il codice dell’app deve essere stato caricato e conservato dal browser: aprire lo ZIP sul telefono non basta.

## Utilizzo

- **Auto → Nuova auto:** targa, km, marca, modello, cliente, telefono e note.
- Apri un’auto → **Registra intervento:** data, km e lavori eseguiti. Seleziona almeno una voce o descrivi un lavoro personalizzato.
- **Olio:** motore e trasmissione, tipo/marca/specifica e litri per l’olio motore.
- **Filtri:** tutti, olio, aria, carburante, antipolline, climatizzatore.
- **Lavori:** tutte le voci della foto, più batteria, frizione, sospensioni, diagnosi, convergenza/equilibratura, liquido freni e controllo generale.
- **Ricambi e note:** marche/codici, descrizione e costo facoltativo.
- **Prossimo controllo:** km superiori a quelli dell’intervento e/o data uguale o successiva. La scadenza attiva è quella dell’ultimo intervento per data. Per conservare una vecchia scadenza, riportala nel nuovo intervento.
- **Interventi:** storico globale; ogni auto ha anche il proprio storico.
- **Controlli:** scadenze in km/data; aggiorna i km manuali dell’auto quando torna in officina. Non ci sono notifiche automatiche.
- **Condividi scheda:** testo tramite il menu del dispositivo, oppure scarica `.txt`. Non è una fattura fiscale.
- **Backup:** copia JSON, copia cifrata, ripristino e protezione dell’archivio.

Targhe normalizzate ignorando spazi/trattini/maiuscole. Una targa non può essere duplicata. Km senza punti o virgole (`125000`). Costo e litri accettano virgola o punto decimale con massimo due decimali (`120,50`). I litri dell’olio motore sono facoltativi e, se inseriti, devono essere tra 0,01 e 100. Olio, ricambi e intervalli sono inseriti dal meccanico: l’app non fornisce una banca dati tecnica dei veicoli.

“Antipolline” e “climatizzatore” riprendono le due voci della foto; su alcune auto possono indicare lo stesso componente. Seleziona soltanto ciò che è stato effettivamente fatto.

## Password e backup

L’archivio iniziale è locale e non cifrato. Da **Backup → Attiva cifratura** puoi proteggerlo con una password di almeno 10 caratteri. Viene cifrato l’intero archivio con AES-256-GCM; la chiave è derivata con PBKDF2-SHA256 (310.000 iterazioni, salt casuale). La chiave rimane soltanto nella sessione, non è salvata; ogni salvataggio usa un nuovo IV casuale. La password viene richiesta alla riapertura; puoi bloccare manualmente e l’app si blocca dopo 10 minuti di inattività.

La password **non è recuperabile**. Conservala insieme a un backup esterno sicuro. Usa una password lunga e unica. Una password debole consente tentativi offline se qualcuno ottiene il file cifrato. La cifratura non protegge da un dispositivo compromesso o da codice malevolo eseguito quando l’app è sbloccata. Chiudere o bloccare l’archivio non può garantire la cancellazione fisica di ogni byte già usato dalla memoria del browser.

Il **Backup cifrato** ha una password propria, che può essere diversa da quella dell’archivio. Il **Backup JSON** è in chiaro, anche se l’archivio locale è cifrato. I file esportati non vengono caricati dall’app su alcun servizio: scegli tu dove salvarli. Se scegli iCloud Drive o un altro servizio cloud dal sistema operativo, è il sistema a gestire quell’esportazione.

Ripristinare un backup **sostituisce tutto l’archivio**, non unisce i dati. Sono supportati i backup di questa PWA e quelli della versione iOS SwiftUI consegnata in questa conversazione. Prima della sostituzione vengono validati formato, collegamenti auto/interventi, targhe, campi e limiti; viene conservata una sola copia interna dell’archivio precedente. Puoi esportarla o eliminarla da Backup. Attivare, cambiare o disattivare la cifratura elimina la copia interna precedente per non lasciare vecchie copie con una protezione diversa; i backup già esportati restano a tua cura.

Il ripristino mantiene la cifratura dell’archivio attuale quando questo è sbloccato. Se sostituisci un archivio bloccato/danneggiato con un backup, il nuovo archivio parte senza cifratura locale: potrai riattivarla da Backup. Per importare un backup cifrato serve comunque la sua password. Il vecchio archivio cifrato non viene decifrato durante questo recupero.

Archivio massimo 20 MB; file di backup da importare massimo 32 MB (per includere l’involucro cifrato). Auto: fino a 20.000; interventi: fino a 100.000, sempre entro i 20 MB totali. I dati restano separati per browser, origine, dispositivo e, in alcuni casi, installazione della PWA. Usa sempre la stessa installazione. Per trasferirli usa un backup.

Il browser può cancellare i dati per mancanza di spazio, rimozione dei dati del sito, navigazione privata o disinstallazione. “Richiedi spazio persistente” è una richiesta al browser, non una garanzia. Salva regolarmente una copia esterna. Non usare la navigazione privata per l’archivio operativo.

## iPhone e Android, senza pubblicazione su Internet

Per installare una PWA e usare service worker/cifratura sul telefono serve un **indirizzo HTTPS attendibile**. `http://localhost` sul computer è un’eccezione valida per lo sviluppo; `http://192.168.x.x` sul telefono non è la stessa cosa. Il pacchetto non include un sito pubblico né un account di hosting.

È possibile usare il computer come server nella rete Wi-Fi locale con un certificato attendibile anche dal telefono. Vedi **INSTALLAZIONE_IPHONE_LOCALE.md**. Dopo il caricamento completo aggiungi Officina alla schermata Home. Per aggiornarla occorrerà nuovamente accedere al medesimo indirizzo locale.

## Architettura e sicurezza

- HTML/CSS/JavaScript locali, moduli separati per interfaccia, modello, archivio e cifratura; nessuna libreria esterna in esecuzione.
- IndexedDB con transazione per tutto l’archivio; la schermata viene aggiornata soltanto dopo un salvataggio riuscito.
- Controllo della revisione: un’altra finestra non può sovrascrivere silenziosamente modifiche più recenti.
- Validazione dei backup e dimensioni; i campi sconosciuti non vengono conservati.
- Testi utente escapati prima dell’inserimento nel DOM; nessun `eval`, script inline o gestore evento inline.
- CSP restrittiva, incluso `frame-ancestors 'none'` nell’header del server locale, più `nosniff`, no referrer e blocco camera/microfono/geolocalizzazione.
- Cache offline dedicata e versionata, limitata ai file dell’app. I backup e i dati dei clienti non passano nella cache HTTP.
- Nessun account, telemetria, cookie di tracciamento, database remoto o sincronizzazione.
- Aggiornamenti dell’app proposti all’utente senza forzare il ricaricamento di un modulo aperto.

La struttura riprende il modello PWA/offline/CSP dell’app EASA Part-66 esaminata. L’archivio dei veicoli è stato sviluppato specificamente per Officina.

## Test e sviluppo

Per i test automatici del modello e della cifratura, con Node 20 o successivo:

```bash
npm test
```

Il flusso browser `tests/browser.mjs` richiede Playwright e Chromium, soltanto per sviluppo/test. L’app non dipende da questi strumenti. Consulta **VERIFICHE.md** per risultati reali e limiti delle verifiche.

## Risorse

- Immagine del meccanico: `assets/meccanico.webp`; icone: `assets/icon-180.png`, `icon-192.png`, `icon-512.png`.
- Prompt e modalità di creazione dell’immagine: `PROMPT_ASSET.txt`.
- Guida installazione locale telefono: `INSTALLAZIONE_IPHONE_LOCALE.md`.
- Service worker e contesti sicuri: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- Installazione PWA: https://web.dev/learn/pwa/installation
- Certificati locali: https://github.com/FiloSottile/mkcert
- CSP frame-ancestors: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors

## Report lavori (versione 1.0.2)

Apri una scheda auto o la sezione Interventi e premi **Scarica report**. Puoi scegliere un periodo oppure lasciare le date vuote per tutto lo storico. Il formato HTML include dati auto, cliente, km, lavori, olio, ricambi, note, prossimi controlli e totale dei costi indicati. Aprilo nel browser e usa Stampa per salvarlo in PDF. Il CSV è una tabella per Excel e Numbers. I report vengono generati sul dispositivo. Prima di cambiare installazione conserva sempre un backup JSON; HTML e CSV non sono backup ripristinabili.

## Interventi da fare e ricerca ricambi (1.0.3)

Nella scheda auto usa **Scegli interventi** per salvare olio, filtri e altri lavori da effettuare, più una descrizione libera. Il menu è presente anche in Nuova auto e Modifica auto. I lavori sono proposti nel nuovo intervento; al salvataggio puoi rimuovere dal promemoria soltanto le voci registrate. La modifica di un intervento storico non modifica il promemoria. I lavori ancora da fare non entrano nei report dei lavori effettuati.

**Cerca ricambi online** apre Google, Bing o DuckDuckGo con il pezzo o codice e marca/modello inseriti. Puoi aggiungere anno e motore. La ricerca richiede Internet; i collegamenti non inviano automaticamente targa o dati cliente. I promemoria sono compresi nel backup e nella cifratura locale. I backup precedenti vengono letti senza promemoria.

## Edizione cross platform 1.1.0

La PWA usa lo stesso codice su iPhone/iPad, Android, Windows e Mac. La guida all’installazione è in fondo alla Home, con pulsante di installazione dove disponibile e indicazione della preparazione offline. I dati restano in IndexedDB sul dispositivo. Nessun server riceve clienti o lavori. Il collegamento web distribuisce soltanto i file dell’app.

L’installazione di questa PWA avviene dal browser, senza APK o App Store. Il primo caricamento richiede connessione. L’HTML portatile non è una PWA installabile: usa l’indirizzo HTTPS oppure il server locale del pacchetto. Prima di cambiare indirizzo/browser/installazione esporta il backup JSON e importalo nella nuova app.
