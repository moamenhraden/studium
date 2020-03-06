const helper = require("../helper.js");
const TerminDao = require("../dao/terminDao.js");
const express = require("express");
var serviceRouter = express.Router();

serviceRouter.get("/termin/gib/:id", function(request, response) {
    helper.log("Service Termin: Client requested one record, id=" + request.params.id);

    const terminDao = new TerminDao(request.app.locals.dbConnection);
    try {
        var result = terminDao.loadById(request.params.id);
        helper.log("Service Termin: Record loaded");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Termin: Error loading record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/termin/alle", function(request, response) {
    helper.log("Service Termin: Client requested all records");

    const terminDao = new TerminDao(request.app.locals.dbConnection);
    try {
        var result = terminDao.loadAll();
        helper.log("Service Termin: Records loaded, count=" + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Termin: Error loading all records. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/termin/existiert/:id", function(request, response) {
    helper.log("Service Termin: Client requested check, if record exists, id=" + request.params.id);

    const terminDao = new TerminDao(request.app.locals.dbConnection);
    try {
        var result = terminDao.exists(request.params.id);
        helper.log("Service Termin: Check if record exists by id=" + request.params.id + ", result=" + result);
        response.status(200).json(helper.jsonMsgOK({ "id": request.params.id, "existiert": result }));
    } catch (ex) {
        helper.logError("Service Termin: Error checking if record exists. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/termin/dienstleister/:id", function(request, response) {
    helper.log("Service Termin: Client requested all records for dienstleister,  id=" + request.params.id);

    const terminDao = new TerminDao(request.app.locals.dbConnection);
    try {
        var result = terminDao.loadAllByDienstleister(request.params.id);
        helper.log("Service Termin: Records loaded, count=" + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Termin: Error loading all records by dienstleister. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/termin/bereich", function(request, response) {
    helper.log("Service Termin: Client requested all records for a specific range of dates");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.von)) {
        errorMsgs.push("von fehlt");
    } else if (!helper.isGermanDateTimeFormat(request.body.von)) {
        errorMsgs.push("von hat ein falsches Format, erlaubt: dd.mm.jjjj hh.mm.ss");
    }
    if (helper.isUndefined(request.body.bis)) {
        errorMsgs.push("bis fehlt");
    } else if (!helper.isGermanDateTimeFormat(request.body.bis)) {
        errorMsgs.push("bis hat ein falsches Format, erlaubt: dd.mm.jjjj hh.mm.ss");
    }
    if (helper.isUndefined(request.body.dienstleister)) {
        request.body.dienstleister = null;
    } else if (helper.isUndefined(request.body.dienstleister.id)) {
        errorMsgs.push("dienstleister gesetzt, aber id fehlt");
    } else {
        request.body.dienstleister = request.body.dienstleister.id;
    }

    if (errorMsgs.length > 0) {
        helper.log("Service Termin: Loading of records by range not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Loading not possible. Missing data: " + helper.concatArray(errorMsgs)));
        return;
    }

    var d1 = helper.parseDateTimeString(request.body.von);
    var d2 = helper.parseDateTimeString(request.body.bis);

    if (helper.compareDateTimes(d1, d2) > 0) {
        var tmp = d2;
        d2 = d1;
        d1 = tmp;
    }

    helper.log("Range to load: " + helper.formatToGermanDateTime(d1) + " - " + helper.formatToGermanDateTime(d2));

    const terminDao = new TerminDao(request.app.locals.dbConnection);
    try {
        var result = terminDao.loadRange(d1, d2, request.body.dienstleister);
        helper.log("Service Termin: Records loaded, count=" + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Termin: Error loading range of records. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post("/termin", function(request, response) {
    helper.log("Service Termin: Client requested creation of new record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");
    if (helper.isUndefined(request.body.beschreibung)) 
        request.body.beschreibung = "";
    if (helper.isUndefined(request.body.zeitpunkt)) {
        errorMsgs.push("zeitpunkt fehlt");
    } else if (!helper.isGermanDateTimeFormat(request.body.zeitpunkt)) {
        errorMsgs.push("zeitpunkt hat ein falsches Format, erlaubt: dd.mm.jjjj hh.mm.ss");
    }
    if (helper.isUndefined(request.body.dauer)) {
        request.body.dauer = 60;
    } else if (!helper.isNumeric(request.body.dauer)) {
        errorMsgs.push("dauer muss eine Zahl sein");
    } else if (request.body.dauer <= 0) {
        errorMsgs.push("dauer muss eine Zahl > 0 sein");
    }
    if (helper.isUndefined(request.body.dienstleister)) {
        request.body.dienstleister = null;
    } else if (helper.isUndefined(request.body.dienstleister.id)) {
        errorMsgs.push("dienstleister gesetzt, aber id fehlt");
    } else {
        request.body.dienstleister = request.body.dienstleister.id;
    }
    
    if (errorMsgs.length > 0) {
        helper.log("Service Termin: Creation not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Hinzufügen nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const terminDao = new TerminDao(request.app.locals.dbConnection);
    try {
        var result = terminDao.create(request.body.bezeichnung, request.body.beschreibung, helper.parseDateTimeString(request.body.zeitpunkt), request.body.dauer, request.body.dienstleister);
        helper.log("Service Termin: Record inserted");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Termin: Error creating new record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.put("/termin", function(request, response) {
    helper.log("Service Termin: Client requested update of existing record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push("id fehlt");
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");
    if (helper.isUndefined(request.body.beschreibung)) 
        request.body.beschreibung = "";
    if (helper.isUndefined(request.body.zeitpunkt)) {
        errorMsgs.push("zeitpunkt fehlt");
    } else if (!helper.isGermanDateTimeFormat(request.body.zeitpunkt)) {
        errorMsgs.push("zeitpunkt hat ein falsches Format, erlaubt: dd.mm.jjjj hh.mm.ss");
    }
    if (helper.isUndefined(request.body.dauer)) {
        request.body.dauer = 60;
    } else if (!helper.isNumeric(request.body.dauer)) {
        errorMsgs.push("dauer muss eine Zahl sein");
    } else if (request.body.dauer <= 0) {
        errorMsgs.push("dauer muss eine Zahl > 0 sein");
    }
    if (helper.isUndefined(request.body.dienstleister)) {
        request.body.dienstleister = null;
    } else if (helper.isUndefined(request.body.dienstleister.id)) {
        errorMsgs.push("dienstleister gesetzt, aber id fehlt");
    } else {
        request.body.dienstleister = request.body.dienstleister.id;
    }

    if (errorMsgs.length > 0) {
        helper.log("Service Termin: Update not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Update nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const terminDao = new TerminDao(request.app.locals.dbConnection);
    try {
        var result = terminDao.update(request.body.id, request.body.bezeichnung, request.body.beschreibung, helper.parseDateTimeString(request.body.zeitpunkt), request.body.dauer, request.body.dienstleister);
        helper.log("Service Termin: Record updated, id=" + request.body.id);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Termin: Error updating record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.delete("/termin/:id", function(request, response) {
    helper.log("Service Termin: Client requested deletion of record, id=" + request.params.id);

    const terminDao = new TerminDao(request.app.locals.dbConnection);
    try {
        var obj = terminDao.loadById(request.params.id);
        terminDao.delete(request.params.id);
        helper.log("Service Termin: Deletion of record successfull, id=" + request.params.id);
        response.status(200).json(helper.jsonMsgOK({ "gelöscht": true, "eintrag": obj }));
    } catch (ex) {
        helper.logError("Service Termin: Error deleting record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

module.exports = serviceRouter;