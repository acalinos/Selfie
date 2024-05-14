// Importo il modulo express e creo un nuovo router
const express = require('express');
const router = express.Router();

// Importo User e Post da userDetails, i quali rappresentano i dettagli degli utenti e dei post
const { User, Event, Task, Note } = require('./details.js');

// Funzioni di backend relative alla gestione degli utenti

// Funzione asincrona per la registrazione di un nuovo utente
router.post("/registrazione", async (req, res) => {
    const { fullname, username, password, number } = req.body
    const existingUser = await User.findOne({
        username: username
    })
    try {
        if (!existingUser) {
            await User.create({
                fullname: fullname,
                username: username,
                password: password,
                number: number
            })
            res.json("success")
        }
        else {
            res.json("failure")
        }
    }
    catch (e) {
        console.log(e)
    }
})

// Funzione asincrona per ottenere l'utente
router.get("/ottieni-utente/:username", async (req, res) => {
    const { username } = req.params
    try {
        const user = await User.findOne({ username: username })
        res.json(user)
    }
    catch (e) {
        console.log(e)
    }
})

// Funzione asincrona per l'impostazione della foto profilo di un utente
router.post("/imposta-propic", async (req, res) => {
    const { username, profilePicture } = req.body
    try {
        const user = await User.findOneAndUpdate({ username: username }, { $set: { profilePicture: profilePicture } })

        if (user) {
            res.json("success")
        }
    }
    catch (e) {
        console.log(e)
    }
})

// Funzione asincrona per ottenere la foto profilo di un utente
router.get("/ottieni-propic/:username", async (req, res) => {
    const { username } = req.params
    try {
        const user = await User.findOne({ username: username })
        res.json(user.profilePicture)
    }
    catch (e) {
        console.log(e)
    }
})

// Funzione asincrona per il login di un utente già iscritto
router.post("/accesso", async (req, res) => {
    const { username, password } = req.body
    try {
        const user = await User.findOne({
            username: username,
            password: password
        })

        if (user) {
            res.json("success")
        }
        else res.json("failure")
    }
    catch (e) {
        console.log(e)
    }
})

// Funzione asincrona che controlla che l'username esista nel database
router.post("/controlla-username", async (req, res) => {
    const { username } = req.body
    try {
        const user = await User.findOne({ username: username })

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        res.json("success")
    }
    catch (e) {
        console.log(e)
    }
})

// Funzione asincrona che prende la domanda di sicurezza associata all'username in URL
router.get("/ottieni-domanda/:username", async (req, res) => {
    const { username } = req.params
    try {
        const user = await User.findOne({ username: username })
        res.json(user.securityQuestion)
    }
    catch (e) {
        console.log(e)
    }
})

// Funzione asincrona che controlla che la risposta di sicurezza sia corretta
router.post("/controlla-risposta", async (req, res) => {
    const { username, securityAnswer } = req.body
    try {
        const user = await User.findOne({ username: username })
        if (user && user.securityAnswer === securityAnswer) {
            res.json("success")
            // console.log("risposta corretta")
        }
    }
    catch (e) {
        console.log(e)
    }
})

// Funzione asincrona che cambia la password
router.post("/cambia-password", async (req, res) => {
    const { username, newPassword } = req.body
    try {
        const user = await User.findOne({ username: username })
        if (user && user.password != newPassword) {
            await User.updateOne({ username: username }, { $set: { password: newPassword } })
            res.json("success")
        }
    }
    catch (e) {
        console.log(e)
    }
})

// Funzione asincrona per l'eliminazione di un utente
router.delete("/elimina-account/:username", async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username: username });
        const userId = user._id

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        // aggiungere eventuali ulteriori controlli di sicurezza qui, ad esempio richiedere la password
        // o altri metodi di autenticazione dell'utente prima di consentire l'eliminazione dell'account.

        await User.deleteOne({
            _id: userId
        });

        await Event.deleteMany({
            authorId: userId
        })

        await Task.deleteMany({
            authorId: userId
        })

        await Note.deleteMany({
            authorId: userId
        });

        res.json("success");
    } catch (e) {
        console.error(e);
    }
})

// Funzioni di backend relative alla gestione degli eventi

// Funzione asincrona per la creazione di un evento
router.post("/crea-evento", async (req, res) => {
    const { authorId, title, location, description,
            creation, start, end, attendees, recurrence
     } = req.body
    try {
        await Event.create({
            authorId: authorId,
            title: title,
            location: location,
            description: description,
            creation: creation,
            start: start,
            end: end,
            attendees: attendees,
            recurrence: recurrence
        })
        res.json("success")
    }
    catch(e) {
        console.log(e)
    }
})

// Funzioni di backend relative alla gestione degli eventi

// Funzione asincrona per la creazione di un'attività
router.post("/crea-attivita", async (req, res) => {
    const { authorId, title, location, description,
            deadline, attendees, referredTask
     } = req.body
    try {
        await Task.create({
            authorId: authorId,
            title: title,
            location: location,
            description: description,
            deadline: deadline,
            attendees: attendees,
            referredTask: referredTask
        })
        res.json("success")
    }
    catch(e) {
        console.log(e)
    }
})

// Funzione asincrona per completare un'attività
router.post("/completa-attivita/:taskId", async (req, res) => {
    const { taskId } = req.params
    try {
        await Task.findOneAndUpdate({
            _id: taskId
        }, {
            $set: {
                completed: true
            }
        })
    }
    catch (e) {
        console.log(e)
    }
})

// Funzioni di backend relative alla gestione delle note

// Funzione asincrona per la creazione di una nota
router.post("/crea-nota", async (req, res) => {
    const { authorId, text, category } = req.body
    try {
        await Note.create({
            authorId: authorId,
            text: text,
            category: category
        })
        res.json("success")
    }
    catch(e) {
        console.log(e)
    }
})

// Esporto il router per poterlo utilizzare in altri file
module.exports = router;