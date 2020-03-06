const helper = require("../helper.js");
const BrancheDao = require("../dao/brancheDao.js");
const express = require("express");
var serviceRouter = express.Router();

serviceRouter.get("/branche/gib/:id", function(request, response) {
    helper.log("Service Branche: Client requested one record, id=" + request.params.id);

    const brancheDao = new BrancheDao(request.app.locals.dbConnection);
    try {
        var result = brancheDao.loadById(request.params.id);
        helper.log("Service Branche: Record loaded");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Branche: Error loading record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/branche/alle", function(request, response) {
    helper.log("Service Branche: Client requested all records");

    const brancheDao = new BrancheDao(request.app.locals.dbConnection);
    try {
        var result = brancheDao.loadAll();
        helper.log("Service Branche: Records loaded, count=" + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Branche: Error loading all records. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/branche/existiert/:id", function(request, response) {
    helper.log("Service Branche: Client requested check, if record exists, id=" + request.params.id);

    const brancheDao = new BrancheDao(request.app.locals.dbConnection);
    try {
        var result = brancheDao.exists(request.params.id);
        helper.log("Service Branche: Check if record exists by id=" + request.params.id + ", result=" + result);
        response.status(200).json(helper.jsonMsgOK({ "id": request.params.id, "existiert": result }));
    } catch (ex) {
        helper.logError("Service Branche: Error checking if record exists. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post("/branche", function(request, response) {
    helper.log("Service Branche: Client requested creation of new record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");
    
    if (errorMsgs.length > 0) {
        helper.log("Service Branche: Creation not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Hinzufügen nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const brancheDao = new BrancheDao(request.app.locals.dbConnection);
    try {
        var result = brancheDao.create(request.body.bezeichnung);
        helper.log("Service Branche: Record inserted");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Branche: Error creating new record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.put("/branche", function(request, response) {
    helper.log("Service Branche: Client requested update of existing record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push("id fehlt");
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");

    if (errorMsgs.length > 0) {
        helper.log("Service Branche: Update not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Update nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const brancheDao = new BrancheDao(request.app.locals.dbConnection);
    try {
        var result = brancheDao.update(request.body.id, request.body.bezeichnung);
        helper.log("Service Branche: Record updated, id=" + request.body.id);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Branche: Error updating record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.delete("/branche/:id", function(request, response) {
    helper.log("Service Branche: Client requested deletion of record, id=" + request.params.id);

    const brancheDao = new BrancheDao(request.app.locals.dbConnection);
    try {
        var obj = brancheDao.loadById(request.params.id);
        brancheDao.delete(request.params.id);
        helper.log("Service Branche: Deletion of record successfull, id=" + request.params.id);
        response.status(200).json(helper.jsonMsgOK({ "gelöscht": true, "eintrag": obj }));
    } catch (ex) {
        helper.logError("Service Branche: Error deleting record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

module.exports = serviceRouter;