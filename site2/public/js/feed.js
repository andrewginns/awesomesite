addEventListener('load', loadFeed);

function loadFeed(){

    var userFeed = new Instafeed({
        get: 'user',
        userId: '1438033383',
        limit: 12,
        resolution: 'low_resolution',
        clientId: '23ef45cf2fac443db9f3e6fdc6e0fe89',
        accessToken: '1438033383.1677ed0.f526a694aa844fc2afaa94b476af20aa',
        sortBy: 'most-recent',
        template: '<a href="{{image}}" title="{{caption}}" target="_blank"><img src="{{image}}" alt="{{caption}}" class="img-post"/></a>',

    });

    var button = document.getElementById("more");


    userFeed.run();
    //    var i = document.getElementsByClassName('gallery');
    //    console.log(i);

    button.addEventListener("click", function() {
        userFeed.next();
    });

    //on click popup gallery
    $('.gallery').magnificPopup({
        type: 'image',
        delegate: 'a',
        gallery: {
            enabled: true
        }
    });

}




