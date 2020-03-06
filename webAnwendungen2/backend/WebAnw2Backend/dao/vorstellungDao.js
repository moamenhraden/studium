const helper = require("../helper.js");
const FilmDao = require("./filmDao.js");
const KinosaalDao = require("./kinosaalDao.js");
const ReservierungDao = require("./reservierungDao.js");

class VorstellungDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        const filmDao = new FilmDao(this._conn);
        const kinosaalDao = new KinosaalDao(this._conn);
        const reservierungDao = new ReservierungDao(this._conn);

        var sql = "SELECT * FROM Vorstellung WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error("No Record found by id=" + id);

        result = helper.objectKeysToLower(result);

        result.film = filmDao.loadById(result.filmid);
        delete result.filmid;

        result.kinosaal = kinosaalDao.loadById(result.kinosaalid);
        delete result.kinosaalid;

        result.zeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result.zeitpunkt));

        result.reservierungen = reservierungDao.loadAllByParent(result.id);

        result.sitze = { "gesammt": result.kinosaal.sitzegesammt };
        result.sitze.reserviert = 0;
        for (var element of result.reservierungen) {
            result.sitze.reserviert += element.reserviertesitze.length;
        }
        result.sitze.frei = result.sitze.gesammt - result.sitze.reserviert;

        return result;
    }

    loadAll() {
        const filmDao = new FilmDao(this._conn);
        var films = filmDao.loadAll();
        const kinosaalDao = new KinosaalDao(this._conn);
        var rooms = kinosaalDao.loadAll();
        const reservierungDao = new ReservierungDao(this._conn);
        var reservations = reservierungDao.loadAll();

        var sql = "SELECT * FROM Vorstellung";
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];
        
        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            for (var element of films) {
                if (element.id == result[i].filmid) {
                    result[i].film = element;
                    break;
                }
            }
            delete result[i].filmid;

            for (var element of rooms) {
                if (element.id == result[i].kinosaalid) {
                    result[i].kinosaal = element;
                    break;
                }
            }
            delete result[i].kinosaalid;

            result[i].zeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result[i].zeitpunkt));

            result[i].reservierungen = [];
            for (var element of reservations) {
                if (element.vorstellung.id == result[i].id) {
                    result[i].reservierungen.push(element);
                }
            }

            result[i].sitze = { "gesammt": result[i].kinosaal.sitzegesammt };
            result[i].sitze.reserviert = 0;
            for (var element of result[i].reservierungen) {
                result[i].sitze.reserviert += element.reserviertesitze.length;
            }
            result[i].sitze.frei = result[i].sitze.gesammt - result[i].sitze.reserviert;
        }

        return result;
    }

    loadAllByFilm(filmid) {
        const filmDao = new FilmDao(this._conn);
        var films = filmDao.loadAll();
        const kinosaalDao = new KinosaalDao(this._conn);
        var rooms = kinosaalDao.loadAll();
        const reservierungDao = new ReservierungDao(this._conn);
        var reservations = reservierungDao.loadAll();

        var sql = "SELECT * FROM Vorstellung WHERE FilmID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.all(filmid);

        if (helper.isArrayEmpty(result)) 
            return [];
        
        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            for (var element of films) {
                if (element.id == result[i].filmid) {
                    result[i].film = element;
                    break;
                }
            }
            delete result[i].filmid;

            for (var element of rooms) {
                if (element.id == result[i].kinosaalid) {
                    result[i].kinosaal = element;
                    break;
                }
            }
            delete result[i].kinosaalid;

            result[i].zeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result[i].zeitpunkt));

            result[i].reservierungen = [];
            for (var element of reservations) {
                if (element.vorstellung.id == result[i].id) {
                    result[i].reservierungen.push(element);
                }
            }

            result[i].sitze = { "gesammt": result[i].kinosaal.sitzegesammt };
            result[i].sitze.reserviert = 0;
            for (var element of result[i].reservierungen) {
                result[i].sitze.reserviert += element.reserviertesitze.length;
            }
            result[i].sitze.frei = result[i].sitze.gesammt - result[i].sitze.reserviert;
        }

        return result;
    }

    loadAllByRoom(kinosaalid) {
        const filmDao = new FilmDao(this._conn);
        var films = filmDao.loadAll();
        const kinosaalDao = new KinosaalDao(this._conn);
        var rooms = kinosaalDao.loadAll();
        const reservierungDao = new ReservierungDao(this._conn);
        var reservations = reservierungDao.loadAll();

        var sql = "SELECT * FROM Vorstellung WHERE KinosaalID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.all(kinosaalid);

        if (helper.isArrayEmpty(result)) 
            return [];
        
        result = helper.arrayObjectKeysToLower(result);

        for (var i = 0; i < result.length; i++) {
            for (var element of films) {
                if (element.id == result[i].filmid) {
                    result[i].film = element;
                    break;
                }
            }
            delete result[i].filmid;

            for (var element of rooms) {
                if (element.id == result[i].kinosaalid) {
                    result[i].kinosaal = element;
                    break;
                }
            }
            delete result[i].kinosaalid;

            result[i].zeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result[i].zeitpunkt));

            result[i].reservierungen = [];
            for (var element of reservations) {
                if (element.vorstellung.id == result[i].id) {
                    result[i].reservierungen.push(element);
                }
            }

            result[i].sitze = { "gesammt": result[i].kinosaal.sitzegesammt };
            result[i].sitze.reserviert = 0;
            for (var element of result[i].reservierungen) {
                result[i].sitze.reserviert += element.reserviertesitze.length;
            }
            result[i].sitze.frei = result[i].sitze.gesammt - result[i].sitze.reserviert;
        }

        return result;
    }

    seatAvailable(id, reihe, sitzplatz) {
        var sql = "SELECT COUNT(ReservierterSitz.ID) AS cnt FROM ReservierterSitz INNER JOIN Reservierung ON Reservierung.ID=ReservierterSitz.ReservierungID INNER JOIN Vorstellung ON Vorstellung.ID=Reservierung.VorstellungID WHERE Vorstellung.ID=? AND ReservierterSitz.Reihe=? AND ReservierterSitz.Sitzplatz=?";
        var statement = this._conn.prepare(sql);
        var params = [id, reihe, sitzplatz];
        var result = statement.get(params);

        if (result.cnt == 1) 
            return false;

        return true;
    }

    exists(id) {
        var sql = "SELECT COUNT(ID) AS cnt FROM Vorstellung WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(filmid = 1, kinosaalid = 1, zeitpunkt = null) {
        var sql = "INSERT INTO Vorstellung (FilmID,KinosaalID,Zeitpunkt) VALUES (?,?,?)";
        var statement = this._conn.prepare(sql);
        var params = [filmid, kinosaalid, helper.formatToSQLDateTime(zeitpunkt)];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not insert new Record. Data: " + params);

        var newObj = this.loadById(result.lastInsertRowid);
        return newObj;
    }

    update(id, filmid = 1, kinosaalid = 1, zeitpunkt = null, reservierungen = []) {
        const reservierungDao = new ReservierungDao(this._conn);
        reservierungDao.deleteByParent(id);

        var sql = "UPDATE Vorstellung SET FilmID=?,KinosaalID=?,Zeitpunkt=? WHERE ID=?";
        var statement = this._conn.prepare(sql);
        var params = [filmid, kinosaalid, helper.formatToSQLDateTime(zeitpunkt), id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error("Could not update existing Record. Data: " + params);

        if (reservierungen.length > 0) {
            for (var element of reservierungen) {
                reservierungDao.create(helper.parseGermanDateTimeString(element.zeitpunkt), element.reservierer.id, element.zahlungsart.id, id, element.reserviertesitze);
            }
        }

        var updatedObj = this.loadById(id);
        return updatedObj;
    }

    delete(id) {
        try {
            const reservierungDao = new ReservierungDao(this._conn);
            reservierungDao.deleteByParent(id);

            var sql = "DELETE FROM Vorstellung WHERE ID=?";
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
        helper.log("VorstellungDao [_conn=" + this._conn + "]");
    }
}

module.exports = VorstellungDao;