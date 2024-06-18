
. Autore: 	Paolo Premoli


1.PRESENTAZIONE DEL PROGETTO

Il progetto si pone l’obbiettivo di sviluppare l’applicazione web “Social Network for Music” (SNM) che implementa un sito di gestione di playlist musicali.
L’applicazione web gestisce il processo di gestione di più utenti che si collegano alla piattaforma, l’organizzazione di playlist musicali e la loro condivisione.
E’ composto da tre macro-scenari principali:
•	gestioni degli utenti
•	gestione delle playlist
•	gestione delle condivisioni

2. PRE-REQUISITI INIZIALI

. clonare il codice sorgente
https://github.com/PaulPremo/snm.git

. navigare all’interno della directory
cd snm
 
. installare i node_modules
npm install

. Aggiungere il file .env alla root della cartella [E’ possibile riferirsi al file .env di esempio qua in basso]

# Spotify API Configuration
CLIENT_ID=”your_spotify_client_id”

CLIENT_SECRET=” your_spotify_client_secret”
# Port
PORT=3000
# MongoDB Configuration parameter
URL_DB=mongodb://admin:password@localhost:27017

DB_NAME=mydatabase
# JWT Secret
JWT_SECRET=”Your_jwt_secret_key”


. Aggiungere il file docker-compose.yml alla root della cartella [E’ possibile riferirsi al file docker-compose.yml di esempio qua in basso]

