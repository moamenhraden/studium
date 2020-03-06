const helper = require("../helper.js");

class MehrwertsteuerDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        var sql = "SELECT * FROM Mehrwertsteuer WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error("No Record found by id=" + id);

        return helper.objectKeysToLower(result);
    }

    loadAll() {
        var sql = "SELECT * FROM Mehrwertsteuer";
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];
        
        return helper.arrayObjectKeysToLower(result);
    }

    exists(id) {
        var sql = "SELECT COUNT(ID) AS cnt FROM Mehrwertsteuer WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(bezeichnung = "", steuersatz = 19.0) {
        var sql = "INSERT INTO Mehrwertsteuer (Bezeichnung,SteuerSatz) VALUES (?,?)";
        var statement = this._conn.prepare(sql);
        var params = [bezeichnung, steuersatz];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not insert new Record. Data: " + params);

        var newObj = this.loadById(result.lastInsertRowid);
        return newObj;
    }

    update(id, bezeichnung = "", steuersatz = 19.0) {
        var sql = "UPDATE Mehrwertsteuer SET Bezeichnung=?,SteuerSatz=? WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var params = [bezeichnung, steuersatz, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not update existing Record. Data: " + params);

        var updatedObj = this.loadById(id);
        return updatedObj;
    }

    delete(id) {
        try {
            var sql = "DELETE FROM Mehrwertsteuer WHERE ID=?";
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
        helper.log("MehrwertsteuerDao [_conn=" + this._conn + "]");
    }
}

module.exports = MehrwertsteuerDao;