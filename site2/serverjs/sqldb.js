"use strict"
var sqlite =  require("sqlite3");
var autoEmail =  require("./autoemail.js");

function sqlDB() {

    var db = initialiseSQL();
    var emailer = autoEmail.initAutoEmailer();

    function initialiseSQL() {
        db = new sqlite.Database("data.db");
        setGracefulShutdown(db);
        db.serialize(createEmailTables);
        db.on("error", function(error) {
            console.log("Getting an error : ", error);
        }); 
        return db;
    }

    function setGracefulShutdown() {
        process.on('SIGINT', shutdown);
        function shutdown() {
            console.log("Terminating...");
            db.close();
            console.log("DB closed");
            process.exit(0);
        }
        console.log("Shutdown Handler set");
    }

    function deleteTable(table){
        db.run("DROP TABLE IF EXISTS " + table);
        console.log("table deleted");
    }

    function createEmailTables() {
        //deleteTable("Emails");
        db.run("pragma foreign_keys=on");
        db.run("CREATE TABLE IF NOT EXISTS Emails (eId INTEGER PRIMARY KEY,email VARCHAR UNIQUE)");//email can be 254 bytes, the storage size is the actual length of the data entered + 2 bytes

        //deleteTable("Messages");
        db.run("CREATE TABLE IF NOT EXISTS Messages (subject TEXT, message TEXT, emailId INTEGER, CONSTRAINT FK_EmailRel FOREIGN KEY (emailId) REFERENCES Emails(eId))");
    }

    function addEmail(email, subject, message) {
        db.serialize(insertEmail);
        function insertEmail() {
            db.run("INSERT OR IGNORE INTO Emails(email) VALUES('" + email + "')");
            //db.all("SELECT * FROM Emails", show);

            db.run("INSERT INTO Messages SELECT '" + subject + "','" + message+ "', eId FROM Emails WHERE email ='" + email + "'", messageInserted.bind(null, email));
            //db.all("SELECT * FROM Messages", show);
        }
    }

    function messageInserted(email, err) {
        if (err) {
            console.log(err);
            emailer.sendEmail(false, email);
        } else {
            emailer.sendEmail(true, email);
        }
    }

    function show(err, rows) {
        if(err) throw err;
        console.log(rows);
    }

    return {addEmail, deleteTable};
}

module.exports.initialiseDB = function() {
    return sqlDB();
}