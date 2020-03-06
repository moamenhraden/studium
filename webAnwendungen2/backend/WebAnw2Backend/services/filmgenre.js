const helper = require("../helper.js");
const FilmgenreDao = require("../dao/filmgenreDao.js");
const express = require("express");
var serviceRouter = express.Router();

serviceRouter.get("/filmgenre/gib/:id", function(request, response) {
    helper.log("Service Filmgenre: Client requested one record, id=" + request.params.id);

    const filmgenreDao = new FilmgenreDao(request.app.locals.dbConnection);
    try {
        var result = filmgenreDao.loadById(request.params.id);
        helper.log("Service Filmgenre: Record loaded");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Filmgenre: Error loading record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/filmgenre/alle", function(request, response) {
    helper.log("Service Filmgenre: Client requested all records");

    const filmgenreDao = new FilmgenreDao(request.app.locals.dbConnection);
    try {
        var result = filmgenreDao.loadAll();
        helper.log("Service Filmgenre: Records loaded, count=" + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Filmgenre: Error loading all records. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/filmgenre/existiert/:id", function(request, response) {
    helper.log("Service Filmgenre: Client requested check, if record exists, id=" + request.params.id);

    const filmgenreDao = new FilmgenreDao(request.app.locals.dbConnection);
    try {
        var result = filmgenreDao.exists(request.params.id);
        helper.log("Service Filmgenre: Check if record exists by id=" + request.params.id + ", result=" + result);
        response.status(200).json(helper.jsonMsgOK({ "id": request.params.id, "existiert": result }));
    } catch (ex) {
        helper.logError("Service Filmgenre: Error checking if record exists. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post("/filmgenre", function(request, response) {
    helper.log("Service Filmgenre: Client requested creation of new record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");
    
    if (errorMsgs.length > 0) {
        helper.log("Service Filmgenre: Creation not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Hinzufügen nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const filmgenreDao = new FilmgenreDao(request.app.locals.dbConnection);
    try {
        var result = filmgenreDao.create(request.body.bezeichnung);
        helper.log("Service Filmgenre: Record inserted");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Filmgenre: Error creating new record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.put("/filmgenre", function(request, response) {
    helper.log("Service Filmgenre: Client requested update of existing record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push("id fehlt");
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");

    if (errorMsgs.length > 0) {
        helper.log("Service Filmgenre: Update not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Update nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const filmgenreDao = new FilmgenreDao(request.app.locals.dbConnection);
    try {
        var result = filmgenreDao.update(request.body.id, request.body.bezeichnung);
        helper.log("Service Filmgenre: Record updated, id=" + request.body.id);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Filmgenre: Error updating record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.delete("/filmgenre/:id", function(request, response) {
    helper.log("Service Filmgenre: Client requested deletion of record, id=" + request.params.id);

    const filmgenreDao = new FilmgenreDao(request.app.locals.dbConnection);
    try {
        var obj = filmgenreDao.loadById(request.params.id);
        filmgenreDao.delete(request.params.id);
        helper.log("Service Filmgenre: Deletion of record successfull, id=" + request.params.id);
        response.status(200).json(helper.jsonMsgOK({ "gelöscht": true, "eintrag": obj }));
    } catch (ex) {
        helper.logError("Service Filmgenre: Error deleting record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

module.exports = serviceRouter;