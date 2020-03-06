const helper = require("../helper.js");
const ForumsbenutzerDao = require("./forumsbenutzerDao.js");

class ForumseintragDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadByArea(areaid) {
        const forumsbenutzerDao = new ForumsbenutzerDao(this._conn);
        var users = forumsbenutzerDao.loadAll();

        // get top level of entries
        var sql = "SELECT * FROM Forumseintrag WHERE BereichsID=? AND VaterID IS NULL AND Entfernt=0";
        var statement = this._conn.prepare(sql);
        var result = statement.all(areaid);

        if (helper.isArrayEmpty(result)) 
            return [];

        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            for (var element of users) {
                if (element.id == result[i].erstellerid) {
                    result[i].ersteller = element;
                    break;
                }
            }
            delete result[i].erstellerid;

            result[i].erstellzeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result[i].erstellzeitpunkt));

            // breichsid and entfernt not needed, as bound to area at top, so just delete the entry
            delete result[i].bereichsid;
            delete result[i].entfernt;

            // info back to parent
            result[i].vater = null;
            delete result[i].vaterid;

            // now work on answers if there are some (recursive)
            result[i].antworten = [];
            if (this.hasChilds(result[i].id)) 
                result[i].antworten = this.loadByParent(users, result[i].id);
        }

        return result;
    }

    loadByParent(users, parentid) {
        var sql = "SELECT * FROM Forumseintrag WHERE VaterID=? AND BereichsID IS NULL AND Entfernt=0";
        var statement = this._conn.prepare(sql);
        var result = statement.all(parentid);

        if (helper.isArrayEmpty(result)) 
            return [];

        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            for (var element of users) {
                if (element.id == result[i].erstellerid) {
                    result[i].ersteller = element;
                    break;
                }
            }
            delete result[i].erstellerid;

            result[i].erstellzeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result[i].erstellzeitpunkt));

            // bereichsid and entfernt not needed, as bound to area at top, so just delete the entry
            delete result[i].bereichsid;
            delete result[i].entfernt;

            // info back to parent
            result[i].vater = { "id": result[i].vaterid };
            delete result[i].vaterid;

            // now work on answers if there are some (recursive)
            result[i].antworten = [];
            if (this.hasChilds(result[i].id)) 
                result[i].antworten = this.loadByParent(users, result[i].id);
        }

        return result;        
    }

    hasChilds(parentid) {
        var sql = "SELECT COUNT(ID) AS cnt FROM Forumseintrag WHERE VaterID=? AND BereichsID IS NULL AND Entfernt=0";
        var statement = this._conn.prepare(sql);
        var result = statement.get(parentid);

        if (result.cnt > 0) 
            return true;

        return false;
    }

    exists(id) {
        var sql = "SELECT COUNT(ID) AS cnt FROM Forumseintrag WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(beitrag = "", erstellerid = 1, erstellzeitpunkt = null, bereichsid = null, vaterid = null) {
        const forumsbenutzerDao = new ForumsbenutzerDao(this._conn);

        if (helper.isNull(erstellzeitpunkt)) 
            erstellzeitpunkt = helper.getNow();

        var sql = "INSERT INTO Forumseintrag (Beitrag,ErstellerID,Erstellzeitpunkt,BereichsID,VaterID) VALUES (?,?,?,?,?)";
        var statement = this._conn.prepare(sql);
        var params = [beitrag, erstellerid, helper.formatToSQLDateTime(erstellzeitpunkt), bereichsid, vaterid];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not insert new Record. Data: " + params);

        var newObj = { 
            "id": result.lastInsertRowid, 
            "beitrag": beitrag,
            "erstellzeitpunk": helper.formatToGermanDateTime(erstellzeitpunkt),
            "ersteller": forumsbenutzerDao.loadById(erstellerid),
            "vater": (helper.isNull(vaterid) ? null : { "id": vaterid }),
            "antworten": []
        };
        
        return newObj;
    }

    delete(id) {
        /* info:
            delete works differently than other delete methods
            cause of recurvise character, we do not really delete a record
            we just set the flag of the record to be deleted
            therefore on read, the rec is not loaded anymore
        */

        try {
            var sql = "UPDATE Forumseintrag SET Entfernt=1 WHERE ID=?";
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            if (result.changes != 1) 
                throw new Error("Could not delete Record by id=" + id);

            return true;
        } catch (ex) {
            throw new Error("Could not delete Record by id=" + id + ". Reason: " + ex.message);
        }
    }

    deleteByArea(id) {
        try {
            var sql = "UPDATE Forumseintrag SET Entfernt=1,BereichsID=NULL WHERE BereichsID=? AND VaterID IS NULL";
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            return true;
        } catch (ex) {
            throw new Error("Could not delete Records by areaid=" + id + ". Reason: " + ex.message);
        }
    }

    toString() {
        helper.log("ForumseintragDao [_conn=" + this._conn + "]");
    }
}

module.exports = ForumseintragDao;