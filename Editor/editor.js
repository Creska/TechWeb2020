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
    "EditStory": "MainMenu",
    "EditQuest": "EditStory"
};

var CurrentSection = "MainMenu"; /* indica la sezione dell'editor dove l'utente sta attualmente lavorando */

/* variabile usata per i salvataggi temporanei del JSON */
var CurrentWork = {
	"ACCESSIBILITY": 0,
	"story_title": "",
	"settings": {},
	"settings_form": "",
	"quests": [
		{	
			"quest_title": "",
			"activities": [
				{
					"activity_html": "",
					"right_answer": "",
					"answer_score": "",
					"ASK_EVAL": 0
				}
			]
		}
	],
	"stylesheet": "",
	"score": []
};

/* sta roba è per il debugging */
function sayHello() {
	window.alert('hello');
};

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

/**
 * @param WidgetId
 * attiva il widget specificato, apposito per il l'input di un testo
 * viene inizializzato il testo di default, sulla base di ciò che era presente nel relativo campo del JSON
 */
function toggleTextInput( WidgetId ) {
	if ( WidgetId == "EditStoryTitle" ) {
		if ( CurrentWork.story_title == '' ) {
			$( '#' + 'StoryTitleInput' ).val( 'MyStory' );
		}
		else {
			$( '#' + 'StoryTitleInput' ).val( CurrentWork.story_title );
		}

		$( "#EditStoryTitle" ).modal( "toggle" );
	}
};

/**
 * @param type indica a cosa si riferisce il valore da salvare
 * @param value 
 * @param WidgetId widget tramite cui è stato inserito l'input
 * salva un valore nell'apposito campo, dopodiché chiude il widget di input
 */
function saveDataFragment( type, value, WidgetId ) {
    if ( type == 'STORYTITLE' ) {
        CurrentWork.story_title = value;
	}
	
	$( "#" + WidgetId ).modal( "hide" );

    console.log( CurrentWork.story_title ); // debugging
};

function promptSave() {
    /* TODO */
};

function goBack() {
    // promptSave();

    goToSection( Parent[CurrentSection] );
};

