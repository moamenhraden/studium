const helper = require("../helper.js");
const BenutzerrolleDao = require("./benutzerrolleDao.js");

class ForumsbenutzerDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        const benutzerrolleDao = new BenutzerrolleDao(this._conn);

        var sql = "SELECT * FROM Forumsbenutzer WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error("No Record found by id=" + id);

        result = helper.objectKeysToLower(result);

        if (result.geschlecht == 0) 
            result.geschlecht = "männlich";
        else 
            result.geschlecht = "weiblich";

        result.geburtstag = helper.formatToGermanDate(helper.parseSQLDateTimeString(result.geburtstag));

        result.beitritt = helper.formatToGermanDate(helper.parseSQLDateTimeString(result.beitritt));

        result.rolle = benutzerrolleDao.loadById(result.rolleid);
        delete result.rolleid;

        return result;
    }

    loadAll() {
        const benutzerrolleDao = new BenutzerrolleDao(this._conn);
        var roles = benutzerrolleDao.loadAll();

        var sql = "SELECT * FROM Forumsbenutzer";
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];
        
        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            if (result[i].geschlecht == 0) 
                result[i].geschlecht = "männlich";
            else 
                result[i].geschlecht = "weiblich";

            result[i].geburtstag = helper.formatToGermanDate(helper.parseSQLDateTimeString(result[i].geburtstag));

            result[i].beitritt = helper.formatToGermanDate(helper.parseSQLDateTimeString(result[i].beitritt));

            for (var element of roles) {
                if (element.id == result[i].rolleid) {
                    result[i].rolle = element;
                    break;
                }
            }
            delete result[i].rolleid;
        }

        return result;
    }

    isunique(benutzername) {
        var sql = "SELECT COUNT(ID) AS cnt FROM Forumsbenutzer WHERE Benutzername=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(benutzername);

        if (result.cnt == 0) 
            return true;

        return false;
    }

    exists(id) {
        var sql = "SELECT COUNT(ID) AS cnt FROM Forumsbenutzer WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(benutzername = "", geschlecht = "männlich", geburtstag = null, beitritt = null, rolleid = 1) {
        var sql = "INSERT INTO Forumsbenutzer (Benutzername,Geschlecht,Geburtstag,Beitritt,RolleID) VALUES (?,?,?,?,?)";
        var statement = this._conn.prepare(sql);
        var params = [benutzername, (helper.strStartsWith(geschlecht, "mä") ? 0 : 1), (helper.isNull(geburtstag) ? helper.formatToSQLDate(helper.getNow()) : helper.formatToSQLDate(geburtstag)), (helper.isNull(beitritt) ? helper.formatToSQLDate(helper.getNow()) : helper.formatToSQLDate(beitritt)), rolleid];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not insert new Record. Data: " + params);

        var newObj = this.loadById(result.lastInsertRowid);
        return newObj;
    }

    update(id, benutzername = "", geschlecht = "männlich", geburtstag = null, beitritt = null, rolleid = 1) {
        var sql = "UPDATE Forumsbenutzer SET Benutzername=?,Geschlecht=?,Geburtstag=?,Beitritt=?,RolleID=? WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var params = [benutzername, (helper.strStartsWith(geschlecht, "mä") ? 0 : 1), (helper.isNull(geburtstag) ? helper.formatToSQLDate(helper.getNow()) : helper.formatToSQLDate(geburtstag)), (helper.isNull(beitritt) ? helper.formatToSQLDate(helper.getNow()) : helper.formatToSQLDate(beitritt)), rolleid, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not update existing Record. Data: " + params);

        var updatedObj = this.loadById(id);
        return updatedObj;
    }

    delete(id) {
        try {
            var sql = "DELETE FROM Forumsbenutzer WHERE ID=?";
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
        helper.log("ForumsbenutzerDao [_conn=" + this._conn + "]");
    }
}

module.exports = ForumsbenutzerDao;