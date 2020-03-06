const helper = require("../helper.js");
const ReserviererDao = require("../dao/reserviererDao.js");
const express = require("express");
var serviceRouter = express.Router();

serviceRouter.get("/reservierer/gib/:id", function(request, response) {
    helper.log("Service Reservierer: Client requested one record, id=" + request.params.id);

    const reserviererDao = new ReserviererDao(request.app.locals.dbConnection);
    try {
        var result = reserviererDao.loadById(request.params.id);
        helper.log("Service Reservierer: Record loaded");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Reservierer: Error loading record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/reservierer/alle", function(request, response) {
    helper.log("Service Reservierer: Client requested all records");

    const reserviererDao = new ReserviererDao(request.app.locals.dbConnection);
    try {
        var result = reserviererDao.loadAll();
        helper.log("Service Reservierer: Records loaded, count=" + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Reservierer: Error loading all records. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/reservierer/existiert/:id", function(request, response) {
    helper.log("Service Reservierer: Client requested check, if record exists, id=" + request.params.id);

    const reserviererDao = new ReserviererDao(request.app.locals.dbConnection);
    try {
        var result = reserviererDao.exists(request.params.id);
        helper.log("Service Reservierer: Check if record exists by id=" + request.params.id + ", result=" + result);
        response.status(200).json(helper.jsonMsgOK({ "id": request.params.id, "existiert": result }));
    } catch (ex) {
        helper.logError("Service Reservierer: Error checking if record exists. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post("/reservierer", function(request, response) {
    helper.log("Service Reservierer: Client requested creation of new record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.vorname)) 
        errorMsgs.push("vorname fehlt");
    if (helper.isUndefined(request.body.nachname)) 
        errorMsgs.push("nachname fehlt");
    if (helper.isUndefined(request.body.email)) {
        errorMsgs.push("email fehlt");
    } else if (!helper.isEmail(request.body.email)) {
        errorMsgs.push("email hat ein falsches Format");
    }
    
    if (errorMsgs.length > 0) {
        helper.log("Service Reservierer: Creation not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Hinzufügen nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const reserviererDao = new ReserviererDao(request.app.locals.dbConnection);
    try {
        var result = reserviererDao.create(request.body.vorname, request.body.nachname, request.body.email);
        helper.log("Service Reservierer: Record inserted");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Reservierer: Error creating new record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.put("/reservierer", function(request, response) {
    helper.log("Service Reservierer: Client requested update of existing record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push("id fehlt");
    if (helper.isUndefined(request.body.vorname)) 
        errorMsgs.push("vorname fehlt");
    if (helper.isUndefined(request.body.nachname)) 
        errorMsgs.push("nachname fehlt");
    if (helper.isUndefined(request.body.email)) {
        errorMsgs.push("email fehlt");
    } else if (!helper.isEmail(request.body.email)) {
        errorMsgs.push("email hat ein falsches Format");
    }

    if (errorMsgs.length > 0) {
        helper.log("Service Reservierer: Update not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Update nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const reserviererDao = new ReserviererDao(request.app.locals.dbConnection);
    try {
        var result = reserviererDao.update(request.body.id, request.body.vorname, request.body.nachname, request.body.email);
        helper.log("Service Reservierer: Record updated, id=" + request.body.id);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Reservierer: Error updating record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.delete("/reservierer/:id", function(request, response) {
    helper.log("Service Reservierer: Client requested deletion of record, id=" + request.params.id);

    const reserviererDao = new ReserviererDao(request.app.locals.dbConnection);
    try {
        var obj = reserviererDao.loadById(request.params.id);
        reserviererDao.delete(request.params.id);
        helper.log("Service Reservierer: Deletion of record successfull, id=" + request.params.id);
        response.status(200).json(helper.jsonMsgOK({ "gelöscht": true, "eintrag": obj }));
    } catch (ex) {
        helper.logError("Service Reservierer: Error deleting record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

module.exports = serviceRouter;