const helper = require("../helper.js");
const DownloadDao = require("../dao/downloadDao.js");
const express = require("express");
var serviceRouter = express.Router();

serviceRouter.get("/download/gib/:id", function(request, response) {
    helper.log("Service Download: Client requested one record, id=" + request.params.id);

    const downloadDao = new DownloadDao(request.app.locals.dbConnection);
    try {
        var result = downloadDao.loadById(request.params.id);
        helper.log("Service Download: Record loaded");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Download: Error loading record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/download/alle", function(request, response) {
    helper.log("Service Download: Client requested all records");

    const downloadDao = new DownloadDao(request.app.locals.dbConnection);
    try {
        var result = downloadDao.loadAll();
        helper.log("Service Download: Records loaded, count=" + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Download: Error loading all records. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/download/existiert/:id", function(request, response) {
    helper.log("Service Download: Client requested check, if record exists, id=" + request.params.id);

    const downloadDao = new DownloadDao(request.app.locals.dbConnection);
    try {
        var result = downloadDao.exists(request.params.id);
        helper.log("Service Download: Check if record exists by id=" + request.params.id + ", result=" + result);
        response.status(200).json(helper.jsonMsgOK({ "id": request.params.id, "existiert": result }));
    } catch (ex) {
        helper.logError("Service Download: Error checking if record exists. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post("/download", function(request, response) {
    helper.log("Service Download: Client requested creation of new record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");
    if (helper.isUndefined(request.body.beschreibung)) 
        request.body.beschreibung = "";
    if (helper.isUndefined(request.body.dateipfad)) 
        errorMsgs.push("dateipfad fehlt");
    
    if (errorMsgs.length > 0) {
        helper.log("Service Download: Creation not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Hinzufügen nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const downloadDao = new DownloadDao(request.app.locals.dbConnection);
    try {
        var result = downloadDao.create(request.body.bezeichnung, request.body.beschreibung, request.body.dateipfad);
        helper.log("Service Download: Record inserted");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Download: Error creating new record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.put("/download", function(request, response) {
    helper.log("Service Download: Client requested update of existing record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push("id fehlt");
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");
    if (helper.isUndefined(request.body.beschreibung)) 
        request.body.beschreibung = "";
    if (helper.isUndefined(request.body.dateipfad)) 
        errorMsgs.push("dateipfad fehlt");

    if (errorMsgs.length > 0) {
        helper.log("Service Download: Update not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Update nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const downloadDao = new DownloadDao(request.app.locals.dbConnection);
    try {
        var result = downloadDao.update(request.body.id, request.body.bezeichnung, request.body.beschreibung, request.body.dateipfad);
        helper.log("Service Download: Record updated, id=" + request.body.id);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Download: Error updating record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.delete("/download/:id", function(request, response) {
    helper.log("Service Download: Client requested deletion of record, id=" + request.params.id);

    const downloadDao = new DownloadDao(request.app.locals.dbConnection);
    try {
        var obj = downloadDao.loadById(request.params.id);
        downloadDao.delete(request.params.id);
        helper.log("Service Download: Deletion of record successfull, id=" + request.params.id);
        response.status(200).json(helper.jsonMsgOK({ "gelöscht": true, "eintrag": obj }));
    } catch (ex) {
        helper.logError("Service Download: Error deleting record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

module.exports = serviceRouter;