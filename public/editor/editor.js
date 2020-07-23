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
    "EditStory": "MainMenu", // ci dovrebbe essere anche ChooseStoryFromServer - capire come fare in questo caso
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

function toggleTextInput( WidgetId ) {
	if ( WidgetId == "EditStoryTitle" ) {
		if ( CurrentWork.story_title == '' ) {
			$( '#' + 'StoryTitleInput' ).val() = 'MyStory';
		}
		else {
			$( '#' + 'StoryTitleInput' ).val() = CurrentWork.story_title;
		}

		console.log("prova");

		$( "#EditStoryTitle" ).modal( "toggle" );
	}
};

function saveDataFragment( type, value ) {
    if ( type == 'STORYTITLE' ) {
        CurrentWork.story_title = value;
    }

    window.alert( CurrentWork.story_title ); // debugging
};

function promptSave() {
    /* TODO */
};

function goBack() {
    // promptSave();

    goToSection( Parent[CurrentSection] );
};

