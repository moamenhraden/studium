const helper = require("../helper.js");
const GerichtDao = require("../dao/gerichtDao.js");
const express = require("express");
var serviceRouter = express.Router();

serviceRouter.get("/gericht/gib/:id", function(request, response) {
    helper.log("Service Gericht: Client requested one record, id=" + request.params.id);

    const gerichtDao = new GerichtDao(request.app.locals.dbConnection);
    try {
        var result = gerichtDao.loadById(request.params.id);
        helper.log("Service Gericht: Record loaded");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Gericht: Error loading record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/gericht/alle/", function(request, response) {
    helper.log("Service Gericht: Client requested all records");

    const gerichtDao = new GerichtDao(request.app.locals.dbConnection);
    try {
        var result = gerichtDao.loadAll();
        helper.log("Service Gericht: Records loaded, count=" + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Gericht: Error loading all records. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/gericht/existiert/:id", function(request, response) {
    helper.log("Service Gericht: Client requested check, if record exists, id=" + request.params.id);

    const gerichtDao = new GerichtDao(request.app.locals.dbConnection);
    try {
        var result = gerichtDao.exists(request.params.id);
        helper.log("Service Gericht: Check if record exists by id=" + request.params.id + ", result=" + result);
        response.status(200).json(helper.jsonMsgOK({ "id": request.params.id, "existiert": result }));
    } catch (ex) {
        helper.logError("Service Gericht: Error checking if record exists. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post("/gericht", function(request, response) {
    helper.log("Service Gericht: Client requested creation of new record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");
    if (helper.isUndefined(request.body.speisenart)) {
        errorMsgs.push("speisenart fehlt");
    } else if (helper.isUndefined(request.body.speisenart.id)) {
        errorMsgs.push("speisenart gesetzt, aber id fehlt");
    }        
    if (helper.isUndefined(request.body.zubereitung)) 
        errorMsgs.push("zubereitung fehlt");
    if (helper.isUndefined(request.body.bildpfad)) 
        request.body.bildpfad = null;
    if (helper.isUndefined(request.body.zutatenliste)) {
        errorMsgs.push("zutatenliste fehlt");
    } else if (!helper.isArray(request.body.zutatenliste)) {
        errorMsgs.push("zutatenliste fehlt");
    } else  if (helper.isArrayEmpty(request.body.zutatenliste)) {
        errorMsgs.push("zutatenliste ist leer");
    }
    if (helper.isUndefined(request.body.bewertungen)) {
        request.body.bewertungen = [];
    } else if (!helper.isArray(request.body.bewertungen)) {
        request.body.bewertungen = [];
    }
    
    if (errorMsgs.length > 0) {
        helper.log("Service Gericht: Creation not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Hinzufügen nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const gerichtDao = new GerichtDao(request.app.locals.dbConnection);
    try {
        var result = gerichtDao.create(request.body.bezeichnung, request.body.speisenart.id, request.body.zubereitung, request.body.bildpfad, request.body.zutatenliste, request.body.bewertungen);
        helper.log("Service Gericht: Record inserted");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Gericht: Error creating new record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.put("/gericht", function(request, response) {
    helper.log("Service Gericht: Client requested update of existing record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push("id fehlt");
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");
    if (helper.isUndefined(request.body.speisenart)) {
        errorMsgs.push("speisenart fehlt");
    } else if (helper.isUndefined(request.body.speisenart.id)) {
        errorMsgs.push("speisenart gesetzt, aber id fehlt");
    }        
    if (helper.isUndefined(request.body.zubereitung)) 
        errorMsgs.push("zubereitung fehlt");
    if (helper.isUndefined(request.body.bildpfad)) 
        request.body.bildpfad = null;
    if (helper.isUndefined(request.body.zutatenliste)) {
        errorMsgs.push("zutatenliste fehlt");
    } else if (!helper.isArray(request.body.zutatenliste)) {
        errorMsgs.push("zutatenliste fehlt");
    } else  if (helper.isArrayEmpty(request.body.zutatenliste)) {
        errorMsgs.push("zutatenliste ist leer");
    }
    if (helper.isUndefined(request.body.bewertungen)) {
        request.body.bewertungen = [];
    } else if (!helper.isArray(request.body.bewertungen)) {
        request.body.bewertungen = [];
    }

    if (errorMsgs.length > 0) {
        helper.log("Service Gericht: Update not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Update nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const gerichtDao = new GerichtDao(request.app.locals.dbConnection);
    try {
        var result = gerichtDao.update(request.body.id, request.body.bezeichnung, request.body.speisenart.id, request.body.zubereitung, request.body.bildpfad, request.body.zutatenliste, request.body.bewertungen);
        helper.log("Service Gericht: Record updated, id=" + request.body.id);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Gericht: Error updating record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.delete("/gericht/:id", function(request, response) {
    helper.log("Service Gericht: Client requested deletion of record, id=" + request.params.id);

    const gerichtDao = new GerichtDao(request.app.locals.dbConnection);
    try {
        var obj = gerichtDao.loadById(request.params.id);
        gerichtDao.delete(request.params.id);
        helper.log("Service Gericht: Deletion of record successfull, id=" + request.params.id);
        response.status(200).json(helper.jsonMsgOK({ "gelöscht": true, "eintrag": obj }));
    } catch (ex) {
        helper.logError("Service Gericht: Error deleting record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

module.exports = serviceRouter;