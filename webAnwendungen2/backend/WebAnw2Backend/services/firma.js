const helper = require("../helper.js");
const FirmaDao = require("../dao/firmaDao.js");
const express = require("express");
var serviceRouter = express.Router();

serviceRouter.get("/firma/gib/:id", function(request, response) {
    helper.log("Service Firma: Client requested one record, id=" + request.params.id);

    const firmaDao = new FirmaDao(request.app.locals.dbConnection);
    try {
        var result = firmaDao.loadById(request.params.id);
        helper.log("Service Firma: Record loaded");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Firma: Error loading record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/firma/alle", function(request, response) {
    helper.log("Service Firma: Client requested all records");

    const firmaDao = new FirmaDao(request.app.locals.dbConnection);
    try {
        var result = firmaDao.loadAll();
        helper.log("Service Firma: Records loaded, count=" + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Firma: Error loading all records. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/firma/existiert/:id", function(request, response) {
    helper.log("Service Firma: Client requested check, if record exists, id=" + request.params.id);

    const firmaDao = new FirmaDao(request.app.locals.dbConnection);
    try {
        var result = firmaDao.exists(request.params.id);
        helper.log("Service Firma: Check if record exists by id=" + request.params.id + ", result=" + result);
        response.status(200).json(helper.jsonMsgOK({ "id": request.params.id, "existiert": result }));
    } catch (ex) {
        helper.logError("Service Firma: Error checking if record exists. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post("/firma", function(request, response) {
    helper.log("Service Firma: Client requested creation of new record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.name)) 
        errorMsgs.push("name fehlt");
    if (helper.isUndefined(request.body.inhaber)) 
        request.body.inhaber = null;
    if (helper.isUndefined(request.body.beschreibung)) 
        request.body.beschreibung = "";
    if (helper.isUndefined(request.body.adresse)) {
        errorMsgs.push("adresse fehlt");
    } else if (helper.isUndefined(request.body.adresse.id)) {
        errorMsgs.push("adresse gesetzt, aber id fehlt");
    }
    if (helper.isUndefined(request.body.branche)) {
        errorMsgs.push("branche fehlt");
    } else if (helper.isUndefined(request.body.branche.id)) {
        errorMsgs.push("branche gesetzt, aber id fehlt");
    }
    if (helper.isUndefined(request.body.ansprechpartner)) {
        request.body.ansprechpartner = null;
    } else if (helper.isUndefined(request.body.ansprechpartner.id)) {
        errorMsgs.push("ansprechpartner gesetzt, aber id fehlt");
    } else {
        request.body.ansprechpartner = request.body.ansprechpartner.id;
    }
    
    if (errorMsgs.length > 0) {
        helper.log("Service Firma: Creation not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Hinzufügen nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const firmaDao = new FirmaDao(request.app.locals.dbConnection);
    try {
        var result = firmaDao.create(request.body.name, request.body.inhaber, request.body.beschreibung, request.body.adresse.id, request.body.ansprechpartner, request.body.branche.id);
        helper.log("Service Firma: Record inserted");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Firma: Error creating new record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.put("/firma", function(request, response) {
    helper.log("Service Firma: Client requested update of existing record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push("id fehlt");
    if (helper.isUndefined(request.body.name)) 
        errorMsgs.push("name fehlt");
    if (helper.isUndefined(request.body.inhaber)) 
        request.body.inhaber = null;
    if (helper.isUndefined(request.body.beschreibung)) 
        request.body.beschreibung = "";
    if (helper.isUndefined(request.body.adresse)) {
        errorMsgs.push("adresse fehlt");
    } else if (helper.isUndefined(request.body.adresse.id)) {
        errorMsgs.push("adresse gesetzt, aber id fehlt");
    }
    if (helper.isUndefined(request.body.branche)) {
        errorMsgs.push("branche fehlt");
    } else if (helper.isUndefined(request.body.branche.id)) {
        errorMsgs.push("branche gesetzt, aber id fehlt");
    }
    if (helper.isUndefined(request.body.ansprechpartner)) {
        request.body.ansprechpartner = null;
    } else if (helper.isUndefined(request.body.ansprechpartner.id)) {
        errorMsgs.push("ansprechpartner gesetzt, aber id fehlt");
    } else {
        request.body.ansprechpartner = request.body.ansprechpartner.id;
    }

    if (errorMsgs.length > 0) {
        helper.log("Service Firma: Update not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Update nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const firmaDao = new FirmaDao(request.app.locals.dbConnection);
    try {
        var result = firmaDao.update(request.body.id, request.body.name, request.body.inhaber, request.body.beschreibung, request.body.adresse.id, request.body.ansprechpartner, request.body.branche.id);
        helper.log("Service Firma: Record updated, id=" + request.body.id);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Firma: Error updating record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.delete("/firma/:id", function(request, response) {
    helper.log("Service Firma: Client requested deletion of record, id=" + request.params.id);

    const firmaDao = new FirmaDao(request.app.locals.dbConnection);
    try {
        var obj = firmaDao.loadById(request.params.id);
        firmaDao.delete(request.params.id);
        helper.log("Service Firma: Deletion of record successfull, id=" + request.params.id);
        response.status(200).json(helper.jsonMsgOK({ "gelöscht": true, "eintrag": obj }));
    } catch (ex) {
        helper.logError("Service Firma: Error deleting record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

module.exports = serviceRouter;