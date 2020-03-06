const helper = require("../helper.js");
const ZahlungsartDao = require("../dao/zahlungsartDao.js");
const express = require("express");
var serviceRouter = express.Router();

serviceRouter.get("/zahlungsart/gib/:id", function(request, response) {
    helper.log("Service Zahlungsart: Client requested one record, id=" + request.params.id);

    const zahlungsartDao = new ZahlungsartDao(request.app.locals.dbConnection);
    try {
        var result = zahlungsartDao.loadById(request.params.id);
        helper.log("Service Zahlungsart: Record loaded");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Zahlungsart: Error loading record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/zahlungsart/alle", function(request, response) {
    helper.log("Service Zahlungsart: Client requested all records");

    const zahlungsartDao = new ZahlungsartDao(request.app.locals.dbConnection);
    try {
        var result = zahlungsartDao.loadAll();
        helper.log("Service Zahlungsart: Records loaded, count=" + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Zahlungsart: Error loading all records. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/zahlungsart/existiert/:id", function(request, response) {
    helper.log("Service Zahlungsart: Client requested check, if record exists, id=" + request.params.id);

    const zahlungsartDao = new ZahlungsartDao(request.app.locals.dbConnection);
    try {
        var result = zahlungsartDao.exists(request.params.id);
        helper.log("Service Zahlungsart: Check if record exists by id=" + request.params.id + ", result=" + result);
        response.status(200).json(helper.jsonMsgOK({ "id": request.params.id, "existiert": result }));
    } catch (ex) {
        helper.logError("Service Zahlungsart: Error checking if record exists. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post("/zahlungsart", function(request, response) {
    helper.log("Service Zahlungsart: Client requested creation of new record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");
    
    if (errorMsgs.length > 0) {
        helper.log("Service Zahlungsart: Creation not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Hinzufügen nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const zahlungsartDao = new ZahlungsartDao(request.app.locals.dbConnection);
    try {
        var result = zahlungsartDao.create(request.body.bezeichnung);
        helper.log("Service Zahlungsart: Record inserted");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Zahlungsart: Error creating new record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.put("/zahlungsart", function(request, response) {
    helper.log("Service Zahlungsart: Client requested update of existing record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push("id fehlt");
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");

    if (errorMsgs.length > 0) {
        helper.log("Service Zahlungsart: Update not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Update nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const zahlungsartDao = new ZahlungsartDao(request.app.locals.dbConnection);
    try {
        var result = zahlungsartDao.update(request.body.id, request.body.bezeichnung);
        helper.log("Service Zahlungsart: Record updated, id=" + request.body.id);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Zahlungsart: Error updating record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.delete("/zahlungsart/:id", function(request, response) {
    helper.log("Service Zahlungsart: Client requested deletion of record, id=" + request.params.id);

    const zahlungsartDao = new ZahlungsartDao(request.app.locals.dbConnection);
    try {
        var obj = zahlungsartDao.loadById(request.params.id);
        zahlungsartDao.delete(request.params.id);
        helper.log("Service Zahlungsart: Deletion of record successfull, id=" + request.params.id);
        response.status(200).json(helper.jsonMsgOK({ "gelöscht": true, "eintrag": obj }));
    } catch (ex) {
        helper.logError("Service Zahlungsart: Error deleting record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

module.exports = serviceRouter;