`
version: '3'
services:
  		mongodb:
    		image: mongo
    		container_name: mongodb-container
    		ports:
      		- "27017:27017"
    		networks:
      		- mongodb-network
    		environment:
      		MONGO_INITDB_ROOT_USERNAME: admin
      		MONGO_INITDB_ROOT_PASSWORD: password
		volumes:
      		- mongodb_data:/data/db  

networks:
  			mongodb-network:

		volumes:
mongodb_data:   

E’ stata aggiunta la definizione del volume direttamente nel file docker-compose così da avere persistenza dei dati

.avviare l’istanza di mongoDB su docker con:
	docker-compose up -p

. avviare il server
node app.js

Ora il sito web è disponibile all’indirizzo:
http//:localhost:3000


3. TECNOLOGIE UTILIZZATE

Le tecnologie utilizzate come da specifica sono HTML5, CSS3, Javascript per il frontend mentre NodeJS e MongoDB per il backend.
Inoltre per la visualizzazione dei dati dal server al client si è ritenuto opportuno utilizzare un template engine Handlebars (HBS)

const exphbs = require('express-handlebars');
app.set('view engine', 'hbs')
const hbs = exphbs.create({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs',
    defaultLayout: 'index_noauth',
    partialsDir: __dirname + '/views/partials/'
});
app.engine('hbs', hbs.engine);


4. STRUTTURA DEL PROGETTO – BACKEND-
Come detto, il backend è stato realizzato con il framework NodeJS di Javascript. E’ stata utilizzata la libreria Express per gestire le richieste e le risposte http, il routing e il middleware.
Come da specifica del progetto, è stato utilizzato MongoDB come Database. 
Sono state create due collezioni:

1)	User:
vengono memorizzate tutte le informazioni e i dati dell’utente che si sono registrati all’applicazione. Ogni document possiede i seguenti campi:

•	_id: di tipo string contenente l’ObjectID dell’utente [questo campo è univoco]
•	name: di tipo string contenente il nome [username] dell’utente
•	email: di tipo string contenente la mail dell’utente [questo campo è univoco]
•	password: di tipo string contenente l’hash della password dell’utente
•	genres: [array di tipo string contenente i generi musicali preferiti dell’utente scelti in fase di registrazione]
•	tags: [array di tipo string contenente i tags preferiti dall’utente scelti in fase di registrazione]
•	playlist: [array di tipo string contenente gli ID delle playlist associate all’utente. Ogni cella dell’array è anch’essa un array se la playlist contiene più di una canzone]

Qua sotto è presente un’immagine che fotografa il contenuto della collezione user  raggiungibile all’indirizzo http://localhost:3000/user  ad un certo istante di tempo t. 
La collezione presenta 5 utenti ed è ben visibile la struttura della collezione con i relativi campi. 
 
E’ possibile anche raggiungere tale collezione direttamente dal terminale di docker attraverso i seguenti comandi:
> docker exec -it mongodb-container /bin/bash
> mongosh "mongodb://127.0.0.1:27017" --username admin --authenticationDatabase admin
> show dbs
> use mydatabase
> show collections
> db.users.find()

2)	Playlist:
vengono memorizzate tutte le informazioni specifiche della playlist, comprese le canzoni facente parte della playlist e le informazioni dell’utente associato alla playlist.
Ogni document possiede i seguenti campi: 

•	_id: di tipo string contenente l’ObjectID della playlist [questo campo rappresenta la chiave primaria della collezione]
•	name: di tipo string contenente il nome della playlist
•	tags: di tipo string contenente i tags associati alla playlist separati dalla virgola
•	description: di tipo string contenente la descrizione della playlist
•	tracks: [array contenente le canzoni associate alla playlist. Ogni cella dell’array è a sua volta un array con i seguenti campi :
o	artist: di tipo string contenente il nome dell’autore della canzone,
o	name: di tipo string contenente il titolo della canzone,
o	img_url: link all’immagine della canzone,
o	spotify_url: link per ascoltare la canzone su spotify, 
o	duration_ms: durata della canzone espressa in millisecondi]
•	public_playlist:  di tipo string contenente il valore true se la playlist è pubblica 
•	user_email: di tipo string contenente la mail dell’utente a cui è associata la playlist

Qua sotto è presente un’immagine che fotografa il contenuto della collezione user  raggiungibile all’indirizzo http://localhost:3000/playlist  ad un certo istante di tempo t. 
La collezione presenta 2 playlist salvate ed è ben visibile la struttura della collezione con i relativi campi. E’ possibile ben notare come il campo tracks della collezione rappresenta a sua volta un vettore contenente vettori che rappresentano le canzoni contenute nella playlist.
 
E’ possibile anche raggiungere tale collezione direttamente dal terminale di docker attraverso i seguenti comandi:
> docker exec -it mongodb-container /bin/bash
> mongosh "mongodb://127.0.0.1:27017" --username admin --authenticationDatabase admin
> show dbs
> use mydatabase
> show collections
> db.playlist.find()

5. STRUTTURA DEL PROGETTO – FRONTEND-
Il progetto è organizzato in pagine, la cui navigazione è gestita lato server mentre lato client è presente una navbar per permettere lo spostamento tra le pagine.
Essendo l’applicazione un social network, è stato inserito del codice di stile CSS tipo facebook ed è stato inserito separatamente su ogni pagina hbs racchiuso dal tag <style>.
Ogni pagina viene popolata dinamicamente.
All’interno del progetto sono presenti le seguenti pagine:
1)	/home.hbs: Pagina iniziale dove è possibile cercare le playlist pubbliche e visualizzarle in stile card.
2)	/login.hbs : Pagina dove è possibile loggarsi all’applicazione.
3)	/playlist.hbs: Pagina dove è possibile creare una playlist ed aggiungere una canzone ad una playlist già esistente.
4)	/profilo.hbs: Pagina dove è possibile gestire le informazioni dell’utente. E’ possibile inoltre modificare tali informazioni e cancellare il proprio account.
5)	/register.hbs: Pagina dove è possibile creare un account.
All’interno delle pagine sono state inserite anche le relative funzioni javascript all’interno del tag <script>

6. SCELTE IMPLEMENTATIVE
1)	Si è scelto di salvare le informazioni dell’utente uno volta che ha fatto il login nei cookies cosi da facilitare in un secondo momento il loro prelievo e poterli poi usare direttamente nella sessione. Ciò ha parecchi vantaggi come:
a.	Persistenza della sessione: Utilizzare i cookie consente di mantenere la sessione dell'utente attiva anche dopo che ha chiuso il browser o ha navigato via dalla pagina. Questo significa che l'utente non deve eseguire nuovamente l'accesso ogni volta che visita il sito web.
b.	Personalizzazione dell'esperienza utente: I cookie possono anche essere utilizzati per memorizzare preferenze utente e altre informazioni personalizzate, migliorando così l'esperienza dell'utente sul sito.
c.	Supporto per l'autenticazione multipla: L'uso dei cookie può semplificare il processo di autenticazione nei sistemi in cui un utente può accedere da più dispositivi o browser, senza richiedere che l'utente inserisca le credenziali più volte.
Tuttavia, sono presenti anche dei rischi associati alla memorizzazione dei dati di login nei cookie, come ad esempio:
a.	Sicurezza: I cookie possono essere soggetti a furti o attacchi di tipo "cookie hijacking" se non vengono gestiti correttamente. Le informazioni sensibili, come le credenziali di accesso, devono essere crittografate e protette adeguatamente.
b.	Privacy: Memorizzare le credenziali di accesso nei cookie può sollevare preoccupazioni sulla privacy degli utenti, specialmente se i cookie non vengono gestiti correttamente o se vengono utilizzati per tracciare il comportamento dell'utente senza il loro consenso.
 I dati salvati nei cookies sono:
o	il jwt token [JWT token]
o	l’user id [ID]
o	il nome utente [name]
o	la mail dell’utente [email]
o	i generi preferiti dell’utente [genres]
o	il client spotify ID [spotify_client_id]
o	il client spotify secret ID [spotify_client_secret] 
E’ stata fatta questa scelta per una praticità di programmazione e per avere facilmente accesso a tali informazioni.

2)	Sono stati inseriti controlli sulla password al momento della registrazione. I controlli sono effettuati sia sulla complessità (deve possedere lettere minuscole e lettere maiuscole) che sulla lunghezza (almeno8 caratteri).
3)	Sono stati inseriti controlli sulla validità dell’indirizzo email al momento della registrazione. La email deve essere una mail valida.

4)	Si è scelto di usare la libreria bcrypt per l’hashing della password.
La libreria bcrypt è una libreria per la crittografia utilizzata principalmente per l'hashing sicuro delle password. Essa fornisce un modo sicuro e robusto per proteggere le password all'interno delle applicazioni.
I punti di forza della libreria riguardano:
a.	Hashing sicuro delle password: bcrypt prende una password in chiaro e la trasforma in un hash crittograficamente sicuro utilizzando un algoritmo di hashing sicuro. L'hash risultante è una stringa di caratteri casuale e univoca che rappresenta in modo univoco la password originale.
b.	Salting delle password: Bcrypt incorpora automaticamente il concetto di "salt" nelle sue operazioni di hashing. Il salt è una stringa casuale che viene concatenata alla password prima dell'hashing. Questo rende ogni hash unico anche per le password uguali, aumentando la sicurezza complessiva del sistema.
c.	Costi di calcolo configurabili: Bcrypt permette di configurare il numero di "rounds" (giri) dell'algoritmo di hashing. Più alto è il numero di giri, maggiore è il tempo necessario per calcolare l'hash di una password. Questo rende più difficile per gli attaccanti eseguire attacchi di forza bruta o di dizionario sulle password.
d.	Verifica delle password: Bcrypt fornisce anche una funzione per la verifica delle password. Prende una password in chiaro e l'hash memorizzato nel database e determina se corrispondono. Questo è cruciale per il processo di autenticazione degli utenti, poiché consente di verificare se la password fornita è corretta senza mai memorizzare la password stessa in chiaro.
In fase di registrazione, la password dell’utente è stata hashata nel seguente modo:
const hashedPassword = await bcrypt.hash(password, saltRounds);
o	Salt: rappresenta il numero di giri per la generazione del salt. Il salt è una stringa casuale che viene combinata con la password dell’utente per creare l’hash.
	Questo passo è fondamentale per prevenire attacchi con dizionario e attacchi di tipi rainbow table che sono tecniche utilizzate per decifrare l’hash.
	E’ stato scelto di usare un numero di giri per la generazione del salt pari a 10.
o	Hashing: Dopo aver generato il salt, la password viene effettivamente hashata combinandola con il salt. L’hash risultate viene poi salvato nel campo del password del nuovo utente creato e salvata nel database.

5)	E’ stato scelto di utilizzare un motore di visualizzazione diverso rispetto all’HTML classico del DOM bensì Handlebars. 
Handlebars è un motore di visualizzazione molto comune  nello sviluppo di applicazioni web perché semplifica e velocizza la fase di sviluppo. Inoltre ha ulteriori vantaggi per quanto riguarda la manutenzione del codice.

7. FUTURI SVILUPPI
I futuri sviluppi dell’app sono molteplici e potrebbero essere quelli di:
1)	implementare la ricerca di canzoni all’interno della playlist
2)	migliorare lo stile CSS delle varie pagine
3)	migliorare i messaggi di errore
4)	…
