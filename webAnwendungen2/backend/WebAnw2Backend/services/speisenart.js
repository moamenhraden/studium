const helper = require("../helper.js");
const SpeisenartDao = require("../dao/speisenartDao.js");
const express = require("express");
var serviceRouter = express.Router();

serviceRouter.get("/speisenart/gib/:id", function(request, response) {
    helper.log("Service Speisenart: Client requested one record, id=" + request.params.id);

    const speisenartDao = new SpeisenartDao(request.app.locals.dbConnection);
    try {
        var result = speisenartDao.loadById(request.params.id);
        helper.log("Service Speisenart: Record loaded");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Speisenart: Error loading record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/speisenart/alle", function(request, response) {
    helper.log("Service Speisenart: Client requested all records");

    const speisenartDao = new SpeisenartDao(request.app.locals.dbConnection);
    try {
        var result = speisenartDao.loadAll();
        helper.log("Service Speisenart: Records loaded, count=" + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Speisenart: Error loading all records. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/speisenart/existiert/:id", function(request, response) {
    helper.log("Service Speisenart: Client requested check, if record exists, id=" + request.params.id);

    const speisenartDao = new SpeisenartDao(request.app.locals.dbConnection);
    try {
        var result = speisenartDao.exists(request.params.id);
        helper.log("Service Speisenart: Check if record exists by id=" + request.params.id + ", result=" + result);
        response.status(200).json(helper.jsonMsgOK({ "id": request.params.id, "existiert": result }));
    } catch (ex) {
        helper.logError("Service Speisenart: Error checking if record exists. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post("/speisenart", function(request, response) {
    helper.log("Service Speisenart: Client requested creation of new record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");
    if (helper.isUndefined(request.body.beschreibung)) 
        request.body.beschreibung = "";
    if (helper.isUndefined(request.body.bildpfad)) 
        request.body.bildpfad = null;
    
    if (errorMsgs.length > 0) {
        helper.log("Service Speisenart: Creation not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Hinzufügen nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const speisenartDao = new SpeisenartDao(request.app.locals.dbConnection);
    try {
        var result = speisenartDao.create(request.body.bezeichnung, request.body.beschreibung, request.body.bildpfad);
        helper.log("Service Speisenart: Record inserted");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Speisenart: Error creating new record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.put("/speisenart", function(request, response) {
    helper.log("Service Speisenart: Client requested update of existing record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push("id fehlt");
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");
    if (helper.isUndefined(request.body.beschreibung)) 
        request.body.beschreibung = "";
    if (helper.isUndefined(request.body.bildpfad)) 
        request.body.bildpfad = null;

    if (errorMsgs.length > 0) {
        helper.log("Service Speisenart: Update not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Update nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const speisenartDao = new SpeisenartDao(request.app.locals.dbConnection);
    try {
        var result = speisenartDao.update(request.body.id, request.body.bezeichnung, request.body.beschreibung, request.body.bildpfad);
        helper.log("Service Speisenart: Record updated, id=" + request.body.id);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Speisenart: Error updating record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.delete("/speisenart/:id", function(request, response) {
    helper.log("Service Speisenart: Client requested deletion of record, id=" + request.params.id);

    const speisenartDao = new SpeisenartDao(request.app.locals.dbConnection);
    try {
        var obj = speisenartDao.loadById(request.params.id);
        speisenartDao.delete(request.params.id);
        helper.log("Service Speisenart: Deletion of record successfull, id=" + request.params.id);
        response.status(200).json(helper.jsonMsgOK({ "gelöscht": true, "eintrag": obj }));
    } catch (ex) {
        helper.logError("Service Speisenart: Error deleting record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

module.exports = serviceRouter;