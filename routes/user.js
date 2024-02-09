const express = require('express');
const bcrypt = require("bcryptjs");
const dotenv = require('dotenv')
dotenv.config({ path: './.env'})
const { MongoClient, ObjectId } = require('mongodb');
const saltRounds = 10; // Numero di giri per la generazione del salt
const url = process.env.URL_DB; // URL di connessione a MongoDB
const dbName = process.env.DB_NAME; // Nome del database

const router = express.Router();

// Create a new user
router.post('/', async (req, res) => {
    const { name, email, password, password_confirm, genres, tags, playlist } = req.body;
    // Validazione dei campi
    if (!name || !email || !password || !password_confirm || !genres || !tags) {
        return res.render('register', {
            message: 'Tutti i campi sono obbligatori'
        })
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
            tags,
            playlist
        };
        console.log(newUser)
        // Inserimento del nuovo utente nella collezione
        const result = await usersCollection.insertOne(newUser);

        // Puoi restituire una risposta di successo
        res.send(newUser);
    } catch (error) {
        console.error('Errore durante la registrazione:', error);
        res.status(500).json({ message: "Errore durante la registrazione" });
    } finally {
        // Chiudi la connessione quando hai finito le operazioni
        await client.close();
    }
});

// Get all users
router.get('/', async (req, res) => {
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
        const users = await usersCollection.find();
        // Converti il cursore in un array di documenti
        const allDocuments = await users.toArray();
        // Puoi restituire una risposta di successo
        res.send(allDocuments);
    } catch (error) {
        console.error('Errore:', error);
        res.status(500).json({ message: "Errore" });
    } finally {
        // Chiudi la connessione quando hai finito le operazioni
        await client.close();
    }
});

// Get user Playlist
router.get('/:userId', async (req, res) => {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // Connessione al database
        await client.connect();

        console.log('Connessione al database avvenuta con successo');

        // Selezione del database
        const db = client.db(dbName);

        // Selezione della collezione (tabella) utenti
        const usersCollection = db.collection('users');

        // Ottieni l'id dell'utente dalla richiesta
        const userId = req.params.userId;

        // Verifica se l'utente esiste già
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(404).json({ message: "Utente non trovato" });
        }

        // Restituisci solo il campo "playlist" dell'utente
        res.json({ playlist: user.playlist });
    } catch (error) {
        console.error('Errore:', error);
        res.status(500).json({ message: "Errore" });
    } finally {
        // Chiudi la connessione quando hai finito le operazioni
        await client.close();
    }
});

// Update a user
router.put('/id/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, genres, tags, playlist } = req.body;

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
        const existingUser = await usersCollection.findOneAndUpdate(  { _id: new ObjectId(id) }, // Supponendo che `id` sia l'ID univoco del documento
            { $set: { name, email, genres, tags, playlist } },
            {returnDocument: 'after' } // Opzione per restituire il documento aggiornato
        );
        res.send(existingUser);
    } catch (error) {
        console.error('Errore durante l\'update:', error);
        res.status(500).json({ message: "Errore durante l\'update" });
    } finally {
        // Chiudi la connessione quando hai finito le operazioni
        await client.close();
    }
});

router.patch('/id/:id', async (req, res) => {
    const { id } = req.params;

    // Creazione del client MongoDB
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // Connessione al database
        await client.connect();

        // Selezione del database
        const db = client.db(dbName);

        // Selezione della collezione (tabella) utenti
        const usersCollection = db.collection('users');

        // Verifica se l'utente esiste già
        const existingUser = await usersCollection.findOne({ _id: new ObjectId(id) });

        if (!existingUser) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        // Estrai solo i campi presenti nella richiesta
        const { name, email, genres, tags, playlist } = req.body;
        const updateFields = {};

        if (name) updateFields.name = name;
        if (email) updateFields.email = email;
        if (genres) updateFields.genres = genres;
        if (tags) updateFields.tags = tags;
        if (playlist) updateFields.playlist = playlist;

        // Aggiorna solo i campi presenti nella richiesta
        const updatedUser = await usersCollection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateFields },
            { returnDocument: 'after' }
        );

        res.json(updatedUser);
    } catch (error) {
        console.error('Errore durante l\'update:', error);
        res.status(500).json({ message: 'Errore durante l\'update' });
    } finally {
        // Chiudi la connessione quando hai finito le operazioni
        await client.close();
    }
});


// Delete a user
router.delete('/id/:id', async (req, res) => {
    const { id } = req.params;

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
        const existingUser = await usersCollection.findOneAndDelete(  { _id: new ObjectId(id) }
        );
        res.send(existingUser);
    } catch (error) {
        console.error('Errore durante la delete:', error);
        res.status(500).json({ message: "Errore durante la delete" });
    } finally {
        // Chiudi la connessione quando hai finito le operazioni
        await client.close();
    }
});

router.get('/email/:email', async (req, res) => {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // Connessione al database
        await client.connect();

        console.log('Connessione al database avvenuta con successo');

        // Selezione del database
        const db = client.db(dbName);

        // Selezione della collezione (tabella) utenti
        const usersCollection = db.collection('users');

        // Ottenere l'email dalla richiesta
        const userEmail = req.params.email;

        // Trova l'utente con l'email specifica
        const user = await usersCollection.findOne({ email: userEmail });

        // Verifica se l'utente esiste
        if (user) {
            // Restituisci l'utente trovato
            res.json(user);
        } else {
            // Se l'utente non esiste, restituisci una risposta di errore
            res.status(404).json({ message: "Utente non trovato" });
        }
    } catch (error) {
        console.error('Errore:', error);
        res.status(500).json({ message: "Errore" });
    } finally {
        // Chiudi la connessione quando hai finito le operazioni
        await client.close();
    }
});

router.get('/id/:id', async (req, res) => {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // Connessione al database
        await client.connect();

        console.log('Connessione al database avvenuta con successo');

        // Selezione del database
        const db = client.db(dbName);

        // Selezione della collezione (tabella) utenti
        const usersCollection = db.collection('users');

        // Ottenere l'ID dalla richiesta
        const userId = req.params.id;

        // Verifica se l'ID è valido
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "ID utente non valido" });
        }

        // Trova l'utente con l'ID specifico
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

        // Verifica se l'utente esiste
        if (user) {
            // Restituisci l'utente trovato
            res.json(user);
        } else {
            // Se l'utente non esiste, restituisci una risposta di errore
            res.status(404).json({ message: "Utente non trovato" });
        }
    } catch (error) {
        console.error('Errore:', error);
        res.status(500).json({ message: "Errore" });
    } finally {
        // Chiudi la connessione quando hai finito le operazioni
        await client.close();
    }
});



module.exports = router;