const express = require("express");                             
const cors = require("cors");

const app = express();   

// Middleware per il parsing del corpo JSON con limite massimo di 10 mb
app.use(express.json({limit: '10mb'}));

// Middleware per il parsing del corpo URL encoded con limite massimo di 10 mb
app.use(express.urlencoded({ extended: true, limit: '10mb' }));   
                                       
app.use(cors()); 

// Importo i file delle route per autenticazione e post  
const routes = require('./routes.js');

// Associo le route per autenticazione e post alle rispettive URL
app.use('/', routes);

// Avvio il server Express in ascolto sulla porta 3000
app.listen(3000, ()=>{      
   // Stampo quando il server viene avviato con successo                        
   console.log("Server started.");
})