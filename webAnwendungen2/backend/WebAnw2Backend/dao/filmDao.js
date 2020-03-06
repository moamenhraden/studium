const helper = require("../helper.js");
const FilmgenreDao = require("./filmgenreDao.js");

class FilmDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        const filmgenreDao = new FilmgenreDao(this._conn);

        var sql = "SELECT * FROM Film WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error("No Record found by id=" + id);

        result = helper.objectKeysToLower(result);

        result.genre = filmgenreDao.loadById(result.genreid);
        delete result.genreid;

        return result;
    }

    loadAll() {
        const filmgenreDao = new FilmgenreDao(this._conn);
        var genres = filmgenreDao.loadAll();

        var sql = "SELECT * FROM Film";
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];
        
        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            for (var element of genres) {
                if (element.id == result[i].genreid) {
                    result[i].genre = element;
                    break;
                }
            }
            delete result[i].genreid;
        }

        return result;
    }

    exists(id) {
        var sql = "SELECT COUNT(ID) AS cnt FROM Film WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(bezeichnung = "", beschreibung = "", genreid = 1, fsk = 12, dauer = 90, regie = "", darsteller = "", preis = 9.0, coverpfad = null, videopfad = null, imdb = null) {
        var sql = "INSERT INTO Film (Bezeichnung,Beschreibung,GenreID,FSK,Dauer,Regie,Darsteller,Preis,Coverpfad,Videopfad,IMDB) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
        var statement = this._conn.prepare(sql);
        var params = [bezeichnung, beschreibung, genreid, fsk, dauer, regie, darsteller, preis, coverpfad, videopfad, imdb];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not insert new Record. Data: " + params);

        var newObj = this.loadById(result.lastInsertRowid);
        return newObj;
    }

    update(id, bezeichnung = "", beschreibung = "", genreid = 1, fsk = 12, dauer = 90, regie = "", darsteller = "", preis = 9.0, coverpfad = null, videopfad = null, imdb = null) {
        var sql = "UPDATE Film SET Bezeichnung=?,Beschreibung=?,GenreID=?,FSK=?,Dauer=?,Regie=?,Darsteller=?,Preis=?,Coverpfad=?,Videopfad=?,IMDB=? WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var params = [bezeichnung, beschreibung, genreid, fsk, dauer, regie, darsteller, preis, coverpfad, videopfad, imdb, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not update existing Record. Data: " + params);

        var updatedObj = this.loadById(id);
        return updatedObj;
    }

    delete(id) {
        try {
            var sql = "DELETE FROM Film WHERE ID=?";
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
        helper.log("FilmDao [_conn=" + this._conn + "]");
    }
}

module.exports = FilmDao;