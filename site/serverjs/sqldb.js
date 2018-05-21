"use strict"
var sqlite =  require("sqlite3");
var autoEmail =  require("./autoemail.js");

function sqlDB() {

    
    var emailer = autoEmail.initAutoEmailer();
    var insertEmailQuery;
    var insertMessageQuery;
    var insertBlogQuery;
    var selectBlogQuery;
    var insertProjectQuery;
    var selectProjectQuery;
    var insertAboutQuery;
    var selectAboutQuery;
    var OK = 200, Error = 500;
    var printTables = false;
    var db = initialiseSQL();


    function initialiseSQL() {
        db = new sqlite.Database("data.db");
        //db.serialize(deleteAllTables);
        db.serialize(initialiseTablesAndQueries);
        //db.serialize(insertDummyData);
        setGracefulShutdown(db);
        db.on("error", report);
        function report(error) {
            console.log("Getting an error : ", error);
        }
        console.log("DB started")
        return db;
    }

    //used to initialise tables and prepare queries
    function initialiseTablesAndQueries() {
        db.run("pragma foreign_keys=on");
        db.run("CREATE TABLE IF NOT EXISTS Emails (eId INTEGER PRIMARY KEY,email VARCHAR UNIQUE, mailList INTEGER NOT NULL)");//email can be 254 bytes, the storage size is the actual length of the data entered + 2 bytes
        //primary key will be auto generated
        insertEmailQuery = db.prepare("INSERT OR IGNORE INTO Emails(email, mailList) VALUES(?, ?)");
        db.each("SELECT COUNT(*) FROM Emails", showCount.bind(null, "\nEmails"));
        if(printTables) db.all("SELECT * FROM Emails", show);
        

        db.run("CREATE TABLE IF NOT EXISTS Messages (subject TEXT NOT NULL, message TEXT NOT NULL, emailId INTEGER NOT NULL, CONSTRAINT FK_EmailRel FOREIGN KEY (emailId) REFERENCES Emails(eId))");
        insertMessageQuery = db.prepare("INSERT INTO Messages SELECT ?,?, eId FROM Emails WHERE email =?");
        db.each("SELECT COUNT(*) FROM Messages", showCount.bind(null, "\nMessages"));
        if(printTables) db.all("SELECT * FROM Messages", show);

        db.run("CREATE TABLE IF NOT EXISTS Blogs(title TEXT NOT NULL, article TEXT NOT NULL, date INTEGER NOT NULL)");
        insertBlogQuery = db.prepare("INSERT OR IGNORE INTO Blogs(title, article, date) VALUES(?,?,?)");
        selectBlogQuery = db.prepare("SELECT * FROM Blogs WHERE rowid = ?");

        //reorder blogs by date
        db.run("CREATE TABLE IF NOT EXISTS BlogsOrdered(title TEXT NOT NULL, article TEXT NOT NULL, date INTEGER NOT NULL)");
        db.run("INSERT INTO BlogsOrdered(title, article, date) SELECT title,article,date FROM Blogs ORDER BY date DESC");
        db.run("DROP TABLE Blogs");
        db.run("ALTER TABLE BlogsOrdered RENAME TO Blogs");
        getBlogCount();
        if(printTables) db.all("SELECT * FROM Blogs", show);

        db.run("CREATE TABLE IF NOT EXISTS Projects(title TEXT NOT NULL, article TEXT NOT NULL, date INTEGER NOT NULL)");
        insertProjectQuery = db.prepare("INSERT OR IGNORE INTO Projects(title, article, date) VALUES(?,?,?)");
        selectProjectQuery = db.prepare("SELECT * FROM Projects WHERE rowid = ?");

        //reorder projects by date
        db.run("CREATE TABLE IF NOT EXISTS ProjectsOrdered(title TEXT NOT NULL, article TEXT NOT NULL, date INTEGER NOT NULL)");
        db.run("INSERT INTO ProjectsOrdered(title, article, date) SELECT title,article,date FROM Projects ORDER BY date DESC");
        db.run("DROP TABLE Projects");
        db.run("ALTER TABLE ProjectsOrdered RENAME TO Projects");
        getProjectCount();
        if(printTables) db.all("SELECT * FROM Projects", show);

        db.run("CREATE TABLE IF NOT EXISTS About(about TEXT NOT NULL)");
        insertAboutQuery = db.prepare("INSERT OR IGNORE INTO About(about) VALUES(?)");
        selectAboutQuery = db.prepare("SELECT * FROM About WHERE rowid = 1");
        db.each("SELECT COUNT(*) FROM About", showCount.bind(null, "\nAbout"));
        if(printTables) db.all("SELECT * FROM About", show);


    }

    //used to delete a table
    function deleteTable(table){
        db.run("DROP TABLE IF EXISTS " + table);
    }

    //Used to delete All tables for db reinintialisation
    function deleteAllTables() {
        deleteTable("About");
        deleteTable("Projects");
        deleteTable("Messages");
        deleteTable("Blogs");
        deleteTable("Emails");
    }

    //used to insert dummy data for Blogs, Projects and About
    function insertDummyData() {
        insertDummyBlogs();
        insertDummyProjects();
        insertDummyAbout();
    }

    //used to insert dummy Blogs Data
    function insertDummyBlogs() {
        addBlog("The Rage of Achilles", "The poet invokes a muse to aid him in telling the story of the rage of Achilles, the greatest Greek hero to fight in the Trojan War. The narrative begins nine years after the start of the war, as the Achaeans sack a Trojan-allied town and capture two beautiful maidens, Chryseis and Briseis. Agamemnon, commander-in-chief of the Achaean army, takes Chryseis as his prize. Achilles, one of the Achaeans’ most valuable warriors, claims Briseis. Chryseis’s father, a man named Chryses who serves as a priest of the god Apollo, begs Agamemnon to return his daughter and offers to pay an enormous ransom. When Agamemnon refuses, Chryses prays to Apollo for help.", new Date(2018,3,1));
        addBlog("The Great Gathering of Armies", "To help the Trojans, as promised, Zeus sends a false dream to Agamemnon in which a figure in the form of Nestor persuades Agamemnon that he can take Troy if he launches a full-scale assault on the city’s walls. The next day, Agamemnon gathers his troops for attack, but, to test their courage, he lies and tells them that he has decided to give up the war and return to Greece. To his dismay, they eagerly run to their ships.", new Date(2015,3,18));
        addBlog("Helen Reviews the Champions", "The Trojan army marches from the city gates and advances to meet the Achaeans. Paris, the Trojan prince who precipitated the war by stealing the beautiful Helen from her husband, Menelaus, challenges the Achaeans to single combat with any of their warriors. When Menelaus steps forward, however, Paris loses heart and shrinks back into the Trojan ranks. Hector, Paris’s brother and the leader of the Trojan forces, chastises Paris for his cowardice. Stung by Hector’s insult, Paris finally agrees to a duel with Menelaus, declaring that the contest will establish peace between Trojans and Achaeans by deciding once and for all which man shall have Helen as his wife. Hector presents the terms to Menelaus, who accepts. Both armies look forward to ending the war at last.", new Date(2017,5,30));
    }

    //used to insert dummy Projects Data
    function insertDummyProjects() {
        addProject("Apollo", "NASA's best space science mission? The one humans got to tag along on, of course! Not only was sending a man to the moon monumental for human history, but the Apollo trips were the first to bring celestial stuff back to Earth and greatly advanced our scientific understanding of the moon. Before Apollo, many people weren't even convinced the moon wasn't made out of cheese (well? non-scientists at least). By studying the moon up close and personal, and then carting? loads of moon rocks home, the Apollo astronauts gathered data that helped us learn how old the moon is, what it's made out of, and even how it might have begun.", new Date(2013,2,18));
        addProject("Hubble", "The most-loved of all NASA spacecraft, the Hubble Space Telescope has name recognition around the world. Its photos have changed the way everyday people figure themselves into the cosmos. The observatory has also radically changed science, making breakthroughs on astronomical issues too numerous to count. By finally sending up an optical telescope to peer at the sky from beyond Earth's turbulent atmosphere, NASA developed a tool that could reveal stars, planets, nebulae and galaxies in all their fully-detailed glory.", new Date(2014,3,5));
        addProject("Viking", "When NASA's Viking 1 probe touched-down on Mars in July 1976, it was the first time a man-made object had soft-landed on the red planet. (Though the Soviet Mars 2 and 3 probes did land on the surface, they failed upon landing). The Viking 1 lander also holds the title of longest-running Mars surface mission, with a total duration of 6 years and 116 days. The spacecraft also sent the first color pictures back from the Martian surface, showing us what that mysterious red dot looks like from the ground for the first time.", new Date(2018,4,9));
        addProject("Chandra", "Since 1999, the Chandra X-ray Observatory has been scanning the skies in X-ray light, looking at some of the most distant and bizarre astronomical events. Because Earth's pesky atmosphere blocks out most X-rays, astronomers couldn't view the universe in this high-energy, short-wavelength light until they sent Chandra up to space. The observatory has such high-resolution mirrors, it can see X-ray sources 100 times fainter than any previous X-ray telescope. Among other firsts, Chandra showed scientists the first glimpse of the crushed star left over after a supernova when it observed the remnant Cassiopeia A.", new Date(2018,4,21));

    }

    //used to insert dummy about data
    function insertDummyAbout() {

        addAbout("Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.");
    }

    //used to setup signal handling to shutdown the server correctly
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
            selectAboutQuery.finalize();
            insertAboutQuery.finalize();
            db.close();
            console.log("DB closed");
            process.exit(0);
        }
        console.log("Shutdown Handler set");
    }

    var blogCount = 0;
    //used to get and store the number of blogs
    function getBlogCount() {
        db.each("SELECT COUNT(*) FROM Blogs", countCallBack);
        function countCallBack(err, row) {
            if (err) throw err;
            blogCount = row['COUNT(*)'];
            console.log("\nBlog Count:", blogCount);
        }
    }

    function showCount(tableName, err, row) {
        if (err) throw err;
        console.log(tableName, "Count:", row['COUNT(*)']);
    }

    var projectCount = 0;
    //used to get and store the number of projects
    function getProjectCount() {
        db.each("SELECT COUNT(*) FROM Projects", countCallBack);
        function countCallBack(err, row) {
            if (err) throw err;
            projectCount = row['COUNT(*)'];
            console.log("\nProject Count:", projectCount);
        }
    }

    //used to insert a blog into the Blog table
    function addBlog(title, article, date) {
        date = date.getTime();
        insertBlogQuery.run(title, article, date, genericErrorLog);
    }

    //used to insert a blog into the Project table
    function addProject(title, article, date) {
        insertProjectQuery.run(title, article, date, genericErrorLog);
    }

    //used to add an about entry into the About table
    function addAbout(about) {
        insertAboutQuery.run(about, genericErrorLog);
        if(printTables) db.all("SELECT * FROM About", show);

    }

    //used to get the about section
    function sendAbout(response) {
        selectAboutQuery.each(sendSelectedAbout.bind(null, response));
    }

    //used to get a blog corresponding to the itemCount
    //and send it as a response as a JSON
    //if the itemCount is larger than the blogCount then the JSON is set to {"more": false}, this is error handling for devious requests
    function sendBlogs(response, itemCount) {
        if (itemCount <= blogCount){
            selectBlogQuery.each(itemCount, sendSelectedBlogs.bind(null, response, itemCount));
        } else {
            genenricNoMoreData();
        }
    }

    //used to get a project corresponding to the itemCount
    //and send it as a response as a JSON
    //if the itemCount is larger than the projectCount then the JSON is set to {"more": false}, this is error handling for devious requests
    function sendProjects(response, itemCount) {
        if (itemCount <= projectCount){
            //console.log(itemCount);
            selectProjectQuery.each(itemCount, sendSelectedProjects.bind(null, response, itemCount));
        } else {
            genenricNoMoreData();
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

    //the message callback for inserting a message
    //this sends a reply on the website and a confirmation via email
    //if the message cannot be submitted into the table, an appropriate message is sent
    function messageInserted(response, email, err) {
        if (err) {
            quickDeliver(response, "text/plain", Error, "Message not submitted, try and resubmit.");
            emailer.sendEmail(false, email);
        } else {
            quickDeliver(response, "text/plain", OK, "Message submitted.");
            emailer.sendEmail(true, email);
        }
    }

    //this is the select blogs query callback which is used to send a response to the client
    //the query data is converted into a JSON and sent to the client
    function sendSelectedBlogs(response,itemCount, err, row) {
        if(err) genenricNoMoreData();
        var more = {"more": (itemCount < blogCount)? true: false}
        var data = [row, more];
        //console.log(data);
        var text = JSON.stringify(data);
        //console.log(text);
        quickDeliver(response, "text/plain", OK, text);
    }

    //used to send a reply that no more data is available on error
    //db transaction fails in this case
    function genenricNoMoreData() {
        var more = {"more": false}
        var data = [more];
        var text = JSON.stringify(data);
        //console.log(text);
        quickDeliver(response, "text/plain", Error, text);
        return;
    }

    //this is the select projects query callback which is used to send a response to the client
    //the query data is converted into a JSON and sent to the client
    function sendSelectedProjects(response,itemCount, err, row) {
        if(err) genenricNoMoreData();
        var more = {"more": (itemCount < projectCount)? true: false}
        var data = [row, more];
        //console.log(data);
        var text = JSON.stringify(data);
        //console.log(text);
        quickDeliver(response, "text/plain", OK, text);
    }

    //this is the select about query callback which is used to send a response to the client
    //the query data is simply sent to the client as plain text
    function sendSelectedAbout(response, err, row) {
        if(err || row.length == 0) quickDeliver(response, "text/plain", Error, "Could not load about.");
        quickDeliver(response, "text/plain", OK, row.about);
    }

    //Used to Deliver the file that has been read in to the browser.
    function quickDeliver(response, type, code,  content) {
        var typeHeader = { "Content-Type": type };
        response.writeHead(code, typeHeader);
        response.write(content);
        response.end();
    }

    //Used to print out the rows of a table
    function show(err, rows) {
        if(err) throw err;
        console.log(rows);
    }

    //used to create an object and expose some of the functions
    return {addEmail, deleteTable, sendBlogs, sendProjects, sendAbout};
}

//used to allow loading via require
module.exports.initialiseDB = function() {
    return sqlDB();
}