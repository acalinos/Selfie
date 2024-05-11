const mongoose = require("mongoose");                          // importo il modulo mongoose
mongoose.connect("mongodb://0.0.0.0:27017/selfie")             // connessione al database mongodb

    // Se la connessione avviene correttamente stampo "mongodb connected", altrimenti "failed"
    .then(() => {
        console.log("MongoDB is connected.");
    })
    .catch(() => {
        console.log("Connection failed.");
    });

const userSchema = new mongoose.Schema({
    // credenziali per accedere all'account
    username: {
        type: String,
        required: true
    },
    
    password: {
        type: String,
        required: true
    },

    fullname: {
        type: String,
        required: true
    },

    number: {
        type: Number,
        default: 0
    },

    // // domanda di sicurezza, modalità di recupero della password
    // securityQuestion: {
    //     type: String,
    //     required: true
    // },

    // securityAnswer: {
    //     type: String,
    //     required: true
    // },

    // modalità di controllo di blocco dell'utente
    // isBlocked: {
    //     type: Boolean,
    //     default: false
    // }
})

const noteSchema = new mongoose.Schema({
    // username dell'autore del post
    author: {
        type: String
    },

    // contenuto del post (testo)
    text: {
        type: String,
        default: ""
    },

    // data e ora di creazione del post
    date: {
        type: Date,
        default: Date.now
    },

    // categoria della nota
    category: {
        type: String,
        default: "NEW"
    }
})

// Creo i modelli collection, associati agli schemi creati precedentemente
const User = mongoose.model("User", userSchema);
const Note = mongoose.model("Note", noteSchema);

// Esporto i moduli collection così da poterli utilizzare in altri file
module.exports = { User, Note };