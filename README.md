Installare i pacchetti con: 
```
npm install
```
Avviare l'instanza di mongoDB su docker con: 
```
docker-compose up -d
```

# PROGETTO
App spotify

## Requisiti
- Gestione degli utenti;
- Gestione delle playlist;
- Gestione delle condivisioni;

## To DO

- ~~Registrazione utente (email, nome utente, password, preferenze musicali,  gruppi musicali preferiti)~~
- ~~Creazione di un suo profilo all'interno del "social network"~~
- Gli utenti devono poter: modificare i propri dati/preferenze (creare/modificare/cancellare liste musicali contenenti un elenco di canzoni) e volendo cancellarsi.
- ~~Elenco delle canzoni viene acquisito tramite le API REST di [Spotify](https:////developer.spotify.com/documentation/web-api/reference)~~
- Per ogni canzone vanno gestite: titolo, cantante, genere, durata e anno di pubblicazione
- ~~Per ogni Playlist un utente deve inserire un titolo, una descrizione testuale e uno o più tag descrittivi~~
- ~~Gli utenti posso decidere quale delle playlist da loro composte rendere pubbliche ad altri utenti.~~
- ~~In un'area dedicata gli utenti possono ricercare le playlist pubbliche, visualizzare informazioni e decidere se importarle nel proprio profilo.~~
- ~~La ricerca delle playlist pubbliche deve fornire come criteri di ricerca almeno i tag associati e le canzoni in esse contenute.~~

## Per veder i Dati dentro il container

- docker exec -it mongodb-container /bin/bash
- mongosh "mongodb://127.0.0.1:27017" --username admin --authenticationDatabase admin
- show dbs
- use mydatabase
- show collections
- db.users.find()