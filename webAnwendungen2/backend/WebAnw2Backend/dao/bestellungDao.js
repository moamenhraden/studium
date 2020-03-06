const helper = require("../helper.js");
const BestellpositionDao = require("./bestellpositionDao.js");
const PersonDao = require("./personDao.js");
const ZahlungsartDao = require("./zahlungsartDao.js");

class BestellungDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        const bestellpositionDao = new BestellpositionDao(this._conn);
        const personDao = new PersonDao(this._conn);
        const zahlungsartDao = new ZahlungsartDao(this._conn);

        var sql = "SELECT * FROM Bestellung WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error("No Record found by id=" + id);

        result = helper.objectKeysToLower(result);

        result.bestellzeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result.bestellzeitpunkt));

        if (helper.isNull(result.bestellerid)) {
            result.besteller = null;
        } else {
            result.besteller = personDao.loadById(result.bestellerid);
        }
        delete result.bestellerid;

        result.zahlungsart = zahlungsartDao.loadById(result.zahlungsartid);
        delete result.zahlungsartid;

        result.bestellpositionen = bestellpositionDao.loadByParent(result.id);
        
        result.total = { "netto": 0, "brutto": 0, "mehrwertsteuer": 0 };

        for (i = 0; i < result.bestellpositionen.length; i++) {
            result.total.netto += result.bestellpositionen[i].nettosumme;
            result.total.brutto += result.bestellpositionen[i].bruttosumme;
            result.total.mehrwertsteuer += result.bestellpositionen[i].mehrwertsteuersumme;
        }

        result.total.netto = helper.round(result.total.netto);
        result.total.brutto = helper.round(result.total.brutto);
        result.total.mehrwertsteuer = helper.round(result.total.mehrwertsteuer);

        return result;
    }

    loadAll() {
        const bestellpositionDao = new BestellpositionDao(this._conn);
        var positions = bestellpositionDao.loadAll();
        const personDao = new PersonDao(this._conn);
        var persons = personDao.loadAll();
        const zahlungsartDao = new ZahlungsartDao(this._conn);
        var methods = zahlungsartDao.loadAll();

        var sql = "SELECT * FROM Bestellung";
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];

        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            result[i].bestellzeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result[i].bestellzeitpunkt));

            if (helper.isNull(result[i].bestellerid)) {
                result[i].besteller = null;
            } else {
                for (var element of persons) {
                    if (element.id == result[i].bestellerid) {
                        result[i].besteller = element;
                        break;
                    }
                }
            }
            delete result[i].bestellerid;

            for (var element of methods) {
                if (element.id == result[i].zahlungsartid) {
                    result[i].zahlungsart = element;
                    break;
                }
            }
            delete result[i].zahlungsartid;

            result[i].bestellpositionen = [];

            result[i].total = { "netto": 0, "brutto": 0, "mehrwertsteuer": 0 };

            for (var element of positions) {
                if (element.bestellung.id == result[i].id) {
                    result[i].total.netto += element.nettosumme;
                    result[i].total.brutto += element.bruttosumme;
                    result[i].total.mehrwertsteuer += element.mehrwertsteuersumme;
                    result[i].bestellpositionen.push(element);    
                }                
            }

            result[i].total.netto = helper.round(result[i].total.netto);
            result[i].total.brutto = helper.round(result[i].total.brutto);
            result[i].total.mehrwertsteuer = helper.round(result[i].total.mehrwertsteuer);
        }

        return result;
    }

    exists(id) {
        var sql = "SELECT COUNT(ID) AS cnt FROM Bestellung WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(bestellzeitpunkt = null, bestellerid = null, zahlungsartid = null, bestellpositionen = []) {
        const bestellpositionDao = new BestellpositionDao(this._conn);

        if (helper.isNull(bestellzeitpunkt)) 
            bestellzeitpunkt = helper.getNow();

        var sql = "INSERT INTO Bestellung (Bestellzeitpunkt,BestellerID,ZahlungsartID) VALUES (?,?,?)";
        var statement = this._conn.prepare(sql);
        var params = [helper.formatToSQLDateTime(bestellzeitpunkt), bestellerid, zahlungsartid];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not insert new Record. Data: " + params);

        if (bestellpositionen.length > 0) {
            for (var element of bestellpositionen) {
                bestellpositionDao.create(result.lastInsertRowid, element.produkt.id, element.menge);
            }
        }

        var newObj = this.loadById(result.lastInsertRowid);
        return newObj;
    }

    update(id, bestellzeitpunkt = null, bestellerid = null, zahlungsartid = null, bestellpositionen = []) {
        const bestellpositionDao = new BestellpositionDao(this._conn);
        bestellpositionDao.deleteByParent(id);

        if (helper.isNull(bestellzeitpunkt)) 
            bestellzeitpunkt = helper.getNow();

        var sql = "UPDATE Bestellung SET Bestellzeitpunkt=?,BestellerID=?,ZahlungsartID=? WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var params = [helper.formatToSQLDateTime(bestellzeitpunkt), bestellerid, zahlungsartid, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not update existing Record. Data: " + params);
        
        if (bestellpositionen.length > 0) {
            for (var element of bestellpositionen) {
                bestellpositionDao.create(id, element.produkt.id, element.menge);
            }
        }

        var updatedObj = this.loadById(id);
        return updatedObj;
    }

    delete(id) {
        try {
            const bestellpositionDao = new BestellpositionDao(this._conn);
            bestellpositionDao.deleteByParent(id);

            var sql = "DELETE FROM Bestellung WHERE ID=?";
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
        helper.log("BestellungDao [_conn=" + this._conn + "]");
    }
}

module.exports = BestellungDao;