/////////////////
// workaround / bugfix for linux systems
Object.fromEntries = l => l.reduce((a, [k,v]) => ({...a, [k]: v}), {})
/////////////////

const helper = require("./helper.js");
helper.log("Starting server...");

try {
    // connect database
    helper.log("Connect database...");
    const Database = require("better-sqlite3");
    const dbOptions = { verbose: console.log };
    const dbFile = "./db/db.sqlite";
    const dbConnection = new Database(dbFile, dbOptions);

    // create server
    helper.log("Creating Web Server...");
    const HTTP_PORT = 8000;
    var express = require("express");
    var app = express();

    // provide service router with database connection / store the database connection in global server environment
    helper.log("Setup Web Server...");
    app.locals.dbConnection = dbConnection; 


    // setup server for post data
    const bodyParser = require("body-parser");
    app.use(bodyParser.urlencoded({ extended: true}));
    app.use(bodyParser.json());
    app.use(function(request, response, next){
        response.setHeader("Access-Control-Allow-Origin", "*"); 
        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    // start server
    app.listen(HTTP_PORT, () => {
        helper.log("Start Web Server...");
        helper.log("Server running at localhost on port %PORT%".replace("%PORT%", HTTP_PORT));
        helper.log("\n\n-----------------------------------------");
        helper.log("exit / stop Server by pressing 2 x CTRL-C");
        helper.log("-----------------------------------------\n\n");
    });

    // define endpoints for services
    console.log("Binding enpoints...");

    // bind root endpoint
    app.get("/", (request, response) => {
        helper.log("Server called without any specification");
        response.status(200).json(helper.jsonMsg("Server API arbeitet an Port " + HTTP_PORT));
    });

    // bind services endpoints
    const TOPLEVELPATH = "/api";
    var serviceRouter = require("./services/land.js");
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require("./services/adresse.js");
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require("./services/person.js");
    app.use(TOPLEVELPATH, serviceRouter);

    
    
    serviceRouter = require("./services/branche.js");
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require("./services/firma.js");
    app.use(TOPLEVELPATH, serviceRouter);


    
    serviceRouter = require("./services/download.js");
    app.use(TOPLEVELPATH, serviceRouter);



    serviceRouter = require("./services/termin.js");
    app.use(TOPLEVELPATH, serviceRouter);

    
    
    serviceRouter = require("./services/produktkategorie.js");
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require("./services/zahlungsart.js");
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require("./services/mehrwertsteuer.js");
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require("./services/produktbild.js");
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require("./services/produkt.js");
    app.use(TOPLEVELPATH, serviceRouter);


    serviceRouter = require("./services/bestellung.js");
    app.use(TOPLEVELPATH, serviceRouter);


    serviceRouter = require("./services/speisenart.js");
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require("./services/einheit.js");
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require("./services/zutat.js");
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require("./services/bewertung.js");
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require("./services/gericht.js");
    app.use(TOPLEVELPATH, serviceRouter);




    serviceRouter = require("./services/benutzerrolle.js");
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require("./services/forumsbenutzer.js");
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require("./services/forumsbereich.js");
    app.use(TOPLEVELPATH, serviceRouter);



    serviceRouter = require("./services/filmgenre.js");
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require("./services/kinosaal.js");
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require("./services/reservierer.js");
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require("./services/film.js");
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require("./services/reservierung.js");
    app.use(TOPLEVELPATH, serviceRouter);
    
    serviceRouter = require("./services/vorstellung.js");
    app.use(TOPLEVELPATH, serviceRouter);

    

    serviceRouter = require("./services/benutzer.js");
    app.use(TOPLEVELPATH, serviceRouter);

    
} catch (ex) {
    helper.logError(ex);
}