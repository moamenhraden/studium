const helper = require("../helper.js");
const ProduktDao = require("./produktDao.js");

class BestellpositionDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        const produktDao = new ProduktDao(this._conn);

        var sql = "SELECT * FROM Bestellposition WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error("No Record found by id=" + id);

        result = helper.objectKeysToLower(result);

        result.bestellung = { "id": result.bestellungid };
        delete result.bestellungid;
        
        result.produkt = produktDao.loadById(result.produktid);
        delete result.produktid;

        result.mehrwertsteuersumme = helper.round(result.menge * result.produkt.mehrwertsteueranteil);
        result.nettosumme = helper.round(result.menge * result.produkt.nettopreis);
        result.bruttosumme = helper.round(result.menge * result.produkt.bruttopreis);

        return result;
    }

    loadAll() {
        const produktDao = new ProduktDao(this._conn);
        var products = produktDao.loadAll();

        var sql = "SELECT * FROM Bestellposition";
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];
        
        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            result[i].bestellung = { "id": result[i].bestellungid };
            delete result[i].bestellungid;
        
            for (var element of products) {
                if (element.id == result[i].produktid) {
                    result[i].produkt = element;
                    break;
                }
            }
            delete result[i].produktid;

            result[i].mehrwertsteuersumme = helper.round(result[i].menge * result[i].produkt.mehrwertsteueranteil);
            result[i].nettosumme = helper.round(result[i].menge * result[i].produkt.nettopreis);
            result[i].bruttosumme = helper.round(result[i].menge * result[i].produkt.bruttopreis);
        }

        return result;
    }

    loadByParent(bestellungid) {
        const produktDao = new ProduktDao(this._conn);
        var products = produktDao.loadAll();

        var sql = "SELECT * FROM Bestellposition WHERE BestellungID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.all(bestellungid);

        if (helper.isArrayEmpty(result)) 
            return [];
        
        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            result[i].bestellung = { "id": result[i].bestellungid };
            delete result[i].bestellungid;
        
            for (var element of products) {
                if (element.id == result[i].produktid) {
                    result[i].produkt = element;
                    break;
                }
            }
            delete result[i].produktid;

            result[i].mehrwertsteuersumme = helper.round(result[i].menge * result[i].produkt.mehrwertsteueranteil);
            result[i].nettosumme = helper.round(result[i].menge * result[i].produkt.nettopreis);
            result[i].bruttosumme = helper.round(result[i].menge * result[i].produkt.bruttopreis);
        }

        return result;
    }

    exists(id) {
        var sql = "SELECT COUNT(ID) AS cnt FROM Bestellposition WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(bestellungid = 1, produktid = 1, menge = 1) {
        var sql = "INSERT INTO Bestellposition (BestellungID,ProduktID,Menge) VALUES (?,?,?)";
        var statement = this._conn.prepare(sql);
        var params = [bestellungid, produktid, menge];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not insert new Record. Data: " + params);

        var newObj = this.loadById(result.lastInsertRowid);
        return newObj;
    }

    update(id, bestellungid = 1, produktid = 1, menge = 1) {
        var sql = "UPDATE Bestellposition SET BestellungID=?,ProduktID=?,Menge=? WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var params = [bestellungid, produktid, menge, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not update existing Record. Data: " + params);

        var updatedObj = this.loadById(id);
        return updatedObj;
    }

    delete(id) {
        try {
            var sql = "DELETE FROM Bestellposition WHERE ID=?";
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            if (result.changes != 1) 
                throw new Error("Could not delete Record by id=" + id);

            return true;
        } catch (ex) {
            throw new Error("Could not delete Record by id=" + id + ". Reason: " + ex.message);
        }
    }

    deleteByParent(bestellungid) {
        try {
            var sql = "DELETE FROM Bestellposition WHERE BestellungID=?";
            var statement = this._conn.prepare(sql);
            var result = statement.run(bestellungid);

            return true;
        } catch (ex) {
            throw new Error("Could not delete Records by bestellungid=" + bestellungid + ". Reason: " + ex.message);
        }
    }

    toString() {
        helper.log("BestellpositionDao [_conn=" + this._conn + "]");
    }
}

module.exports = BestellpositionDao;