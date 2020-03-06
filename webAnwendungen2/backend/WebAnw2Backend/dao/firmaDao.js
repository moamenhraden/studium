const helper = require("../helper.js");
const AdresseDao = require("./adresseDao.js");
const BrancheDao = require("./brancheDao.js");
const PersonDao = require("./personDao.js");

class FirmaDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        const adresseDao = new AdresseDao(this._conn);
        const brancheDao = new BrancheDao(this._conn);
        const personDao = new PersonDao(this._conn);

        var sql = "SELECT * FROM Firma WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error("No Record found by id=" + id);

        result = helper.objectKeysToLower(result);

        result.adresse = adresseDao.loadById(result.adresseid);
        delete result.adresseid;

        result.branche = brancheDao.loadById(result.brancheid);
        delete result.brancheid;

        if (helper.isNull(result.ansprechpartnerid)) {
            result.ansprechpartner = null;
        } else {
            result.ansprechpartner = personDao.loadById(result.ansprechpartnerid);
        }
        delete result.ansprechpartnerid;

        return result;
    }

    loadAll() {
        const adresseDao = new AdresseDao(this._conn);
        var addresses = adresseDao.loadAll();
        const brancheDao = new BrancheDao(this._conn);
        var branches = brancheDao.loadAll();
        const personDao = new PersonDao(this._conn);
        var persons = personDao.loadAll();

        var sql = "SELECT * FROM Firma";
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];
        
        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            for (var element of addresses) {
                if (element.id == result[i].adresseid) {
                    result[i].adresse = element;
                    break;
                }
            }
            delete result[i].adresseid;

            for (var element of branches) {
                if (element.id == result[i].brancheid) {
                    result[i].branche = element;
                    break;
                }
            }
            delete result[i].brancheid;

            if (helper.isNull(result[i].ansprechpartnerid)) {
                result[i].ansprechpartner = null;
            } else {
                for (var element of persons) {
                    if (element.id == result[i].ansprechpartnerid) {
                        result[i].ansprechpartner = element;
                        break;
                    }
                }
            }
            delete result[i].ansprechpartnerid;
        }

        return result;
    }

    exists(id) {
        var sql = "SELECT COUNT(ID) AS cnt FROM Firma WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(name = "", inhaber = null, beschreibung = "", adresseid = 1, ansprechpartnerid = null, brancheid = 1) {
        var sql = "INSERT INTO Firma (Name,Inhaber,Beschreibung,AdresseID,AnsprechpartnerID,BrancheID) VALUES (?,?,?,?,?,?)";
        var statement = this._conn.prepare(sql);
        var params = [name, inhaber, beschreibung, adresseid, ansprechpartnerid, brancheid];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not insert new Record. Data: " + params);

        var newObj = this.loadById(result.lastInsertRowid);
        return newObj;
    }

    update(id, name = "", inhaber = null, beschreibung = "", adresseid = 1, ansprechpartnerid = null, brancheid = 1) {
        var sql = "UPDATE Firma SET Name=?,Inhaber=?,Beschreibung=?,AdresseID=?,AnsprechpartnerID=?,BrancheID=? WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var params = [name, inhaber, beschreibung, adresseid, ansprechpartnerid, brancheid, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not update existing Record. Data: " + params);

        var updatedObj = this.loadById(id);
        return updatedObj;
    }

    delete(id) {
        try {
            var sql = "DELETE FROM Firma WHERE ID=?";
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
        helper.log("FirmaDao [_conn=" + this._conn + "]");
    }
}

module.exports = FirmaDao;