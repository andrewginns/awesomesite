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
        
        deleteTable("Blogs");
        deleteTable("BlogsOrdered");
        db.run("CREATE TABLE IF NOT EXISTS Blogs(title TEXT, message TEXT, date INTEGER)");
        addBlog("title", "mesage", "2");
        addBlog("title2", "mesage", "1");
        addBlog("title3", "mesage", "4");
        db.run("CREATE TABLE IF NOT EXISTS BlogsOrdered(title TEXT, message TEXT, date INTEGER)");
        db.run("INSERT INTO BlogsOrdered(title, message, date) SELECT title,message,date FROM Blogs ORDER BY date ASC");
        db.run("DROP TABLE Blogs");
        db.run("ALTER TABLE BlogsOrdered RENAME TO Blogs");
        db.all("SELECT * FROM Blogs", show);
    }
    
    function addBlog(title, message, date) {
        db.run("INSERT OR IGNORE INTO Blogs(title, message, date) VALUES('" + title + "'," + "'" + message + "',"  + date + ")");
    }
    
    function sendBlogs(response, itemCount) {
        db.all("SELECT * FROM Blogs WHERE rowid = " + itemCount, sendAllBlogs.bind(null, response));
    }

    function addEmail(response, email, subject, message) {
        db.serialize(insertEmail);
        function insertEmail() {
            db.run("INSERT OR IGNORE INTO Emails(email) VALUES('" + email + "')");
            //db.all("SELECT * FROM Emails", show);

            db.run("INSERT INTO Messages SELECT '" + subject + "','" + message+ "', eId FROM Emails WHERE email ='" + email + "'", messageInserted.bind(null, response, email));
            //db.all("SELECT * FROM Messages", show);
        }
    }

    function messageInserted(response, email, err) {
        if (err) {
            console.log(err);
            response.end("Message not submitted, try and resubmit.");
            emailer.sendEmail(false, email);
        } else {
            response.end("Message submitted.");
            emailer.sendEmail(true, email);
        }
    }
    
    function sendAllBlogs(response, err, rows) {
        var err = 0;
        if(err) throw err;
        var text = "";
        console.log("rows: ", rows);
        if(rows.length > 0) {
            for (let index in rows) {
                text += sendBlog(rows[index].title, rows[index].mesage)+ "\n";
            }
        }
        //console.log(text);
        response.end(text);
    }
    
    function sendBlog(title, text) {
        var html = ["<article>", 
                    "<h3>"+ title +"</h3>",
                    "<p>"+text + "</p>",
                    "</article>"].join("\n");
        return html;
    }

    function show(err, rows) {
        if(err) throw err;
        console.log(rows);
    }

    return {addEmail, deleteTable, sendBlogs};
}

module.exports.initialiseDB = function() {
    return sqlDB();
}