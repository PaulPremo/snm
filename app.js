const express = require('express');
const path = require("path");
const publicDir = path.join(__dirname, './public');
const dotenv = require('dotenv')
const bcrypt = require("bcryptjs")
dotenv.config({ path: './.env'})
const MongoClient = require('mongodb').MongoClient;
const saltRounds = 10; // Numero di giri per la generazione del salt
const url = process.env.URL_DB; // URL di connessione a MongoDB
const dbName = process.env.DB_NAME; // Nome del database
const spotify_client_id = process.env.CLIENT_ID;
const spotify_client_secret = process.env.CLIENT_SECRET; // Nome del database
const routes_user = require('./routes/user.js');
const routes_playlist = require('./routes/playlist.js');
const secret = process.env.JWT_SECRET
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');
const axios = require('axios'); //

const app = express();
app.set('view engine', 'hbs')
app.use(express.static('public'));

const hbs = exphbs.create({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs',
    defaultLayout: 'index_noauth',
    partialsDir: __dirname + '/views/partials/'
});

app.engine('hbs', hbs.engine);

app.use(express.urlencoded({extended: 'false'}))
app.use(express.json())
app.use(cookieParser());
app.use('/user', routes_user);
app.use('/playlist', routes_playlist);

// caching disabled for every route
app.use(function(req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});

const jwt = require('jsonwebtoken');

// Funzione per generare il token JWT
const generateToken = (user) => {
    const token = jwt.sign({ userId: user._id, email: user.email }, secret, { expiresIn: '1h' });
    return token;
};

// Funzione per verificare il token JWT
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
};
app.get('/', (req, res) => {
    res.render('home', {layout: 'index_noauth', title: 'Home Page'});
});
app.get("/login", (req, res) => {
    res.render('login',{layout: 'index_noauth', title: 'Login Page'})
})
app.get("/register", (req, res) => {
    res.render('register',{layout: 'index_noauth', title: 'Register Page'})
})

const authenticateToken = (req, res, next) => {
    const token = req.cookies.jwt; // Leggi il token dai cookie
    if (!token) return res.redirect('/');

    const decoded = verifyToken(token);
    if (!decoded) return res.redirect('/');

    // E' possibile aggiungere il payload JWT all'oggetto della richiesta per usarlo nelle route successive
    req.user = decoded;

    next();
};

// Aggiungi il middleware alle tue route protette
app.use('/protected', authenticateToken);

app.get("/protected/profilo", (req, res) => {
    // E' possibile accedere all'utente autenticato tramite req.user
    const userCookie = req.cookies;
    const userData = userCookie ? userCookie : null;
    res.render("profilo", {layout: 'index_auth', title: 'Profile Page', user: userData});
});

app.get("/protected/playlist", (req, res) => {
    // E' possibile accedere all'utente autenticato tramite req.user
    const userCookie = req.cookies;
    const userData = userCookie ? userCookie : null;
    res.render("playlist", {layout: 'index_auth', title: 'Playlist Page', user: userData});
});

/**
 * app.get("/protected/home", async (req, res) => {
 *     try {
 *         // Effettua la chiamata API a http://localhost:3000/playlist
 *         const apiResponse = await axios.get('http://localhost:3000/playlist');
 *
 *         // Estrai i dati dalla risposta API
 *         const playlistData = apiResponse.data;
 *         console.log(playlistData)
 *         // E' possibile accedere all'utente autenticato tramite req.user
 *         const userCookie = req.cookies;
 *         const userData = userCookie ? userCookie : null;
 *
 *         // Passa i dati della playlist nel rendering della pagina
 *         res.render("home", { layout: 'index_auth', title: 'Home Page', user: userData, playlist: playlistData, listExists: true });
 *     } catch (error) {
 *         // Gestisci eventuali errori durante la chiamata API
 *         console.error('Errore nella chiamata API:', error.message);
 *         res.status(500).send('Errore interno del server');
 *     }
 * });
 */
app.get("/protected/home", (req, res) => {
    // Puoi accedere all'utente autenticato tramite req.user
    const userCookie = req.cookies;
    const userData = userCookie ? userCookie : null;
    res.render("home", { layout: 'index_auth', title: 'Home Page', user: userData});
});

