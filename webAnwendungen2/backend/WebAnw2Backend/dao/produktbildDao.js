const helper = require("../helper.js");

class ProduktbildDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        var sql = "SELECT * FROM Produktbild WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error("No Record found by id=" + id);

        result = helper.objectKeysToLower(result);

        result.produkt = { "id": result.produktid };
        delete result.produktid;

        return result;
    }

    loadAll() {
        var sql = "SELECT * FROM Produktbild";
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];
        
        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            result[i].produkt = { "id": result[i].produktid };
            delete result[i].produktid;
        }

        return result;
    }

    loadByParent(id) {
        var sql = "SELECT * FROM Produktbild WHERE ProduktID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.all(id);

        if (helper.isArrayEmpty(result)) 
            return [];

        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            result[i].produkt = { "id": result[i].produktid };
            delete result[i].produktid;
        }

        return result;
    }

    exists(id) {
        var sql = "SELECT COUNT(ID) AS cnt FROM Produktbild WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(bildpfad = "", produktid = 1) {
        var sql = "INSERT INTO Produktbild (Bildpfad,ProduktID) VALUES (?,?)";
        var statement = this._conn.prepare(sql);
        var params = [bildpfad, produktid];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not insert new Record. Data: " + params);

        var newObj = this.loadById(result.lastInsertRowid);
        return newObj;
    }

    update(id, bildpfad = "", produktid = 1) {
        var sql = "UPDATE Produktbild SET Bildpfad=?,ProduktID=? WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var params = [bildpfad, produktid, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not update existing Record. Data: " + params);

        var updatedObj = this.loadById(id);
        return updatedObj;
    }

    delete(id) {
        try {
            var sql = "DELETE FROM Produktbild WHERE ID=?";
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
            var sql = "DELETE FROM Produktbild WHERE ProduktID=?";
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            return true;
        } catch (ex) {
            throw new Error("Could not delete Records by id=" + produktid + ". Reason: " + ex.message);
        }
    }

    toString() {
        helper.log("ProduktbildDao [_conn=" + this._conn + "]");
    }
}

module.exports = ProduktbildDao;