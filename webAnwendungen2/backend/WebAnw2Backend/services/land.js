const helper = require("../helper.js");
const LandDao = require("../dao/landDao.js");
const express = require("express");
var serviceRouter = express.Router();

serviceRouter.get("/land/gib/:id", function(request, response) {
    helper.log("Service Land: Client requested one record, id=" + request.params.id);

    const landDao = new LandDao(request.app.locals.dbConnection);
    try {
        var result = landDao.loadById(request.params.id);
        helper.log("Service Land: Record loaded");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Land: Error loading record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/land/alle", function(request, response) {
    helper.log("Service Land: Client requested all records");

    const landDao = new LandDao(request.app.locals.dbConnection);
    try {
        var result = landDao.loadAll();
        helper.log("Service Land: Records loaded, count=" + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Land: Error loading all records. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/land/existiert/:id", function(request, response) {
    helper.log("Service Land: Client requested check, if record exists, id=" + request.params.id);

    const landDao = new LandDao(request.app.locals.dbConnection);
    try {
        var result = landDao.exists(request.params.id);
        helper.log("Service Land: Check if record exists by id=" + request.params.id + ", result=" + result);
        response.status(200).json(helper.jsonMsgOK({ "id": request.params.id, "existiert": result }));
    } catch (ex) {
        helper.logError("Service Land: Error checking if record exists. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post("/land", function(request, response) {
    helper.log("Service Land: Client requested creation of new record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.kennzeichnung)) 
        errorMsgs.push("kennzeichnung fehlt");
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");
    
    if (errorMsgs.length > 0) {
        helper.log("Service Land: Creation not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Hinzufügen nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const landDao = new LandDao(request.app.locals.dbConnection);
    try {
        var result = landDao.create(request.body.kennzeichnung, request.body.bezeichnung);
        helper.log("Service Land: Record inserted");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Land: Error creating new record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.put("/land", function(request, response) {
    helper.log("Service Land: Client requested update of existing record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push("id fehlt");
    if (helper.isUndefined(request.body.kennzeichnung)) 
        errorMsgs.push("kennzeichnung fehlt");
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");

    if (errorMsgs.length > 0) {
        helper.log("Service Land: Update not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Update nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const landDao = new LandDao(request.app.locals.dbConnection);
    try {
        var result = landDao.update(request.body.id, request.body.kennzeichnung, request.body.bezeichnung);
        helper.log("Service Land: Record updated, id=" + request.body.id);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Land: Error updating record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.delete("/land/:id", function(request, response) {
    helper.log("Service Land: Client requested deletion of record, id=" + request.params.id);

    const landDao = new LandDao(request.app.locals.dbConnection);
    try {
        var obj = landDao.loadById(request.params.id);
        landDao.delete(request.params.id);
        helper.log("Service Land: Deletion of record successfull, id=" + request.params.id);
        response.status(200).json(helper.jsonMsgOK({ "gelöscht": true, "eintrag": obj }));
    } catch (ex) {
        helper.logError("Service Land: Error deleting record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

module.exports = serviceRouter;