"use strict"
var sqlite =  require("sqlite3");
var autoEmail =  require("./autoemail.js");

function sqlDB() {

    var db = initialiseSQL();
    var emailer = autoEmail.initAutoEmailer();

    function initialiseSQL() {
        db = new sqlite.Database("data.db");
        db.serialize(initialiseTablesAndQueries);
        setGracefulShutdown(db);
        db.on("error", function(error) {
            console.log("Getting an error : ", error);
        }); 
        return db;
    }

    function deleteTable(table){
        db.run("DROP TABLE IF EXISTS " + table);
        console.log("table deleted");
    }

    var insertEmailQuery;
    var insertMessageQuery;
    var insertBlogQuery;
    var selectBlogQuery;
    var insertProjectQuery;
    var selectProjectQuery;
    function initialiseTablesAndQueries() {
        deleteTable("Emails");
        db.run("pragma foreign_keys=on");
        db.run("CREATE TABLE IF NOT EXISTS Emails (eId INTEGER PRIMARY KEY,email VARCHAR UNIQUE, mailList INTEGER NOT NULL)");//email can be 254 bytes, the storage size is the actual length of the data entered + 2 bytes
        //primary key will be auto generated
        insertEmailQuery = db.prepare("INSERT OR IGNORE INTO Emails(email, mailList) VALUES(?, ?)");
        insertMessageQuery = db.prepare("INSERT INTO Messages SELECT ?,?, eId FROM Emails WHERE email =?");


        deleteTable("Messages");
        db.run("CREATE TABLE IF NOT EXISTS Messages (subject TEXT NOT NULL, message TEXT NOT NULL, emailId INTEGER NOT NULL, CONSTRAINT FK_EmailRel FOREIGN KEY (emailId) REFERENCES Emails(eId))");

        deleteTable("Blogs");
        deleteTable("BlogsOrdered");
        db.run("CREATE TABLE IF NOT EXISTS Blogs(title TEXT NOT NULL, message TEXT NOT NULL, date INTEGER NOT NULL)");
        insertBlogQuery = db.prepare("INSERT OR IGNORE INTO Blogs(title, message, date) VALUES(?,?,?)");
        selectBlogQuery = db.prepare("SELECT * FROM Blogs WHERE rowid = ?");

        addBlog("title", "mesage", "2");
        addBlog("title2", "mesage", "1");
        addBlog("title3", "mesage", "4");
        db.run("CREATE TABLE IF NOT EXISTS BlogsOrdered(title TEXT NOT NULL, message TEXT NOT NULL, date INTEGER NOT NULL)");
        db.run("INSERT INTO BlogsOrdered(title, message, date) SELECT title,message,date FROM Blogs ORDER BY date ASC");
        db.run("DROP TABLE Blogs");
        db.run("ALTER TABLE BlogsOrdered RENAME TO Blogs");
        db.all("SELECT * FROM Blogs", show);
        getBlogCount();
        
        
        deleteTable("Projects");
        deleteTable("ProjectsOrdered");
        db.run("CREATE TABLE IF NOT EXISTS Projects(title TEXT NOT NULL, message TEXT NOT NULL, date INTEGER NOT NULL)");
        insertProjectQuery = db.prepare("INSERT OR IGNORE INTO Projects(title, message, date) VALUES(?,?,?)");
        selectProjectQuery = db.prepare("SELECT * FROM Projects WHERE rowid = ?");

        addProject("project1", "mesage", "2");
        addProject("project2", "mesage", "1");
        addProject("project 3", "mesage", "4");
        
        db.run("CREATE TABLE IF NOT EXISTS ProjectsOrdered(title TEXT NOT NULL, message TEXT NOT NULL, date INTEGER NOT NULL)");
        db.run("INSERT INTO ProjectsOrdered(title, message, date) SELECT title,message,date FROM Projects ORDER BY date ASC");
        db.run("DROP TABLE Projects");
        db.run("ALTER TABLE ProjectsOrdered RENAME TO Projects");
        db.all("SELECT * FROM Projects", show);
        getProjectCount();
    }

    function setGracefulShutdown() {
        process.on('SIGINT', shutdown);
        function shutdown() {
            console.log("Terminating...");
            insertEmailQuery.finalize();
            insertMessageQuery.finalize();
            insertBlogQuery.finalize();
            selectBlogQuery.finalize();
            insertProjectQuery.finalize();
            selectProjectQuery.finalize();
            db.close();
            console.log("DB closed");
            process.exit(0);
            process.exit(0);
        }
        console.log("Shutdown Handler set");
    }

    var blogCount = 0;
    //used to get the count of blogs
    function getBlogCount() {
        db.each("SELECT COUNT(*) FROM Blogs", countCallBack);
        function countCallBack(err, row) {
            if (err) throw err;
            blogCount = row['COUNT(*)'];
            console.log(row);
        }
    }
    
    var projectCount = 0;
    //used to get the count of projects
    function getProjectCount() {
        db.each("SELECT COUNT(*) FROM Projects", countCallBack);
        function countCallBack(err, row) {
            if (err) throw err;
            projectCount = row['COUNT(*)'];
            console.log(row);
        }
    }

    //used to insert a blog into the Blog table
    function addBlog(title, message, date) {
        console.log("Adding Blog");
        insertBlogQuery.run(title, message, date, genericErrorLog);
    }
    
    //used to insert a blog into the Blog table
    function addProject(title, message, date) {
        console.log("Adding Project");
        insertProjectQuery.run(title, message, date, genericErrorLog);
    }

    //used to get a blog corresponding to the itemCount
    function sendBlogs(response, itemCount) {
        if (itemCount <= blogCount){
            selectBlogQuery.each(itemCount, sendSelectedBlogs.bind(null, response, itemCount));
        } else {
            var more = {"more": false}
            var data = [more];
            var text = JSON.stringify(data);
            //console.log(text);
            quickDeliver(response, "text/plain", text);
        }
    }
    
    //used to get a project corresponding to the itemcount
    function sendProjects(response, itemCount) {
        console.log(itemCount, projectCount);
        if (itemCount <= projectCount){
            console.log(itemCount);
            selectProjectQuery.each(itemCount, sendSelectedProjects.bind(null, response, itemCount));
        } else {
            var more = {"more": false}
            var data = [more];
            var text = JSON.stringify(data);
            //console.log(text);
            quickDeliver(response, "text/plain", text);
        }
    }

    //used to add an email to the database and send a server response
    //it also sends an automated email to the client
    function addEmail(response, email, mailList, subject, message) {
        db.serialize(insertEmail);
        function insertEmail() {
            insertEmailQuery.run(email, mailList, genericErrorLog);
            db.all("SELECT * FROM Emails", show);
            insertMessageQuery.run(subject, message, email, messageInserted.bind(null, response, email));
            db.all("SELECT * FROM Messages", show);
        }
    }

    //generic error reporting callback
    function genericErrorLog (err) {
        if (err) console.log("Getting an error : ", err);
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

    function sendSelectedBlogs(response,itemCount, err, row) {
        if(err) throw err;
        var more = {"more": (itemCount < blogCount)? true: false}
        var data = [row, more];
        console.log(data);
        var text = JSON.stringify(data);
        //console.log(text);
        quickDeliver(response, "text/plain", text);
    }
    
    function sendSelectedProjects(response,itemCount, err, row) {
        if(err) throw err;
        var more = {"more": (itemCount < projectCount)? true: false}
        var data = [row, more];
        console.log(data);
        var text = JSON.stringify(data);
        //console.log(text);
        quickDeliver(response, "text/plain", text);
    }

    // Deliver the file that has been read in to the browser.
    function quickDeliver(response, type, content) {
        var typeHeader = { "Content-Type": type };
        response.writeHead(200, typeHeader);
        response.write(content);
        response.end();
    }

    function show(err, rows) {
        if(err) throw err;
        console.log(rows);
    }

    return {addEmail, deleteTable, sendBlogs, sendProjects};
}

module.exports.initialiseDB = function() {
    return sqlDB();
}