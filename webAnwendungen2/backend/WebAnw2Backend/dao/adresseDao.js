const helper = require("../helper.js");
const LandDao = require("./landDao.js");

class AdresseDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        const landDao = new LandDao(this._conn);

        var sql = "SELECT * FROM Adresse WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error("No Record found by id=" + id);

        result = helper.objectKeysToLower(result);

        result.land = landDao.loadById(result.landid);
        delete result.landid;

        return result;
    }

    loadAll() {
        const landDao = new LandDao(this._conn);
        var countries = landDao.loadAll();

        var sql = "SELECT * FROM Adresse";
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];
        
        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            for (var element of countries) {
                if (element.id == result[i].landid) {
                    result[i].land = element;
                    break;
                }
            }
            delete result[i].landid;
        }

        return result;
    }

    exists(id) {
        var sql = "SELECT COUNT(ID) AS cnt FROM Adresse WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(strasse = "", hausnummer = "", adresszusatz = "", plz = "", ort = "", landid = 1) {
        var sql = "INSERT INTO Adresse (Strasse,Hausnummer,Adresszusatz,PLZ,Ort,LandID) VALUES (?,?,?,?,?,?)";
        var statement = this._conn.prepare(sql);
        var params = [strasse, hausnummer, adresszusatz, plz, ort, landid];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not insert new Record. Data: " + params);

        var newObj = this.loadById(result.lastInsertRowid);
        return newObj;
    }

    update(id, strasse = "", hausnummer = "", adresszusatz = "", plz = "", ort = "", landid = 1) {
        var sql = "UPDATE Adresse SET Strasse=?,Hausnummer=?,Adresszusatz=?,PLZ=?,Ort=?,LandID=? WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var params = [strasse, hausnummer, adresszusatz, plz, ort, landid, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not update existing Record. Data: " + params);

        var updatedObj = this.loadById(id);
        return updatedObj;
    }

    delete(id) {
        try {
            var sql = "DELETE FROM Adresse WHERE ID=?";
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
        helper.log("AdresseDao [_conn=" + this._conn + "]");
    }
}

module.exports = AdresseDao;