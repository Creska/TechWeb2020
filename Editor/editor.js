var Accessible = 0; /* indica se la storia che si sta creando è accessibile o no */

/* questo oggetto contiene gli id della sezione vecchia e corrente su cu si trova(va) l'utente */
var NavigationStat = {
    prevSection: "",
    currSection: ""
};

/**
 * @param oldSectionId
 * @param newSectionId
 * Presi in input gli id HMTL, la procedura fa scomparire la vecchia sezione e, appena l'animazione è finita, fa comparire la nuova
 */
function switchSection( oldSectionId, newSectionId ) {
    NavigationStat.prevSection = oldSectionId;
    NavigationStat.currSection = newSectionId;
    var newSection = $( "#" + newSectionId );
    $( "#" + oldSectionId ).fadeOut( function(){
        newSection.fadeIn(); 
    }
    );
};