const helper = require("../helper.js");
const ZutatDao = require("../dao/zutatDao.js");
const express = require("express");
var serviceRouter = express.Router();

serviceRouter.get("/zutat/gib/:id", function(request, response) {
    helper.log("Service Zutat: Client requested one record, id=" + request.params.id);

    const zutatDao = new ZutatDao(request.app.locals.dbConnection);
    try {
        var result = zutatDao.loadById(request.params.id);
        helper.log("Service Zutat: Record loaded");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Zutat: Error loading record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/zutat/alle", function(request, response) {
    helper.log("Service Zutat: Client requested all records");

    const zutatDao = new ZutatDao(request.app.locals.dbConnection);
    try {
        var result = zutatDao.loadAll();
        helper.log("Service Zutat: Records loaded, count=" + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Zutat: Error loading all records. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/zutat/existiert/:id", function(request, response) {
    helper.log("Service Zutat: Client requested check, if record exists, id=" + request.params.id);

    const zutatDao = new ZutatDao(request.app.locals.dbConnection);
    try {
        var result = zutatDao.exists(request.params.id);
        helper.log("Service Zutat: Check if record exists by id=" + request.params.id + ", result=" + result);
        response.status(200).json(helper.jsonMsgOK({ "id": request.params.id, "existiert": result }));
    } catch (ex) {
        helper.logError("Service Zutat: Error checking if record exists. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post("/zutat", function(request, response) {
    helper.log("Service Zutat: Client requested creation of new record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");
    if (helper.isUndefined(request.body.beschreibung)) 
        request.body.beschreibung = "";
    
    if (errorMsgs.length > 0) {
        helper.log("Service Zutat: Creation not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Hinzufügen nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const zutatDao = new ZutatDao(request.app.locals.dbConnection);
    try {
        var result = zutatDao.create(request.body.bezeichnung, request.body.beschreibung);
        helper.log("Service Zutat: Record inserted");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Zutat: Error creating new record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.put("/zutat", function(request, response) {
    helper.log("Service Zutat: Client requested update of existing record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push("id fehlt")
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");
    if (helper.isUndefined(request.body.beschreibung)) 
        request.body.beschreibung = "";

    if (errorMsgs.length > 0) {
        helper.log("Service Zutat: Update not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Update nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const zutatDao = new ZutatDao(request.app.locals.dbConnection);
    try {
        var result = zutatDao.update(request.body.id, request.body.bezeichnung, request.body.beschreibung);
        helper.log("Service Zutat: Record updated, id=" + request.body.id);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Zutat: Error updating record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.delete("/zutat/:id", function(request, response) {
    helper.log("Service Zutat: Client requested deletion of record, id=" + request.params.id);

    const zutatDao = new ZutatDao(request.app.locals.dbConnection);
    try {
        var obj = zutatDao.loadById(request.params.id);
        zutatDao.delete(request.params.id);
        helper.log("Service Zutat: Deletion of record successfull, id=" + request.params.id);
        response.status(200).json(helper.jsonMsgOK({ "gelöscht": true, "eintrag": obj }));
    } catch (ex) {
        helper.logError("Service Zutat: Error deleting record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

module.exports = serviceRouter;