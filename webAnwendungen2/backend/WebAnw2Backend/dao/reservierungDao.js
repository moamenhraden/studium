const helper = require("../helper.js");
const ReserviertersitzDao = require("./reserviertersitzDao.js");
const ReserviererDao = require("./reserviererDao.js");
const ZahlungsartDao = require("./zahlungsartDao.js");

class ReservierungDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        const reserviertersitzDao = new ReserviertersitzDao(this._conn);
        const reserviererDao = new ReserviererDao(this._conn);
        const zahlungsartDao = new ZahlungsartDao(this._conn);

        var sql = "SELECT * FROM Reservierung WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error("No Record found by id=" + id);

        result = helper.objectKeysToLower(result);

        result.zeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result.zeitpunkt));

        result.reservierer = reserviererDao.loadById(result.reserviererid);
        delete result.reserviererid;

        result.zahlungsart = zahlungsartDao.loadById(result.zahlungsartid);
        delete result.zahlungsartid;

        result.vorstellung = { "id": result.vorstellungid };
        delete result.vorstellungid;

        result.reserviertesitze = reserviertersitzDao.loadAllByParent(result.id);
        
        return result;
    }

    loadAll() {
        const reserviertersitzDao = new ReserviertersitzDao(this._conn);
        var seats = reserviertersitzDao.loadAll();
        const reserviererDao = new ReserviererDao(this._conn);
        var persons = reserviererDao.loadAll();
        const zahlungsartDao = new ZahlungsartDao(this._conn);
        var methods = zahlungsartDao.loadAll();

        var sql = "SELECT * FROM Reservierung";
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];

        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            result[i].zeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result[i].zeitpunkt));

            if (helper.isNull(result[i].reserviererid)) {
                result[i].reservierer = null;
            } else {
                for (var element of persons) {
                    if (element.id == result[i].reserviererid) {
                        result[i].reservierer = element;
                        break;
                    }
                }
            }
            delete result[i].reserviererid;

            for (var element of methods) {
                if (element.id == result[i].zahlungsartid) {
                    result[i].zahlungsart = element;
                    break;
                }
            }
            delete result[i].zahlungsartid;

            result[i].vorstellung = { "id": result[i].vorstellungid };
            delete result[i].vorstellungid;

            result[i].reserviertesitze = [];

            for (var element of seats) {
                if (element.reservierung.id == result[i].id) {
                    result[i].reserviertesitze.push(element);    
                }                
            }
        }

        return result;
    }

    loadAllByParent(id) {
        const reserviertersitzDao = new ReserviertersitzDao(this._conn);
        var seats = reserviertersitzDao.loadAll();
        const reserviererDao = new ReserviererDao(this._conn);
        var persons = reserviererDao.loadAll();
        const zahlungsartDao = new ZahlungsartDao(this._conn);
        var methods = zahlungsartDao.loadAll();

        var sql = "SELECT * FROM Reservierung WHERE VorstellungID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.all(id);

        if (helper.isArrayEmpty(result)) 
            return [];

        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            result[i].zeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result[i].zeitpunkt));

            if (helper.isNull(result[i].reserviererid)) {
                result[i].reservierer = null;
            } else {
                for (var element of persons) {
                    if (element.id == result[i].reserviererid) {
                        result[i].reservierer = element;
                        break;
                    }
                }
            }
            delete result[i].reserviererid;

            for (var element of methods) {
                if (element.id == result[i].zahlungsartid) {
                    result[i].zahlungsart = element;
                    break;
                }
            }
            delete result[i].zahlungsartid;

            result[i].vorstellung = { "id": result[i].vorstellungid };
            delete result[i].vorstellungid;

            result[i].reserviertesitze = [];

            for (var element of seats) {
                if (element.reservierung.id == result[i].id) {
                    result[i].reserviertesitze.push(element);    
                }                
            }
        }

        return result;
    }

    exists(id) {
        var sql = "SELECT COUNT(ID) AS cnt FROM Reservierung WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(zeitpunkt = null, reserviererid = 1, zahlungsartid = 1, vorstellungid = 1, reserviertesitze = []) {
        const reserviertersitzDao = new ReserviertersitzDao(this._conn);

        if (helper.isNull(zeitpunkt)) 
            zeitpunkt = helper.getNow();

        var sql = "INSERT INTO Reservierung (Zeitpunkt,ReserviererID,ZahlungsartID,VorstellungID) VALUES (?,?,?,?)";
        var statement = this._conn.prepare(sql);
        var params = [helper.formatToSQLDateTime(zeitpunkt), reserviererid, zahlungsartid, vorstellungid];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not insert new Record. Data: " + params);

        if (reserviertesitze.length > 0) {
            for (var element of reserviertesitze) {
                reserviertersitzDao.create(result.lastInsertRowid, element.reihe, element.sitzplatz);
            }
        }

        var newObj = this.loadById(result.lastInsertRowid);
        return newObj;
    }

    update(id, zeitpunkt = null, reserviererid = 1, zahlungsartid = 1, vorstellungid = 1, reserviertesitze = []) {
        const reserviertersitzDao = new ReserviertersitzDao(this._conn);
        reserviertersitzDao.deleteByParent(id);

        if (helper.isNull(zeitpunkt)) 
            zeitpunkt = helper.getNow();

        var sql = "UPDATE Reservierung SET Zeitpunkt=?,ReserviererID=?,ZahlungsartID=?,VorstellungID=? WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var params = [helper.formatToSQLDateTime(zeitpunkt), reserviererid, zahlungsartid, vorstellungid, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not update existing Record. Data: " + params);
        
        if (reserviertesitze.length > 0) {
            for (var element of reserviertesitze) {
                reserviertersitzDao.create(id, element.reihe, element.sitzplatz);
            }
        }

        var updatedObj = this.loadById(id);
        return updatedObj;
    }

    delete(id) {
        try {
            const reserviertersitzDao = new ReserviertersitzDao(this._conn);
            reserviertersitzDao.deleteByParent(id);

            var sql = "DELETE FROM Reservierung WHERE ID=?";
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            if (result.changes != 1) 
                throw new Error("Could not delete Record by id=" + id);

            return true;
        } catch (ex) {
            throw new Error("Could not delete Record by id=" + id + ". Reason: " + ex.message);
        }
    }

    deleteByParent(id) {
        try {
            
            // get all recs
            var sql = "SELECT ID FROM Reservierung WHERE VorstellungID=?";
            var statement = this._conn.prepare(sql);
            var result = statement.all(id);

            if (!helper.isArrayEmpty(result)) {
                var idlist = "";
                for (var n = 0; n < result.length; n++) {
                    idlist += result[n].ID;
                    if (n < result.length - 1) 
                        idlist += ",";
                }

                // delete the childs
                sql = "DELETE FROM ReservierterSitz WHERE ReservierungID IN (?)";
                statement = this._conn.prepare(sql);
                statement.run(idlist);

                // delete the main recs
                sql = "DELETE FROM Reservierung WHERE ID IN (?)";
                statement = this._conn.prepare(sql);
                statement.run(idlist);
            }

            return true;
        } catch (ex) {
            throw new Error("Could not delete Records by parent id=" + id + ". Reason: " + ex.message);
        }
    }

    toString() {
        helper.log("ReservierungDao [_conn=" + this._conn + "]");
    }
}

module.exports = ReservierungDao;