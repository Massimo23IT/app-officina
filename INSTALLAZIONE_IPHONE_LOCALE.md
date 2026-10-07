# Officina su iPhone nella rete locale

L’archivio resterà sul telefono. Il Mac/PC servirà solamente a distribuire i file dell’app durante il primo caricamento e gli aggiornamenti. Non è prevista sincronizzazione con il computer.

## Primo test sul computer

Avvia `python3 avvia_locale.py`, apri `http://localhost:8080/` e prova l’auto dimostrativa. Questo indirizzo funziona soltanto sul computer che esegue il server. Sul telefono “localhost” indica il telefono stesso.

## HTTPS nella stessa Wi-Fi

Occorrono Python 3 e `mkcert` sul computer, e un certificato radice locale installato e attendibile sul telefono. Usa soltanto certificati generati sul tuo computer. Non aprire porte sul router e non esporre questo server a Internet.

1. Installa `mkcert` dal progetto ufficiale: https://github.com/FiloSottile/mkcert . Su Mac, se hai già Homebrew, il comando è `brew install mkcert`.
2. Trova l’indirizzo IP LAN del computer dalle impostazioni di rete. Nell’esempio è `192.168.1.50`: sostituiscilo con quello reale. Mantienilo stabile, per esempio con una prenotazione DHCP sul router, per non cambiare l’origine dell’archivio.
3. Dalla cartella dell’app esegui:

```bash
mkcert -install
mkcert -cert-file officina-cert.pem -key-file officina-key.pem localhost 127.0.0.1 192.168.1.50
mkcert -CAROOT
```

4. L’ultimo comando indica la cartella della CA. Trasferisci sul tuo iPhone **soltanto `rootCA.pem`**, per esempio con AirDrop. Non condividere `rootCA-key.pem` né `officina-key.pem` e non includerli in un ZIP dell’app. La chiave privata della CA consente di emettere certificati attendibili dai dispositivi configurati.
5. Su iPhone installa il profilo del certificato ricevuto da Impostazioni → Profilo scaricato. Poi abilita l’attendibilità del certificato in Impostazioni → Generali → Info → Impostazioni attendibilità certificati. I nomi possono variare secondo la versione iOS. Guida Apple: https://support.apple.com/102390 .
6. Avvia il server HTTPS:

```bash
python3 avvia_locale.py --host 0.0.0.0 --port 8443 --cert officina-cert.pem --key officina-key.pem --no-browser
```

7. Collega telefono e computer alla stessa Wi-Fi. Su Safari dell’iPhone apri `https://192.168.1.50:8443/`, sostituendo l’IP. Se il firewall del computer chiede accesso, limita il consenso alla rete privata. Se compare un errore di certificato, controlla IP incluso nel certificato e attendibilità della CA; non considerare l’installazione completata finché HTTPS non è attendibile.
8. Attendi che l’app venga caricata, quindi Safari → Condividi → Aggiungi alla schermata Home. Apri la nuova icona Officina.
9. Aggiungi l’auto di esempio, chiudi l’app, spegni il server e riapri Officina: verifica il funzionamento offline. Prova anche a salvare un intervento e a esportare un backup in File.

Puoi lasciare il server spento durante l’uso offline dopo il primo caricamento riuscito. Per gli aggiornamenti riaccendilo allo stesso indirizzo. Cambiare protocollo, IP o porta crea una nuova origine: esporta prima un backup se devi cambiarli.

Su Android il principio è lo stesso: installa come attendibile la CA generata da te secondo le impostazioni del dispositivo, apri l’indirizzo HTTPS in Chrome e usa Installa app / Aggiungi alla schermata Home. I menu e le politiche sui certificati possono variare.

## Dati separati

La scheda inserita sull’iPhone non compare automaticamente sul Mac o su un altro telefono. Per trasferire lo storico usa Backup → Esporta e Backup → Importa. Anche Safari e l’app installata possono avere archivi distinti: usa sempre la stessa installazione e controlla i conteggi prima di inserire dati reali.

## Se vuoi evitare certificati locali

Puoi distribuire i soli file statici dell’app da un indirizzo HTTPS, mantenendo comunque tutto l’archivio sul dispositivo. Questo richiede hosting del codice dell’app; in questa consegna non è stata eseguita alcuna pubblicazione. Per un’installazione nativa diretta senza indirizzo HTTPS occorre invece un pacchetto firmato per iOS/Android.