app.post("/auth/register", async (req, res) => {
    const { name, email, password, password_confirm, genres, tags } = req.body;
    // Validazione dei campi
    if (!name || !email || !password || !password_confirm || !genres || !tags) {
        return res.render('register', {
            message: 'Tutti i campi sono obbligatori'
        })
    }

    //validate email format
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var isEmailValid = emailPattern.test(email);
    if (isEmailValid==false){
        return res.render('register', {
            message: 'L email deve avere un formato valido'
        }); 
    }

    //validate password complexity and lenght
    var passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/;
    var isPasswordValid = passwordPattern.test(password);
    if(isPasswordValid==false && password.length<=8 ){
        return res.render('register', {
            message: 'Inserire una password di lunghezza almeno 8 caratteri che abbia maiuscole e minuscole per la tua sicurezza! !'
        });
    }

    if (password !== password_confirm) {
        return res.render('register', {
            message: 'Le password non corrispondono!'
        });
    }

    // Creazione del client MongoDB
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // Connessione al database
        await client.connect();

        console.log('Connessione al database avvenuta con successo');

        // Selezione del database
        const db = client.db(dbName);

        // Selezione della collezione (tabella) utenti
        const usersCollection = db.collection('users');

        // Verifica se l'utente esiste già
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.render('register', {
                message: 'L\'utente con questa email esiste già'
            })
        }

        // Hash della password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Creazione di un nuovo utente
        const newUser = {
            name,
            email,
            password: hashedPassword,
            genres,
            tags
        };
        console.log(newUser)
        // Inserimento del nuovo utente nella collezione
        const result = await usersCollection.insertOne(newUser);

        // Puoi restituire una risposta di successo
        
                  res.render('register', {
                      message: 'Registrazione avvenuta con successo'
                  })

        return res.redirect('/login');
    } catch (error) {
        console.error('Errore durante la registrazione:', error);
        res.status(500).json({ message: "Errore durante la registrazione" });
    } finally {
        // Chiudi la connessione quando hai finito le operazioni
        await client.close();
    }
});
app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;

    // Validazione dei campi
    if (!email || !password) {
        return res.render('login',{ message: "Email e password sono obbligatori" });
    }

    // Creazione del client MongoDB
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // Connessione al database
        await client.connect();

        console.log('Connessione al database avvenuta con successo');

        // Selezione del database
        const db = client.db(dbName);

        // Selezione della collezione (tabella) utenti
        const usersCollection = db.collection('users');

        // Recupero dell'utente dalla collezione
        const user = await usersCollection.findOne({ email });

        if (user) {
            // Verifica dell'hash della password
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                const token = generateToken(user);
                console.log('Login avvenuto con successo:', user, token);
                // Salva il token nel localStorage del browser
                res.cookie('jwt', token, { httpOnly: true });
                res.cookie('id_app', user._id);
                res.cookie('name', user.name);
                res.cookie('email', user.email);
                res.cookie('genres', user.genres);
                res.cookie('spotify_client_id', spotify_client_id);
                res.cookie('spotify_client_secret', spotify_client_secret);

                return res.redirect('/protected/home');
            } else {
                console.log('Credenziali non valide');
                res.render('login',{ message: "Credenziali non valide" });
            }
        } else {
            console.log('Credenziali non valide');
            res.render('login',{ message: "Credenziali non valide" });
        }
    } catch (error) {
        console.error('Errore durante il login:', error);
        res.render('login',{ message: "Errore durante il login" });
    } finally {
        // Chiudi la connessione quando hai finito le operazioni
        await client.close();
    }
});

app.get('/auth/logout', (req, res) => {
    // Rimuovi il cookie contenente il token
    //res.clearCookie('jwt');
    // Ottieni la lista dei cookie dalla richiesta
    const cookies = req.cookies;
    // Elimina tutti i cookie uno per uno
    for (const cookieName in cookies) {
        res.clearCookie(cookieName);
    }
    res.redirect('/');
});


app.listen(process.env.PORT, () => {
    console.log("Server listen on port http://localhost:" + process.env.PORT)
})
