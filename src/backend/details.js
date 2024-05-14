const { type } = require("@testing-library/user-event/dist/type");
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

    // booleano per verificare se l'utente è umano
    humanBoolean: {
        type: Boolean,
        default: true
    },

    // booleano per verificare se l'utente è un amministratore
    mgmtBoolean: {
        type: Boolean,
        default: false
    }
})

const eventSchema = new mongoose.Schema({
    // id dell'autore dell'evento
    authorId: {
        type: String
    },

    // titolo dell'evento
    title: {
        type: String,
        default: "New event"
    },

    // luogo dell'evento
    location: {
        type: String,
        default: ""
    },

    // descrizione dell'evento
    description: {
        type: String,
        default: ""
    },

    // data e ora di creazione dell'evento
    creation: {
        type: Date,
        default: Date.now
    },

    // data e ora di inizio dell'evento
    start: {
        type: Date
    },

    // data e ora di fine dell'evento
    end: {
        type: Date
    },

    // array degli utenti che partecipano all'evento
    attendees: {
        type: Array,
        default: []
    },

    // ricorrenza dell'evento
    recurrence: {
        type: String,
        default: "none"
        // da verificare: https://www.npmjs.com/package/datebook
    }
})

const taskSchema = new mongoose.Schema({
    // id dell'autore del task
    authorId: {
        type: String
    },

    // titolo del task
    title: {
        type: String,
        default: "New task"
    },

    // luogo del task
    location: {
        type: String
    },

    // descrizione del task
    description: {
        type: String,
        default: ""
    },

    // data e ora di creazione e inizio del task
    start: {
        type: Date,
        default: Date.now
    },

    // data e ora di scadenza del task
    deadline: {
        type: Date
    },

    // booleano per verificare se il task è stato completato
    completed: {
        type: Boolean,
        default: false
    },

    // array di utenti che partecipano al task
    attendees: {
        type: Array,
        default: []
    },

    // id della sovra-attività di riferiento
    referredTask: {
        type: String,
        default: ""
    }

})

const noteSchema = new mongoose.Schema({
    // username dell'autore dell'appunto
    authorId: {
        type: String
    },

    // contenuto dell'appunto (testo)
    text: {
        type: String,
        default: ""
    },

    // data e ora di creazione dell'appunto
    date: {
        type: Date,
        default: Date.now
    },

    // categoria dell'appunto
    category: {
        type: String,
        default: "NONE"
    }
})

// Creo i modelli collection, associati agli schemi creati precedentemente
const User = mongoose.model("User", userSchema);
const Event = mongoose.model("Event", eventSchema);
const Task = mongoose.model("Task", taskSchema);
const Note = mongoose.model("Note", noteSchema);

// Esporto i moduli collection così da poterli utilizzare in altri file
module.exports = { User, Event, Task, Note };