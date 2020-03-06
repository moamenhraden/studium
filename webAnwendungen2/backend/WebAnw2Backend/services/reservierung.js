const helper = require("../helper.js");
const ReservierungDao = require("../dao/reservierungDao.js");
const express = require("express");
var serviceRouter = express.Router();

serviceRouter.get("/reservierung/gib/:id", function(request, response) {
    helper.log("Service Reservierung: Client requested one record, id=" + request.params.id);

    const reservierungDao = new ReservierungDao(request.app.locals.dbConnection);
    try {
        var result = reservierungDao.loadById(request.params.id);
        helper.log("Service Reservierung: Record loaded");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Reservierung: Error loading record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/reservierung/alle/", function(request, response) {
    helper.log("Service Reservierung: Client requested all records");

    const reservierungDao = new ReservierungDao(request.app.locals.dbConnection);
    try {
        var result = reservierungDao.loadAll();
        helper.log("Service Reservierung: Records loaded, count=" + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Reservierung: Error loading all records. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/reservierung/existiert/:id", function(request, response) {
    helper.log("Service Reservierung: Client requested check, if record exists, id=" + request.params.id);

    const reservierungDao = new ReservierungDao(request.app.locals.dbConnection);
    try {
        var result = reservierungDao.exists(request.params.id);
        helper.log("Service Reservierung: Check if record exists by id=" + request.params.id + ", result=" + result);
        response.status(200).json(helper.jsonMsgOK({ "id": request.params.id, "existiert": result }));
    } catch (ex) {
        helper.logError("Service Reservierung: Error checking if record exists. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post("/reservierung", function(request, response) {
    helper.log("Service Reservierung: Client requested creation of new record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.zeitpunkt)) {
        request.body.zeitpunkt = helper.getNow();
    } else if (!helper.isGermanDateTimeFormat(request.body.zeitpunkt)) {
        errorMsgs.push("zeitpunkt hat ein falsches Format, erlaubt: dd.mm.jjjj hh.mm.ss");
    } else {
        request.body.zeitpunkt = helper.parseGermanDateTimeString(request.body.zeitpunkt);
    }
    if (helper.isUndefined(request.body.reservierer)) {
        errorMsgs.push("reservierer fehlt");
    } else if (helper.isUndefined(request.body.reservierer.id)) {
        errorMsgs.push("reservierer gesetzt, aber id fehlt");
    }
    if (helper.isUndefined(request.body.zahlungsart)) {
        errorMsgs.push("zahlungsart fehlt");
    } else if (helper.isUndefined(request.body.zahlungsart.id)) {
        errorMsgs.push("zahlungsart gesetzt, aber id fehlt");
    }
    if (helper.isUndefined(request.body.vorstellung)) {
        errorMsgs.push("vorstellung fehlt");
    } else if (helper.isUndefined(request.body.vorstellung.id)) {
        errorMsgs.push("vorstellung gesetzt, aber id fehlt");
    }
    if (helper.isUndefined(request.body.reserviertesitze)) {
        errorMsgs.push("reserviertesitze fehlen");
    } else if (!helper.isArray(request.body.reserviertesitze)) {
        errorMsgs.push("reserviertesitze ist kein Array");
    } else if (request.body.reserviertesitze.length == 0) {
        errorMsgs.push("reserviertesitze sind leer, nichts zu speichern");
    }
    
    if (errorMsgs.length > 0) {
        helper.log("Service Reservierung: Creation not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Hinzufügen nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const reservierungDao = new ReservierungDao(request.app.locals.dbConnection);
    try {
        var result = reservierungDao.create(request.body.zeitpunkt, request.body.reservierer.id, request.body.zahlungsart.id, request.body.vorstellung.id, request.body.reserviertesitze);
        helper.log("Service Reservierung: Record inserted");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Reservierung: Error creating new record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.put("/reservierung", function(request, response) {
    helper.log("Service Reservierung: Client requested update of existing record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push("id fehlt");
    if (helper.isUndefined(request.body.zeitpunkt)) {
        request.body.zeitpunkt = helper.getNow();
    } else if (!helper.isGermanDateTimeFormat(request.body.zeitpunkt)) {
        errorMsgs.push("zeitpunkt hat ein falsches Format, erlaubt: dd.mm.jjjj hh.mm.ss");
    } else {
        request.body.zeitpunkt = helper.parseGermanDateTimeString(request.body.zeitpunkt);
    }
    if (helper.isUndefined(request.body.reservierer)) {
        errorMsgs.push("reservierer fehlt");
    } else if (helper.isUndefined(request.body.reservierer.id)) {
        errorMsgs.push("reservierer gesetzt, aber id fehlt");
    }
    if (helper.isUndefined(request.body.zahlungsart)) {
        errorMsgs.push("zahlungsart fehlt");
    } else if (helper.isUndefined(request.body.zahlungsart.id)) {
        errorMsgs.push("zahlungsart gesetzt, aber id fehlt");
    }
    if (helper.isUndefined(request.body.vorstellung)) {
        errorMsgs.push("vorstellung fehlt");
    } else if (helper.isUndefined(request.body.vorstellung.id)) {
        errorMsgs.push("vorstellung gesetzt, aber id fehlt");
    }
    if (helper.isUndefined(request.body.reserviertesitze)) {
        errorMsgs.push("reserviertesitze fehlen");
    } else if (!helper.isArray(request.body.reserviertesitze)) {
        errorMsgs.push("reserviertesitze ist kein Array");
    } else if (request.body.reserviertesitze.length == 0) {
        errorMsgs.push("reserviertesitze sind leer, nichts zu speichern");
    }

    if (errorMsgs.length > 0) {
        helper.log("Service Reservierung: Update not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Update nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const reservierungDao = new ReservierungDao(request.app.locals.dbConnection);
    try {
        var result = reservierungDao.update(request.body.id, request.body.zeitpunkt, request.body.reservierer.id, request.body.zahlungsart.id, request.body.vorstellung.id, request.body.reserviertesitze);
        helper.log("Service Reservierung: Record updated, id=" + request.body.id);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Reservierung: Error updating record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.delete("/reservierung/:id", function(request, response) {
    helper.log("Service Reservierung: Client requested deletion of record, id=" + request.params.id);

    const reservierungDao = new ReservierungDao(request.app.locals.dbConnection);
    try {
        var obj = reservierungDao.loadById(request.params.id);
        reservierungDao.delete(request.params.id);
        helper.log("Service Reservierung: Deletion of record successfull, id=" + request.params.id);
        response.status(200).json(helper.jsonMsgOK({ "gelöscht": true, "eintrag": obj }));
    } catch (ex) {
        helper.logError("Service Reservierung: Error deleting record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

module.exports = serviceRouter;