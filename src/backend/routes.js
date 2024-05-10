// Importo il modulo express e creo un nuovo router
const express = require('express');
const router = express.Router();

// Importo User e Post da userDetails, i quali rappresentano i dettagli degli utenti e dei post
const { User, Note} = require('../details.js');

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
                number: number,
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

// Funzione asincrona per il calcolo della popolarità di un utente
router.post("/calcola-popolarita/:username", async (req, res) => {
    const { username } = req.params
    try {
        let positiveReactions = 0;

        // Cerco i post dell'utente con receiver "all" o "channel"
        const posts = await Post.find({
            author: username,
            $or: [{ receiverType: "all" }, { receiverType: "§channel" }, { receiverType: "channel" }]
        });

        if (posts.length !== 0) {
            for (let i = 0; i < posts.length; i++) {
                positiveReactions = positiveReactions + posts[i].laughUsers.length + posts[i].lovelyUsers.length + posts[i].heartUsers.length;
            }

            const popularity = Math.floor(positiveReactions / posts.length);
            const user = await User.findOneAndUpdate({ username: username }, { $set: { popularity: popularity } });

            if (user) {
                res.json("success");
            }
        }
        else {
            const popularity = 0;
            const user = await User.findOneAndUpdate({ username: username }, { $set: { popularity: popularity } });

            if (user) {
                res.json("success");
            }
        }
    }
    catch (e) {
        console.log(e);
    }
})

// Funzione asincrona per ottenere la popolarità di un utente
router.get("/ottieni-popolarita/:username", async (req, res) => {
    const { username } = req.params
    try {
        const user = await User.findOne({ username: username })
        res.json(user.popularity)
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
router.get("/prendi-domanda/:username", async (req, res) => {
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

//Funzione che seleziona l'smm
router.post("/smm", async (req, res) => {
    try {
        const { username, smm } = req.body;

        // Check if the user is a professional user
        const professionalUser = await User.findOne({ username, userType: "pro" });
        if (!professionalUser) {
            return res.status(404).json({ message: 'Non sei un utente professionale, non puoi associare un social media manager.' });
        }

        // Find the SMM and check if it has three accounts already
        const socialmm = await User.findOne({ username: smm });
        if (socialmm.account1 !== "" && socialmm.account2 !== "" && socialmm.account3 !== "") {
            return res.status(404).json({ message: 'Questo smm ha già tre account associati, non puoi associarne altri.' });
        }

        // Update the SMM's accounts and the user's SMM
        let updatedSMM;
        if (socialmm.account1 === "") {
            updatedSMM = await User.findOneAndUpdate({ username: smm }, { $set: { account1: username } });
        } else if (socialmm.account2 === "") {
            updatedSMM = await User.findOneAndUpdate({ username: smm }, { $set: { account2: username } });
        } else {
            updatedSMM = await User.findOneAndUpdate({ username: smm }, { $set: { account3: username } });
        }

        const updatedUser = await User.findOneAndUpdate({ username }, { $set: { smm } });

        if (updatedUser && updatedSMM) {
            return res.json("success");
        } else {
            return res.status(500).json({ message: 'Errore durante l\'associazione SMM.' });
        }
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Errore interno del server.' });
    }
});

//rimuove smm
router.post("/removesmm", async (req, res) => {
    try {
        const { username } = req.body;

        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato.' });
        }

        // Get the associated SMM username
        const smmUsername = user.smm;

        // Find the SMM and check if it has three accounts already
        const socialmm = await User.findOne({ username: smmUsername });
        if (!socialmm) {
            return res.status(404).json({ message: 'SMM non trovato.' });
        }

        if (socialmm.account1 !== "" && socialmm.account2 !== "" && socialmm.account3 !== "") {
            return res.status(404).json({ message: 'Questo SMM ha già tre account associati, non puoi associarne altri.' });
        }

        // Update the SMM's accounts
        if (socialmm.account1 === username) {
            await User.findOneAndUpdate({ username: smmUsername }, { $set: { account1: "" } });
        } else if (socialmm.account2 === username) {
            await User.findOneAndUpdate({ username: smmUsername }, { $set: { account2: "" } });
        } else if (socialmm.account3 === username) {
            await User.findOneAndUpdate({ username: smmUsername }, { $set: { account3: "" } });
        }

        // Update the user's SMM
        await User.findOneAndUpdate({ username }, { $set: { smm: "" } });

        return res.json("success");
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Errore interno del server.' });
    }
});

// Funzione asincrona per l'eliminazione di un utente
router.delete("/elimina-account/:username", async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        // aggiungere eventuali ulteriori controlli di sicurezza qui, ad esempio richiedere la password
        // o altri metodi di autenticazione dell'utente prima di consentire l'eliminazione dell'account.

        await User.deleteOne({
            username: username
        });

        await Note.deleteMany({
            author: username
        });

        res.json("success");
    } catch (e) {
        console.error(e);
    }
})

// Esporto il router per poterlo utilizzare in altri file
module.exports = router;