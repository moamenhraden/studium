const helper = require("../helper.js");
const ProduktkategorieDao = require("../dao/produktkategorieDao.js");
const express = require("express");
var serviceRouter = express.Router();

serviceRouter.get("/produktkategorie/gib/:id", function(request, response) {
    helper.log("Service Produktkategorie: Client requested one record, id=" + request.params.id);

    const produktkategorieDao = new ProduktkategorieDao(request.app.locals.dbConnection);
    try {
        var result = produktkategorieDao.loadById(request.params.id);
        helper.log("Service Produktkategorie: Record loaded");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Produktkategorie: Error loading record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/produktkategorie/alle", function(request, response) {
    helper.log("Service Produktkategorie: Client requested all records");

    const produktkategorieDao = new ProduktkategorieDao(request.app.locals.dbConnection);
    try {
        var result = produktkategorieDao.loadAll();
        helper.log("Service Produktkategorie: Records loaded, count=" + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Produktkategorie: Error loading all records. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/produktkategorie/existiert/:id", function(request, response) {
    helper.log("Service Produktkategorie: Client requested check, if record exists, id=" + request.params.id);

    const produktkategorieDao = new ProduktkategorieDao(request.app.locals.dbConnection);
    try {
        var result = produktkategorieDao.exists(request.params.id);
        helper.log("Service Produktkategorie: Check if record exists by id=" + request.params.id + ", result=" + result);
        response.status(200).json(helper.jsonMsgOK({ "id": request.params.id, "existiert": result }));
    } catch (ex) {
        helper.logError("Service Produktkategorie: Error checking if record exists. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post("/produktkategorie", function(request, response) {
    helper.log("Service Produktkategorie: Client requested creation of new record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");
    
    if (errorMsgs.length > 0) {
        helper.log("Service Produktkategorie: Creation not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Hinzufügen nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const produktkategorieDao = new ProduktkategorieDao(request.app.locals.dbConnection);
    try {
        var result = produktkategorieDao.create(request.body.bezeichnung);
        helper.log("Service Produktkategorie: Record inserted");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Produktkategorie: Error creating new record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.put("/produktkategorie", function(request, response) {
    helper.log("Service Produktkategorie: Client requested update of existing record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push("id fehlt");
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");

    if (errorMsgs.length > 0) {
        helper.log("Service Produktkategorie: Update not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Update nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const produktkategorieDao = new ProduktkategorieDao(request.app.locals.dbConnection);
    try {
        var result = produktkategorieDao.update(request.body.id, request.body.bezeichnung);
        helper.log("Service Produktkategorie: Record updated, id=" + request.body.id);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Produktkategorie: Error updating record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.delete("/produktkategorie/:id", function(request, response) {
    helper.log("Service Produktkategorie: Client requested deletion of record, id=" + request.params.id);

    const produktkategorieDao = new ProduktkategorieDao(request.app.locals.dbConnection);
    try {
        var obj = produktkategorieDao.loadById(request.params.id);
        produktkategorieDao.delete(request.params.id);
        helper.log("Service Produktkategorie: Deletion of record successfull, id=" + request.params.id);
        response.status(200).json(helper.jsonMsgOK({ "gelöscht": true, "eintrag": obj }));
    } catch (ex) {
        helper.logError("Service Produktkategorie: Error deleting record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

module.exports = serviceRouter;