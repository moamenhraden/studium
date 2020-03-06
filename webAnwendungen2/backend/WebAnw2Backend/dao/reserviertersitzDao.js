const helper = require("../helper.js");

class ReserviertersitzDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        var sql = "SELECT * FROM ReservierterSitz WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error("No Record found by id=" + id);

        result = helper.objectKeysToLower(result);

        result.reservierung = { "id": result.reservierungid };
        delete result.reservierungid;

        return result;
    }

    loadAll() {
        var sql = "SELECT * FROM ReservierterSitz";
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];
        
        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            result[i].reservierung = { "id": result[i].reservierungid };
            delete result[i].reservierungid;
        }

        return result;
    }

    loadAllByParent(id) {
        var sql = "SELECT * FROM ReservierterSitz WHERE ReservierungID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.all(id);

        if (helper.isArrayEmpty(result)) 
            return [];
        
        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            result[i].reservierung = { "id": result[i].reservierungid };
            delete result[i].reservierungid;
        }

        return result;
    }

    exists(id) {
        var sql = "SELECT COUNT(ID) AS cnt FROM ReservierterSitz WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(reservierungid = 1, reihe = 1, sitzplatz = 1) {
        var sql = "INSERT INTO ReservierterSitz (ReservierungID,Reihe,Sitzplatz) VALUES (?,?,?)";
        var statement = this._conn.prepare(sql);
        var params = [reservierungid, reihe, sitzplatz];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not insert new Record. Data: " + params);

        var newObj = this.loadById(result.lastInsertRowid);
        return newObj;
    }

    update(id, reservierungid = 1, reihe = 1, sitzplatz = 1) {
        var sql = "UPDATE ReservierterSitz SET ReservierungID=?,Reihe=?,Sitzplatz=? WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var params = [reservierungid, reihe, sitzplatz, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not update existing Record. Data: " + params);

        var updatedObj = this.loadById(id);
        return updatedObj;
    }

    delete(id) {
        try {
            var sql = "DELETE FROM ReservierterSitz WHERE ID=?";
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
            var sql = "DELETE FROM ReservierterSitz WHERE ReservierungID=?";
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            return true;
        } catch (ex) {
            throw new Error("Could not delete Records by parent id=" + id + ". Reason: " + ex.message);
        }
    }

    toString() {
        helper.log("ReserviertersitzDao [_conn=" + this._conn + "]");
    }
}

module.exports = ReserviertersitzDao;