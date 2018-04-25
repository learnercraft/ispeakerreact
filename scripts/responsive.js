$(document.body).ready(function() {

    // refresh on screen step change
    var old_smartphone = null;
    var old_tablet = null;
    var old_desktop = null;
    var old_hd = null;
    on_resize();

    function on_resize() {
        var smartphone = false;
        var tablet = false;
        var hd = false;
        try{
            var smartphone = window.matchMedia("(max-width: 761px)").matches;
            var tablet = window.matchMedia("(min-width: 762px) and (max-width: 928px)").matches;
            var hd = window.matchMedia("(min-width: 1220px)").matches;
        }catch(err){}
        var desktop = (!smartphone && !tablet && !hd);

        if ((old_smartphone != null && old_smartphone != smartphone) || (old_tablet != null && old_tablet != tablet) || (old_desktop != null && old_desktop != desktop) || (old_hd != null && old_hd != hd)){
           window.location = window.location;
        }
        old_smartphone = smartphone;
        old_tablet = tablet;
        old_desktop = desktop;
        old_hd = hd;

        if (hd || desktop)
            document.getElementById("q").focus();
    }

    $(window).resize(function() {
        on_resize();
    });
});
