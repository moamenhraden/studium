const helper = require("../helper.js");
const EinheitDao = require("../dao/einheitDao.js");
const express = require("express");
var serviceRouter = express.Router();

serviceRouter.get("/einheit/gib/:id", function(request, response) {
    helper.log("Service Einheit: Client requested one record, id=" + request.params.id);

    const einheitDao = new EinheitDao(request.app.locals.dbConnection);
    try {
        var result = einheitDao.loadById(request.params.id);
        helper.log("Service Einheit: Record loaded");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Einheit: Error loading record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/einheit/alle", function(request, response) {
    helper.log("Service Einheit: Client requested all records");

    const einheitDao = new EinheitDao(request.app.locals.dbConnection);
    try {
        var result = einheitDao.loadAll();
        helper.log("Service Einheit: Records loaded, count=" + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Einheit: Error loading all records. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/einheit/existiert/:id", function(request, response) {
    helper.log("Service Einheit: Client requested check, if record exists, id=" + request.params.id);

    const einheitDao = new EinheitDao(request.app.locals.dbConnection);
    try {
        var result = einheitDao.exists(request.params.id);
        helper.log("Service Einheit: Check if record exists by id=" + request.params.id + ", result=" + result);
        response.status(200).json(helper.jsonMsgOK({ "id": request.params.id, "existiert": result }));
    } catch (ex) {
        helper.logError("Service Einheit: Error checking if record exists. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post("/einheit", function(request, response) {
    helper.log("Service Einheit: Client requested creation of new record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");
    
    if (errorMsgs.length > 0) {
        helper.log("Service Einheit: Creation not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Hinzufügen nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const einheitDao = new EinheitDao(request.app.locals.dbConnection);
    try {
        var result = einheitDao.create(request.body.bezeichnung);
        helper.log("Service Einheit: Record inserted");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Einheit: Error creating new record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.put("/einheit", function(request, response) {
    helper.log("Service Einheit: Client requested update of existing record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push("id fehlt");
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");

    if (errorMsgs.length > 0) {
        helper.log("Service Einheit: Update not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Update nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const einheitDao = new EinheitDao(request.app.locals.dbConnection);
    try {
        var result = einheitDao.update(request.body.id, request.body.bezeichnung);
        helper.log("Service Einheit: Record updated, id=" + request.body.id);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Einheit: Error updating record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.delete("/einheit/:id", function(request, response) {
    helper.log("Service Einheit: Client requested deletion of record, id=" + request.params.id);

    const einheitDao = new EinheitDao(request.app.locals.dbConnection);
    try {
        var obj = einheitDao.loadById(request.params.id);
        einheitDao.delete(request.params.id);
        helper.log("Service Einheit: Deletion of record successfull, id=" + request.params.id);
        response.status(200).json(helper.jsonMsgOK({ "gelöscht": true, "eintrag": obj }));
    } catch (ex) {
        helper.logError("Service Einheit: Error deleting record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

module.exports = serviceRouter;