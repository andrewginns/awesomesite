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

        addBlog("The Rage of Achilles", "The poet invokes a muse to aid him in telling the story of the rage of Achilles, the greatest Greek hero to fight in the Trojan War. The narrative begins nine years after the start of the war, as the Achaeans sack a Trojan-allied town and capture two beautiful maidens, Chryseis and Briseis. Agamemnon, commander-in-chief of the Achaean army, takes Chryseis as his prize. Achilles, one of the Achaeans’ most valuable warriors, claims Briseis. Chryseis’s father, a man named Chryses who serves as a priest of the god Apollo, begs Agamemnon to return his daughter and offers to pay an enormous ransom. When Agamemnon refuses, Chryses prays to Apollo for help.", "1");
        addBlog("The Great Gathering of Armies", "To help the Trojans, as promised, Zeus sends a false dream to Agamemnon in which a figure in the form of Nestor persuades Agamemnon that he can take Troy if he launches a full-scale assault on the city’s walls. The next day, Agamemnon gathers his troops for attack, but, to test their courage, he lies and tells them that he has decided to give up the war and return to Greece. To his dismay, they eagerly run to their ships.", "2");
        addBlog("Helen Reviews the Champions", "The Trojan army marches from the city gates and advances to meet the Achaeans. Paris, the Trojan prince who precipitated the war by stealing the beautiful Helen from her husband, Menelaus, challenges the Achaeans to single combat with any of their warriors. When Menelaus steps forward, however, Paris loses heart and shrinks back into the Trojan ranks. Hector, Paris’s brother and the leader of the Trojan forces, chastises Paris for his cowardice. Stung by Hector’s insult, Paris finally agrees to a duel with Menelaus, declaring that the contest will establish peace between Trojans and Achaeans by deciding once and for all which man shall have Helen as his wife. Hector presents the terms to Menelaus, who accepts. Both armies look forward to ending the war at last.", "3");
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

        addProject("Apollo", "NASA's best space science mission? The one humans got to tag along on, of course! Not only was sending a man to the moon monumental for human history, but the Apollo trips were the first to bring celestial stuff back to Earth and greatly advanced our scientific understanding of the moon. Before Apollo, many people weren't even convinced the moon wasn't made out of cheese (well? non-scientists at least). By studying the moon up close and personal, and then carting? loads of moon rocks home, the Apollo astronauts gathered data that helped us learn how old the moon is, what it's made out of, and even how it might have begun.", "1");
        addProject("Hubble", "The most-loved of all NASA spacecraft, the Hubble Space Telescope has name recognition around the world. Its photos have changed the way everyday people figure themselves into the cosmos. The observatory has also radically changed science, making breakthroughs on astronomical issues too numerous to count. By finally sending up an optical telescope to peer at the sky from beyond Earth's turbulent atmosphere, NASA developed a tool that could reveal stars, planets, nebulae and galaxies in all their fully-detailed glory.", "2");
        addProject("Viking", "When NASA's Viking 1 probe touched-down on Mars in July 1976, it was the first time a man-made object had soft-landed on the red planet. (Though the Soviet Mars 2 and 3 probes did land on the surface, they failed upon landing). The Viking 1 lander also holds the title of longest-running Mars surface mission, with a total duration of 6 years and 116 days. The spacecraft also sent the first color pictures back from the Martian surface, showing us what that mysterious red dot looks like from the ground for the first time.", "3");
        
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