const helper = require("../helper.js");
const AdresseDao = require("../dao/adresseDao.js");
const express = require("express");
var serviceRouter = express.Router();

serviceRouter.get("/adresse/gib/:id", function(request, response) {
    helper.log("Service Adresse: Client requested one record, id=" + request.params.id);

    const adresseDao = new AdresseDao(request.app.locals.dbConnection);
    try {
        var result = adresseDao.loadById(request.params.id);
        helper.log("Service Adresse: Record loaded");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Adresse: Error loading record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/adresse/alle", function(request, response) {
    helper.log("Service Adresse: Client requested all records");

    const adresseDao = new AdresseDao(request.app.locals.dbConnection);
    try {
        var result = adresseDao.loadAll();
        helper.log("Service Adresse: Records loaded, count=" + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Adresse: Error loading all records. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get("/adresse/existiert/:id", function(request, response) {
    helper.log("Service Adresse: Client requested check, if record exists, id=" + request.params.id);

    const adresseDao = new AdresseDao(request.app.locals.dbConnection);
    try {
        var result = adresseDao.exists(request.params.id);
        helper.log("Service Adresse: Check if record exists by id=" + request.params.id + ", result=" + result);
        response.status(200).json(helper.jsonMsgOK({ "id": request.params.id, "existiert": result }));
    } catch (ex) {
        helper.logError("Service Adresse: Error checking if record exists. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post("/adresse", function(request, response) {
    helper.log("Service Adresse: Client requested creation of new record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.strasse)) 
        errorMsgs.push("strasse fehlt");
    if (helper.isUndefined(request.body.hausnummer)) 
        errorMsgs.push("hausnummer fehlt");
    if (helper.isUndefined(request.body.adresszusatz)) 
        request.body.adresszusatz = "";
    if (helper.isUndefined(request.body.plz)) 
        errorMsgs.push("plz fehlt");
    if (helper.isUndefined(request.body.ort)) 
        errorMsgs.push("ort fehlt");
    if (helper.isUndefined(request.body.land)) {
        errorMsgs.push("land fehlt");
    } else if (helper.isUndefined(request.body.land.id)) {
        errorMsgs.push("land.id fehlt");
    }
    
    if (errorMsgs.length > 0) {
        helper.log("Service Adresse: Creation not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Hinzufügen nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const adresseDao = new AdresseDao(request.app.locals.dbConnection);
    try {
        var result = adresseDao.create(request.body.strasse, request.body.hausnummer, request.body.adresszusatz, request.body.plz, request.body.ort, request.body.land.id);
        helper.log("Service Adresse: Record inserted");
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Adresse: Error creating new record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.put("/adresse", function(request, response) {
    helper.log("Service Adresse: Client requested update of existing record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push("id fehl");
    if (helper.isUndefined(request.body.strasse)) 
        errorMsgs.push("strasse fehl");
    if (helper.isUndefined(request.body.hausnummer)) 
        errorMsgs.push("hausnummer fehl");
    if (helper.isUndefined(request.body.adresszusatz)) 
        request.body.adresszusatz = "";
    if (helper.isUndefined(request.body.plz)) 
        errorMsgs.push("plz fehl");
    if (helper.isUndefined(request.body.ort)) 
        errorMsgs.push("ort fehl");
    if (helper.isUndefined(request.body.land)) {
        errorMsgs.push("land fehl");
    } else if (helper.isUndefined(request.body.land.id)) {
        errorMsgs.push("land.id fehl");
    }

    if (errorMsgs.length > 0) {
        helper.log("Service Adresse: Update not possible, data missing");
        response.status(400).json(helper.jsonMsgError("Update nicht möglich. Fehlende Daten: " + helper.concatArray(errorMsgs)));
        return;
    }

    const adresseDao = new AdresseDao(request.app.locals.dbConnection);
    try {
        var result = adresseDao.update(request.body.id, request.body.strasse, request.body.hausnummer, request.body.adresszusatz, request.body.plz, request.body.ort, request.body.land.id);
        helper.log("Service Adresse: Record updated, id=" + request.body.id);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError("Service Adresse: Error updating record by id. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.delete("/adresse/:id", function(request, response) {
    helper.log("Service Adresse: Client requested deletion of record, id=" + request.params.id);

    const adresseDao = new AdresseDao(request.app.locals.dbConnection);
    try {
        var obj = adresseDao.loadById(request.params.id);
        adresseDao.delete(request.params.id);
        helper.log("Service Adresse: Deletion of record successfull, id=" + request.params.id);
        response.status(200).json(helper.jsonMsgOK({ "gelöscht": true, "eintrag": obj }));
    } catch (ex) {
        helper.logError("Service Adresse: Error deleting record. Exception occured: " + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

module.exports = serviceRouter;