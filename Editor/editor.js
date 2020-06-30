var Accessible = 0;

/**
 * @param oldSectionId
 * @param newSectionId
 * Presi in input gli id HMTL, la procedura fa scomparire la vecchia sezione e, appena l'animazione è finita, fa comparire la nuova
 */
function switchSection( oldSectionId, newSectionId ) {
    var newSection = $( "#" + newSectionId );
    $( "#" + oldSectionId ).fadeOut( function(){
        newSection.fadeIn(); 
    }
    );
};