const helper = require("../helper.js");
const ForumsbenutzerDao = require("./forumsbenutzerDao.js");
const ForumseintragDao = require("./forumseintragDao.js");

class ForumsbereichDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        const forumsbenutzerDao = new ForumsbenutzerDao(this._conn);
        const forumseintragDao = new ForumseintragDao(this._conn);

        var sql = "SELECT * FROM Forumsbereich WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error("No Record found by id=" + id);

        result = helper.objectKeysToLower(result);

        result.administrator = forumsbenutzerDao.loadById(result.administratorid);
        delete result.administratorid;

        result.threads = forumseintragDao.loadByArea(result.id);

        return result;
    }

    loadAll() {
        const forumsbenutzerDao = new ForumsbenutzerDao(this._conn);
        var users = forumsbenutzerDao.loadAll();
        const forumseintragDao = new ForumseintragDao(this._conn);

        var sql = "SELECT * FROM Forumsbereich";
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];
        
        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            for (var element of users) {
                if (element.id == result[i].administratorid) {
                    result[i].administrator = element;
                    break;
                }
            }
            delete result[i].administratorid;

            result[i].threads = forumseintragDao.loadByArea(result[i].id);
        }

        return result;
    }

    exists(id) {
        var sql = "SELECT COUNT(ID) AS cnt FROM Forumsbereich WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(thema = "", beschreibung = "", administratorid = 1) {
        // ATTENTION: No childs (entries) are created, only main rec
        var sql = "INSERT INTO Forumsbereich (Thema,Beschreibung,AdministratorID) VALUES (?,?,?)";
        var statement = this._conn.prepare(sql);
        var params = [thema, beschreibung, administratorid];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not insert new Record. Data: " + params);

        var newObj = this.loadById(result.lastInsertRowid);
        return newObj;
    }

    update(id, thema = "", beschreibung = "", administratorid = 1) {
        // ATTENTION: No childs (entries) are modified, only main rec
        var sql = "UPDATE Forumsbereich SET Thema=?,Beschreibung=?,AdministratorID=? WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var params = [thema, beschreibung, administratorid, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not update existing Record. Data: " + params);

        var updatedObj = this.loadById(id);
        return updatedObj;
    }

    delete(id) {
        try {
            const forumseintragDao = new ForumseintragDao(this._conn);
            forumseintragDao.deleteByArea(id);

            var sql = "DELETE FROM Forumsbereich WHERE ID=?";
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
        helper.log("ForumsbereichDao [_conn=" + this._conn + "]");
    }
}

module.exports = ForumsbereichDao;