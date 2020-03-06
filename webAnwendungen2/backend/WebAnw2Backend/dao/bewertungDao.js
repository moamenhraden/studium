const helper = require("../helper.js");

class BewertungDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        var sql = "SELECT * FROM Bewertung WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error("No Record found by id=" + id);

        result = helper.objectKeysToLower(result);

        result.gericht = { id: result.gerichtid };
        delete result.gerichtid;

        result.zeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result.zeitpunkt));

        return result;
    }

    loadAll() {
        var sql = "SELECT * FROM Bewertung";
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];
        
        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            result[i].gericht = { id: result[i].gerichtid };
            delete result[i].gerichtid;

            result[i].zeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result[i].zeitpunkt));
        }

        return result;
    }

    loadAllByParent(id) {
        var sql = "SELECT * FROM Bewertung WHERE GerichtID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.all(id);

        if (helper.isArrayEmpty(result)) 
            return [];
        
        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            result[i].gericht = { id: result[i].gerichtid };
            delete result[i].gerichtid;

            result[i].zeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result[i].zeitpunkt));
        }

        return result;
    }

    exists(id) {
        var sql = "SELECT COUNT(ID) AS cnt FROM Bewertung WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(gerichtid = 1, punkte = 1, zeitpunkt = null, bemerkung = null, ersteller = null) {
        if (helper.isNull(zeitpunkt)) 
            zeitpunkt = helper.getNow();

        var sql = "INSERT INTO Bewertung (GerichtID,Punkte,Zeitpunkt,Bemerkung,Ersteller) VALUES (?,?,?,?,?)";
        var statement = this._conn.prepare(sql);
        var params = [gerichtid, punkte, helper.formatToSQLDateTime(zeitpunkt), bemerkung, ersteller];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not insert new Record. Data: " + params);

        var newObj = this.loadById(result.lastInsertRowid);
        return newObj;
    }

    update(id, gerichtid = 1, punkte = 1, zeitpunkt = null, bemerkung = null, ersteller = null) {
        var sql = "UPDATE Bewertung SET GerichtID=?,Punkte=?,Zeitpunkt=?,Bemerkung=?,Ersteller=? WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var params = [gerichtid, punkte, helper.formatToSQLDateTime(zeitpunkt), bemerkung, ersteller, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not update existing Record. Data: " + params);

        var updatedObj = this.loadById(id);
        return updatedObj;
    }

    delete(id) {
        try {
            var sql = "DELETE FROM Bewertung WHERE ID=?";
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
            var sql = "DELETE FROM Bewertung WHERE GerichtID=?";
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            return true;
        } catch (ex) {
            throw new Error("Could not delete Records by parent id=" + id + ". Reason: " + ex.message);
        }
    }

    toString() {
        helper.log("BewertungDao [_conn=" + this._conn + "]");
    }
}

module.exports = BewertungDao;