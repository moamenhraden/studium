const helper = require("../helper.js");
const SpeisenartDao = require("./speisenartDao.js");
const BewertungDao = require("./bewertungDao.js");
const ZutatenlisteDao = require("./zutatenlisteDao.js");

class GerichtDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        const speisenartDao = new SpeisenartDao(this._conn);
        const zutatenlisteDao = new ZutatenlisteDao(this._conn);
        const bewertungDao = new BewertungDao(this._conn);

        var sql = "SELECT * FROM Gericht WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error("No Record found by id=" + id);

        result = helper.objectKeysToLower(result);

        result.speisenart = speisenartDao.loadById(result.speisenartid);
        delete result.speisenartid;

        result.zutaten = zutatenlisteDao.loadAllByParent(result.id);

        result.bewertungen = bewertungDao.loadAllByParent(result.id);

        result.durchschnittsbewertung = 0;
        if (result.bewertungen.length > 0) {
            for (var r = 0; r < result.bewertungen.length; r++) 
                result.durchschnittsbewertung += result.bewertungen[r].punkte;
            result.durchschnittsbewertung /= result.bewertungen.length;
        }

        return result;
    }

    loadAll() {
        const speisenartDao = new SpeisenartDao(this._conn);
        var types = speisenartDao.loadAll();
        const zutatenlisteDao = new ZutatenlisteDao(this._conn);
        var ingredients = zutatenlisteDao.loadAll();
        const bewertungDao = new BewertungDao(this._conn);
        var scores = bewertungDao.loadAll();

        var sql = "SELECT * FROM Gericht";
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];

        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            
            for (var element of types) {
                if (element.id == result[i].speisenartid) {
                    result[i].speisenart = element;
                    break;
                }
            }
            delete result[i].speisenartid;

            result[i].zutaten = [];
            for (var element of ingredients) {
                if (element.gericht.id == result[i].id) 
                    result[i].zutaten.push(element);
            }

            result[i].bewertungen = [];
            result[i].durchschnittsbewertung = 0;

            for (var element of scores) {
                if (element.gericht.id == result[i].id) {
                    result[i].bewertungen.push(element);
                    result[i].durchschnittsbewertung += element.punkte;
                }
            }

            if (result[i].durchschnittsbewertung > 0) 
                result[i].durchschnittsbewertung /= result[i].bewertungen.length;            
        }

        return result;
    }

    exists(id) {
        var sql = "SELECT COUNT(ID) AS cnt FROM Gericht WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(bezeichnung = "", speisenartid = 1, zubereitung = "", bildpfad = null, zutaten = [], bewertungen = []) {
        const zutatenlisteDao = new ZutatenlisteDao(this._conn);
        const bewertungDao = new BewertungDao(this._conn);

        var sql = "INSERT INTO Gericht (Bezeichnung,SpeisenartID,Zubereitung,Bildpfad) VALUES (?,?,?,?)";
        var statement = this._conn.prepare(sql);
        var params = [bezeichnung, speisenartid, zubereitung, bildpfad];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not insert new Record. Data: " + params);

        if (zutaten.length > 0) {
            for (var element of zutaten) {
                zutatenlisteDao.create(result.lastInsertRowid, element.zutat.id, element.menge, element.einheit.id);
            }
        }

        if (bewertungen.length > 0) {
            for (var element of bewertungen) {
                bewertungDao.create(result.lastInsertRowid, element.punkte, helper.parseGermanDateTimeString(element.zeitpunkt), element.bemerkung, element.ersteller);
            }
        }

        var newObj = this.loadById(result.lastInsertRowid);
        return newObj;
    }

    update(id, bezeichnung = "", speisenartid = 1, zubereitung = "", bildpfad = null, zutaten = [], bewertungen = []) {
        const zutatenlisteDao = new ZutatenlisteDao(this._conn);
        zutatenlisteDao.deleteByParent(id);
        const bewertungDao = new BewertungDao(this._conn);
        bewertungDao.deleteByParent(id);

        var sql = "UPDATE Gericht SET Bezeichnung=?,SpeisenartID=?,Zubereitung=?,Bildpfad=? WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var params = [bezeichnung, speisenartid, zubereitung, bildpfad, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not update existing Record. Data: " + params);

        if (zutaten.length > 0) {
            for (var element of zutaten) {
                zutatenlisteDao.create(id, element.zutat.id, element.menge, element.einheit.id);
            }
        }

        if (bewertungen.length > 0) {
            for (var element of bewertungen) {
                bewertungDao.create(id, element.punkte, helper.parseGermanDateTimeString(element.zeitpunkt), element.bemerkung, element.ersteller);
            }
        }

        var updatedObj = this.loadById(id);
        return updatedObj;
    }

    delete(id) {
        try {
            const zutatenlisteDao = new ZutatenlisteDao(this._conn);
            zutatenlisteDao.deleteByParent(id);
            const bewertungDao = new BewertungDao(this._conn);
            bewertungDao.deleteByParent(id);

            var sql = "DELETE FROM Gericht WHERE ID=?";
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
        helper.log("GerichtDao [_conn=" + this._conn + "]");
    }
}

module.exports = GerichtDao;