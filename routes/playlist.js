const express = require('express');
const dotenv = require('dotenv')
dotenv.config({ path: './.env'})
const { MongoClient, ObjectId } = require('mongodb');
const url = process.env.URL_DB; // URL di connessione a MongoDB
const dbName = process.env.DB_NAME; // Nome del database

const router = express.Router();

// Create a new playlist
router.post('/', async (req, res) => {
    const { name, tags, description, tracks, public_playlist, user_email } = req.body;
    // Validazione dei campi
    if (!name || !tracks ) {
        //TODO modificare il render non a "register"
        return res.render('register', {
            message: 'Tutti i campi sono obbligatori'
        })
    }
    // Creazione del client MongoDB
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect(); // Connessione al database
        const db = client.db(dbName); // Selezione del database
        const playlistCollection = db.collection('playlist');

        // Creazione di una playlist
        const newPlaylist = {
            name,
            tags,
            description,
            tracks,
            public_playlist,
            user_email
        };
        console.log(newPlaylist)
        // Inserimento del nuovo utente nella collezione
        const result = await playlistCollection.insertOne(newPlaylist);

        // Ottieni l'ID appena inserito
        const playlistId = result.insertedId;
        console.log(playlistId)
        // Puoi restituire una risposta di successo
        res.json({playlistId});
        //res.send(result);
        //res.redirect('/protected/home');
    } catch (error) {
        console.error('Errore durante la creazione della playlist:', error);
        res.status(500).json({ message: "Errore durante la creazione della playlist" });
    } finally {
        // Chiudi la connessione quando hai finito le operazioni
        await client.close();
    }
});

router.get('/', async (req, res) => {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const db = client.db(dbName);
        const playlistCollection = db.collection('playlist');
        const playlist = await playlistCollection.find();
        // Converti il cursore in un array di documenti
        const allDocuments = await playlist.toArray();
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

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, tags, description, tracks, public_playlist, user_email } = req.body;

    // Creazione del client MongoDB
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const db = client.db(dbName);
        const playlistCollection = db.collection('playlist');

        // Verifica se l'utente esiste già
        const existingPlaylist = await playlistCollection.findOneAndUpdate(  { _id: new ObjectId(id) }, // Supponendo che `id` sia l'ID univoco del documento
            { $set: { name, tags, description, tracks, public_playlist, user_email } },
            {returnDocument: 'after' } // Opzione per restituire il documento aggiornato
        );
        res.send(existingPlaylist);
    } catch (error) {
        console.error('Errore durante l\'update:', error);
        res.status(500).json({ message: "Errore durante l\'update" });
    } finally {
        // Chiudi la connessione quando hai finito le operazioni
        await client.close();
    }
});

router.patch('/:id', async (req, res) => {
    const { id } = req.params;

    // Creazione del client MongoDB
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const db = client.db(dbName);
        const playlistCollection = db.collection('playlist');

        // Verifica se la playlist esiste già
        const existingPlaylist = await playlistCollection.findOne({ _id: new ObjectId(id) });

        if (!existingPlaylist) {
            return res.status(404).json({ message: 'Playlist non trovata' });
        }

        // Estrai solo i campi presenti nella richiesta
        const { name, tags, description, tracks, public_playlist, user_email } = req.body;
        const updateFields = {};

        if (name) updateFields.name = name;
        if (tags) updateFields.tags = tags;
        if (description) updateFields.description = description;
        if (tracks) updateFields.tracks = tracks;
        if (public_playlist !== undefined) updateFields.public_playlist = public_playlist;
        if (user_email) updateFields.user_email = user_email;

        // Aggiorna solo i campi presenti nella richiesta
        const updatedPlaylist = await playlistCollection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateFields },
            { returnDocument: 'after' }
        );

        res.json(updatedPlaylist);
    } catch (error) {
        console.error('Errore durante l\'update:', error);
        res.status(500).json({ message: 'Errore durante l\'update' });
    } finally {
        // Chiudi la connessione quando hai finito le operazioni
        await client.close();
    }
});


router.patch('/update/:id', async (req, res) => {
    const { id } = req.params;

    // Create MongoDB client
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const db = client.db(dbName);
        const playlistCollection = db.collection('playlist');

        // Check if the playlist exists
        const existingPlaylist = await playlistCollection.findOne({ _id: new ObjectId(id) });

        if (!existingPlaylist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        // Extract fields from the request
        const { tracks } = req.body;

        // Add new tracks to the existing playlist
        const updatedPlaylist = await playlistCollection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $push: { tracks: { $each: tracks } } }, // Add new tracks to the existing ones
            { returnDocument: 'after' }
        );

        res.json(updatedPlaylist);
    } catch (error) {
        console.error('Error during update:', error);
        res.status(500).json({ message: 'Error during update' });
    } finally {
        // Close the connection when finished
        await client.close();
    }
});


router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const db = client.db(dbName);
        const playlistCollection = db.collection('playlist');
        const existingPlaylist = await playlistCollection.findOneAndDelete(  { _id: new ObjectId(id) }
        );
        res.send(existingPlaylist);
    } catch (error) {
        console.error('Errore durante la delete:', error);
        res.status(500).json({ message: "Errore durante la delete" });
    } finally {
        // Chiudi la connessione quando hai finito le operazioni
        await client.close();
    }
});

router.get('/:email', async (req, res) => {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const db = client.db(dbName);
        const playlistCollection = db.collection('playlist');

        // Estrai l'email dal parametro della richiesta
        const userEmail = req.params.email;

        // Esegui la query per ottenere solo le playlist dell'utente con l'email specificata
        const userPlaylists = await playlistCollection.find({ user_email: userEmail });

        // Converti il cursore in un array di documenti
        const userPlaylistDocuments = await userPlaylists.toArray();

        // Puoi restituire una risposta di successo
        res.send(userPlaylistDocuments);
    } catch (error) {
        console.error('Errore:', error);
        res.status(500).json({ message: "Errore" });
    } finally {
        // Chiudi la connessione quando hai finito le operazioni
        await client.close();
    }
});

router.get('/id/:playlistId', async (req, res) => {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const db = client.db(dbName);
        const playlistCollection = db.collection('playlist');

        // Estrai l'id della playlist dal parametro della richiesta
        const playlistId = req.params.playlistId;

        // Esegui la query per ottenere la playlist con l'id specificato
        const playlist = await playlistCollection.findOne({ _id: new ObjectId(playlistId) });

        // Puoi restituire una risposta di successo
        res.send(playlist);
    } catch (error) {
        console.error('Errore:', error);
        res.status(500).json({ message: "Errore" });
    } finally {
        // Chiudi la connessione quando hai finito le operazioni
        await client.close();
    }
});

module.exports = router;