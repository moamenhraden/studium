const helper = require("../helper.js");

class KinosaalDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        var sql = "SELECT * FROM Kinosaal WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error("No Record found by id=" + id);

        result = helper.objectKeysToLower(result);

        if (result.projektionsart == 0) 
            result.projektionsart = "2D";
        else 
            result.projektionsart = "3D";

        result.sitzegesammt = result.sitzreihen * result.sitzeproreihe;

        return result;
    }

    loadAll() {
        var sql = "SELECT * FROM Kinosaal";
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];
        
        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            if (result[i].projektionsart == 0) 
                result[i].projektionsart = "2D";
            else 
                result[i].projektionsart = "3D";

            result[i].sitzegesammt = result[i].sitzreihen * result[i].sitzeproreihe;
        }

        return result;
    }

    exists(id) {
        var sql = "SELECT COUNT(ID) AS cnt FROM Kinosaal WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(bezeichnung = "", leinwand = 120, tonsystem = "", projektion = "", projektionsart = "2D", sitzreihen = 20, sitzeproreihe = 25, geschoss = "EG") {
        var sql = "INSERT INTO Kinosaal (Bezeichnung,Leinwand,Tonsystem,Projektion,Projektionsart,Sitzreihen,SitzeProReihe,Geschoss) VALUES (?,?,?,?,?,?,?,?)";
        var statement = this._conn.prepare(sql);
        var params = [bezeichnung, leinwand, tonsystem, projektion, (projektionsart.toLowerCase() === "2d" ? 0 : 1), sitzreihen, sitzeproreihe, geschoss];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not insert new Record. Data: " + params);

        var newObj = this.loadById(result.lastInsertRowid);
        return newObj;
    }

    update(id, bezeichnung = "", leinwand = 120, tonsystem = "", projektion = "", projektionsart = "2D", sitzreihen = 20, sitzeproreihe = 25, geschoss = "EG") {
        var sql = "UPDATE Kinosaal SET Bezeichnung=?,Leinwand=?,Tonsystem=?,Projektion=?,Projektionsart=?,Sitzreihen=?,SitzeProReihe=?,Geschoss=? WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var params = [bezeichnung, leinwand, tonsystem, projektion, (projektionsart.toLowerCase() === "2d" ? 0 : 1), sitzreihen, sitzeproreihe, geschoss, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not update existing Record. Data: " + params);

        var updatedObj = this.loadById(id);
        return updatedObj;
    }

    delete(id) {
        try {
            var sql = "DELETE FROM Kinosaal WHERE ID=?";
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
        helper.log("KinosaalDao [_conn=" + this._conn + "]");
    }
}

module.exports = KinosaalDao;