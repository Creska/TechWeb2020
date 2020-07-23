/* NOTA
Le uniche volte in cui dovrebbero avvenire comunicazioni col server sono:
* salvataggio
* apertura dell'explorer (per editare/pubblicare/ritirare una storia già esistente)
*/

/* questa sezione indica, per ogni sezione, quella genitore - gli identificatori sono gli id html */
var Parent = {
    MainMenu: "MainMenu",
    ChooseAccessibility: "MainMenu",
    EditStory: "MainMenu",
    EditQuest: "EditStory"
};

/* indica le sezioni dell'editor dove l'utente sta attualmente lavorando */
var CurrentNavStatus = {
	Section: "MainMenu",
	QuestN: -1,
	ActivityN: -1
};

/* variabile usata per i salvataggi temporanei del JSON e degli oggetti su cui l'utente sta lavorando:
* Story --> contiene l'astrazione del JSON su cui si sta lavorando. ad ogni attivazione di "Save" viene fatto il salvataggio su server
* Quest e Activity --> contengono l'astrazione della quest e dell'attività attualmente in modifica. quando viene premuto il tasto di salvataggio, l'oggetto "Story" viene aggiornato
*/
var CurrentWork = {
	Story: {
		ACCESSIBILITY: 0,
		story_title: "",
		settings: {},
		settings_form: "",
		quests: [],
		stylesheet: "",
		score: []
	},
	Quest: {	
		quest_title: "",
		activities: []
	},
	Activity: {
		activity_html: "",
		right_answer: "",
		answer_score: "",
		ASK_EVAL: 0,
		expected_time: 0
	}
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
    $( "#" + CurrentNavStatus.Section ).fadeOut( function(){
        $( "#" + newSectionId ).fadeIn(); 
    }
    );

    CurrentNavStatus.Section = newSectionId;
};

/**
 * @param WidgetId
 * attiva il widget specificato, apposito per l'input di un testo
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

    goToSection( Parent[CurrentNavStatus.Section] );
};

