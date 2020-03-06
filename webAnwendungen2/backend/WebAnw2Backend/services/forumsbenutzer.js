const helper = require("../helper.js");
const ForumsbenutzerDao = require("../dao/forumsbenutzerDao.js");
const express = require("express");
var serviceRouter = express.Router();

serviceRouter.get("/forumsbenutzer/gib/:id", function(request, response) {
    helper.log("Service Forumsbenutzer: Client requested one record, id=" + request.params.id);

    const forumsbenutzerDao = new ForumsbenutzerDao(request.app.locals.dbConnection);
    try {
        var result = forumsbenutzerDao.loadById(request.params.id);
        helper.log("Service Forumsbenutzer: Record loaded");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Forumsbenutzer: Error loading record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/forumsbenutzer/alle", function(request, response) {
    helper.log("Service Forumsbenutzer: Client requested all records");

    const forumsbenutzerDao = new ForumsbenutzerDao(request.app.locals.dbConnection);
    try {
        var result = forumsbenutzerDao.loadAll();
        helper.log("Service Forumsbenutzer: Records loaded, count=" + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Forumsbenutzer: Error loading all records. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/forumsbenutzer/eindeutig", function(request, response) {
    helper.log("Service Forumsbenutzer: Client requested check, if username is unique");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.benutzername)) 
        errorMsgs.push("benutzername fehlt");

    if (errorMsgs.length > 0) {
        helper.log("Service Forumsbenutzer: check not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Check nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const forumsbenutzerDao = new ForumsbenutzerDao(request.app.locals.dbConnection);
    try {
        var result = forumsbenutzerDao.isunique(request.body.benutzername);
        helper.log("Service Forumsbenutzer: Check if unique, result=" + result);
        response.status(200).json(helper.jsonMsgOK({ "benutzername": request.body.benutzername, "eindeutig": result }));
    } catch (ex) {
        helper.logError("Service Forumsbenutzer: Error checking if unique. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/forumsbenutzer/existiert/:id", function(request, response) {
    helper.log("Service Forumsbenutzer: Client requested check, if record exists, id=" + request.params.id);

    const forumsbenutzerDao = new ForumsbenutzerDao(request.app.locals.dbConnection);
    try {
        var result = forumsbenutzerDao.exists(request.params.id);
        helper.log("Service Forumsbenutzer: Check if record exists by id=" + request.params.id + ", result=" + result);
        response.status(200).json(helper.jsonMsgOK({ "id": request.params.id, "existiert": result }));
    } catch (ex) {
        helper.logError("Service Forumsbenutzer: Error checking if record exists. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post("/forumsbenutzer", function(request, response) {
    helper.log("Service Forumsbenutzer: Client requested creation of new record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.benutzername)) 
        errorMsgs.push("benutzername fehlt");
    if (helper.isUndefined(request.body.geschlecht)) {
        errorMsgs.push("geschlecht fehlt");
    } else if (request.body.geschlecht.toLowerCase() !== "männlich" && request.body.geschlecht.toLowerCase() !== "weiblich") {
        errorMsgs.push("geschlecht muss entweder männlich oder weiblich sein");
    }
    if (helper.isUndefined(request.body.geburtstag)) {
        errorMsgs.push("geburtstag fehlt");
    } else if (!helper.isGermanDateTimeFormat(request.body.geburtstag)) {
        errorMsgs.push("geburtstag hat das falsche Format, erlaubt: dd.mm.jjjj");
    } else {
        request.body.geburtstag = helper.parseGermanDateTimeString(request.body.geburtstag);
    }
    if (helper.isUndefined(request.body.beitritt)) {
        request.body.beitritt = helper.getNow();
    } else if (!helper.isGermanDateTimeFormat(request.body.beitritt)) {
        errorMsgs.push("beitritt hat das falsche Format, erlaubt: dd.mm.jjjj");
    } else {
        request.body.beitritt = helper.parseGermanDateTimeString(request.body.beitritt);
    }
    if (helper.isUndefined(request.body.rolle)) {
        errorMsgs.push("rolle fehlt");
    } else if (helper.isUndefined(request.body.rolle.id)) {
        errorMsgs.push("rolle gesetzt, aber id fehlt");
    }
    
    if (errorMsgs.length > 0) {
        helper.log("Service Forumsbenutzer: Creation not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Hinzufügen nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const forumsbenutzerDao = new ForumsbenutzerDao(request.app.locals.dbConnection);
    try {
        var result = forumsbenutzerDao.create(request.body.benutzername, request.body.geschlecht, request.body.geburtstag, request.body.beitritt, request.body.rolle.id);
        helper.log("Service Forumsbenutzer: Record inserted");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Forumsbenutzer: Error creating new record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.put("/forumsbenutzer", function(request, response) {
    helper.log("Service Forumsbenutzer: Client requested update of existing record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push("id fehlt");
    if (helper.isUndefined(request.body.benutzername)) 
        errorMsgs.push("benutzername fehlt");
    if (helper.isUndefined(request.body.geschlecht)) {
        errorMsgs.push("geschlecht fehlt");
    } else if (request.body.geschlecht.toLowerCase() !== "männlich" && request.body.geschlecht.toLowerCase() !== "weiblich") {
        errorMsgs.push("geschlecht muss entweder männlich oder weiblich sein");
    }
    if (helper.isUndefined(request.body.geburtstag)) {
        errorMsgs.push("geburtstag fehlt");
    } else if (!helper.isGermanDateTimeFormat(request.body.geburtstag)) {
        errorMsgs.push("geburtstag hat das falsche Format, erlaubt: dd.mm.jjjj");
    } else {
        request.body.geburtstag = helper.parseGermanDateTimeString(request.body.geburtstag);
    }
    if (helper.isUndefined(request.body.beitritt)) {
        request.body.beitritt = helper.getNow();
    } else if (!helper.isGermanDateTimeFormat(request.body.beitritt)) {
        errorMsgs.push("beitritt hat das falsche Format, erlaubt: dd.mm.jjjj");
    } else {
        request.body.beitritt = helper.parseGermanDateTimeString(request.body.beitritt);
    }
    if (helper.isUndefined(request.body.rolle)) {
        errorMsgs.push("rolle fehlt");
    } else if (helper.isUndefined(request.body.rolle.id)) {
        errorMsgs.push("rolle gesetzt, aber id fehlt");
    }

    if (errorMsgs.length > 0) {
        helper.log("Service Forumsbenutzer: Update not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Update nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const forumsbenutzerDao = new ForumsbenutzerDao(request.app.locals.dbConnection);
    try {
        var result = forumsbenutzerDao.update(request.body.id, request.body.benutzername, request.body.geschlecht, request.body.geburtstag, request.body.beitritt, request.body.rolle.id);
        helper.log("Service Forumsbenutzer: Record updated, id=" + request.body.id);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Forumsbenutzer: Error updating record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.delete("/forumsbenutzer/:id", function(request, response) {
    helper.log("Service Forumsbenutzer: Client requested deletion of record, id=" + request.params.id);

    const forumsbenutzerDao = new ForumsbenutzerDao(request.app.locals.dbConnection);
    try {
        var obj = forumsbenutzerDao.loadById(request.params.id);
        forumsbenutzerDao.delete(request.params.id);
        helper.log("Service Forumsbenutzer: Deletion of record successfull, id=" + request.params.id);
        response.status(200).json(helper.jsonMsgOK({ "gelöscht": true, "eintrag": obj }));
    } catch (ex) {
        helper.logError("Service Forumsbenutzer: Error deleting record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

module.exports = serviceRouter;