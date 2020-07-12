/* NOTA
Le uniche volte in cui dovrebbero avvenire comunicazioni col server sono:
* opzione "modifica storia esistente"
* salvataggio
* pubblicazione di una storia
* ritiro di una storia
*/

/* questa sezione indica, per ogni sezione, quella genitore - gli identificatori sono gli id html */
var Parent = {
    "MainMenu": "MainMenu",
    "ChooseAccessibility": "MainMenu",
    "ChooseStoryFromServer": "MainMenu",
    "EditStory": "MainMenu" // ci dovrebbe essere anche ChooseStoryFromServer - capire come fare in questo caso
};

var ACCESSIBILITY = 0; /* flag che indica se la storia che si sta creando è accessibile o no */
var CurrentSection = "MainMenu"; /* indica la sezione dell'editor dove l'utente sta attualmente lavorando */
var CurrentWork; /* variabile usata per i salvataggi temporanei del JSON */


/**
* @param newSectionId
* fa scomparire la sezione corrente e, appena l'animazione è finita, fa comparire quella nuova indicata
*/
function goToSection( newSectionId ) {
    $( "#" + CurrentSection ).fadeOut( function(){
        $( "#" + newSectionId ).fadeIn(); 
    }
    );

    CurrentSection = newSectionId;
};


function promptSave() {
    /* TODO */
};

function goBack() {
    // promptSave();

    goToSection( Parent[CurrentSection] );
};

