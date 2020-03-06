const helper = require("../helper.js");
const FirmaDao = require("./firmaDao.js");

class TerminDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        const firmaDao = new FirmaDao(this._conn);

        var sql = "SELECT * FROM Termin WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error("No Record found by id=" + id);

        result = helper.objectKeysToLower(result);

        var dt = helper.parseSQLDateTimeString(result.zeitpunkt);
        result.zeitpunkt = helper.formatToGermanDateTime(dt);
        result.millisekunden = { "von": helper.formatToMilliseconds(dt), "bis": helper.formatToMilliseconds(helper.modifyDateTime(dt, 0, 0, 0, 0, result.dauer, 0)), "dauer": (result.dauer * 60 * 1000) };

        if (helper.isNull(result.dienstleisterid)) {
            result.dienstleister = null;
        } else {
            result.dienstleister = firmaDao.loadById(result.dienstleisterid);
        }
        delete result.dienstleisterid;

        return result;
    }

    loadAll() {
        const firmaDao = new FirmaDao(this._conn);
        var companies = firmaDao.loadAll();

        var sql = "SELECT * FROM Termin";
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];
        
        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            var dt = helper.parseSQLDateTimeString(result[i].zeitpunkt);
            result[i].zeitpunkt = helper.formatToGermanDateTime(dt);
            result[i].millisekunden = { "von": helper.formatToMilliseconds(dt), "bis": helper.formatToMilliseconds(helper.modifyDateTime(dt, 0, 0, 0, 0, result[i].dauer, 0)), "dauer": (result[i].dauer * 60 * 1000) };

            if (helper.isNull(result[i].dienstleisterid)) {
                result[i].dienstleister = null;
            } else {
                for (var element of companies) {
                    if (element.id == result[i].dienstleisterid) {
                        result[i].dienstleister = element;
                        break;
                    }
                }
            }
            delete result[i].dienstleisterid;
        }

        return result;
    }

    loadAllByDienstleister(id) {
        const firmaDao = new FirmaDao(this._conn);
        var company = firmaDao.loadById(id);

        var sql = "SELECT * FROM Termin WHERE DienstleisterID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.all(id);

        if (helper.isArrayEmpty(result)) 
            return [];
        
        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            var dt = helper.parseSQLDateTimeString(result[i].zeitpunkt);
            result[i].zeitpunkt = helper.formatToGermanDateTime(dt);
            result[i].millisekunden = { "von": helper.formatToMilliseconds(dt), "bis": helper.formatToMilliseconds(helper.modifyDateTime(dt, 0, 0, 0, 0, result[i].dauer, 0)), "dauer": (result[i].dauer * 60 * 1000) };

            result[i].dienstleister = company;
            delete result[i].dienstleisterid;
        }

        return result;
    }

    loadRange(from, till, companyid = null) {
        const firmaDao = new FirmaDao(this._conn);
        var companies = firmaDao.loadAll();

        if (helper.isNull(companyid)) {
            var sql = "SELECT * FROM Termin WHERE Zeitpunkt BETWEEN ? AND ?";
            var statement = this._conn.prepare(sql);
            var params = [helper.formatToSQLDateTime(from), helper.formatToSQLDateTime(till)];
        } else {
            var sql = "SELECT * FROM Termin WHERE Zeitpunkt BETWEEN ? AND ? AND DienstleisterID=?";
            var statement = this._conn.prepare(sql);
            var params = [helper.formatToSQLDateTime(from), helper.formatToSQLDateTime(till), companyid];
        }
        var result = statement.all(params);

        if (helper.isArrayEmpty(result)) 
            return [];
        
        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            var dt = helper.parseSQLDateTimeString(result[i].zeitpunkt);
            result[i].zeitpunkt = helper.formatToGermanDateTime(dt);
            result[i].millisekunden = { "von": helper.formatToMilliseconds(dt), "bis": helper.formatToMilliseconds(helper.modifyDateTime(dt, 0, 0, 0, 0, result[i].dauer, 0)), "dauer": (result[i].dauer * 60 * 1000) };

            if (helper.isNull(result[i].dienstleisterid)) {
                result[i].dienstleister = null;
            } else {
                for (var element of companies) {
                    if (element.id == result[i].dienstleisterid) {
                        result[i].dienstleister = element;
                        break;
                    }
                }
            }
            delete result[i].dienstleisterid;
        }

        return result;
    }

    exists(id) {
        var sql = "SELECT COUNT(ID) AS cnt FROM Termin WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(bezeichnung = "", beschreibung = "", zeitpunkt = null, dauer = 60, dienstleisterid = null) {
        if (helper.isNull(zeitpunkt)) 
            zeitpunkt = helper.getNow();

        var sql = "INSERT INTO Termin (Bezeichnung,Beschreibung,Zeitpunkt,Dauer,DienstleisterID) VALUES (?,?,?,?,?)";
        var statement = this._conn.prepare(sql);
        var params = [bezeichnung, beschreibung, helper.formatToSQLDateTime(zeitpunkt), dauer, dienstleisterid];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not insert new Record. Data: " + params);

        var newObj = this.loadById(result.lastInsertRowid);
        return newObj;
    }

    update(id, bezeichnung = "", beschreibung = "", zeitpunkt = null, dauer = 60, dienstleisterid = null) {
        if (helper.isNull(zeitpunkt)) 
            zeitpunkt = helper.getNow();

        var sql = "UPDATE Termin SET Bezeichnung=?,Beschreibung=?,Zeitpunkt=?,Dauer=?,DienstleisterID=? WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var params = [bezeichnung, beschreibung, helper.formatToSQLDateTime(zeitpunkt), dauer, dienstleisterid, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not update existing Record. Data: " + params);

        var updatedObj = this.loadById(id);
        return updatedObj;
    }

    delete(id) {
        try {
            var sql = "DELETE FROM Termin WHERE ID=?";
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            if (result.changes != 1) 
                throw new Error("Could not delete Record by id=" + id);

            return true;
        } catch (ex) {
            throw new Error("Could not delete Record by id=" + id + ". Reason: " + ex.message);
        }
    }

    toString() {
        helper.log("TerminDao [_conn=" + this._conn + "]");
    }
}

module.exports = TerminDao;