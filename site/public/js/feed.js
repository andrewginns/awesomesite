//used to run the javascript once the page is loaded
addEventListener("load", loadFeed);

//Used to initialise and load the instagram feed
function loadFeed(){

    var instaLoader = document.getElementById("insta_loader");
    var instaBtn = document.getElementById("more");
    instaBtn.addEventListener("click", retrieveImages);
    
    var userFeed = new Instafeed({
        get: "user",
        userId: "1438033383",
        limit: 12,
        resolution: "standard_resolution",
        clientId: "23ef45cf2fac443db9f3e6fdc6e0fe89",
        accessToken: "1438033383.1677ed0.f526a694aa844fc2afaa94b476af20aa",
        sortBy: "most-recent",
        target: "instafeed",
        
        //this is the template for each image
        template: '<a href="{{image}}" title="{{caption}}" target="_blank"><img src="{{image}}" alt="{{caption}}" class="img-post"/></a>',
        after: function() {
            deactivateLoader(instaLoader);
            //disable button if no ore results to load
            if (!this.hasNext()) {
                instaBtn.setAttribute("disabled", "disabled");
                instaBtn.className = "fadeout";
                instaBtn.innerHTML = "no more";  
            }
        }
    });
    
    showLoader(instaLoader);
    userFeed.run();

    //used to show the loader, and get the next batch of images
    function retrieveImages() {
        showLoader(instaLoader);
        userFeed.next();
    }

    //on click popup gallery (magnifies image)
    $(".gallery").magnificPopup({
        type: "image",
        delegate: "a",
        gallery: {
            enabled: true
        }
    });

}




