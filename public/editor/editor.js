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
*
* NOTA: PROBABILMENTE NON SERVONO I CAMPI QUEST E ACTIVITY
*/
var CurrentWork = {
	Story: {
		ACCESSIBILITY: 0,
		story_title: "",
		story_ID: -1,
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




/* -------------------------------- ROBA PER DEBUGGING ----------------------------------------- */

function sayHello() {
	window.alert('hello');
};

function printCurrentJson() {
	console.log( JSON.stringify(CurrentWork.Story ));
}



/* --------------------------------------------------------------------------------------------- */




function printError() {
	window.alert( "!!! MAJOR ERROR !!!");
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
	switch ( WidgetId ) {
		case 'EditStoryTitle':
			if ( CurrentWork.Story.story_title == '' ) {
				$( '#' + 'StoryTitleInput' ).val( 'MyStory' );
			}
			else {
				$( '#' + 'StoryTitleInput' ).val( CurrentWork.Story.story_title );
			}
		
			$( "#EditStoryTitle" ).modal( "toggle" );
			break;
		case 'EditQuestTitle':
			if ( CurrentWork.Quest.quest_title == '' ) {
				$( '#' + 'QuestTitleInput' ).val( 'NewQuest' );
			}
			else {
				$( '#' + 'QuestTitleInput' ).val( CurrentWork.Quest.quest_title );
			}
		
			$( "#EditQuestTitle" ).modal( "toggle" );
			break;
		default:
			printError();
			break;
	}
};

/**
 * @param type indica a cosa si riferisce il valore da salvare
 * @param value 
 * @param WidgetId widget tramite cui è stato inserito l'input
 * salva un valore nell'apposito campo, dopodiché chiude il widget di input
 */
function saveDataFragment( type, value, WidgetId ) {
	switch ( type ) {
		case 'STORYTITLE':
			CurrentWork.Story.story_title = value;
			break;
		case 'QUESTTITLE':
			CurrentWork.Quest.quest_title = value;
			break;
		default:
			printError();
			break;
	}
	
	$( "#" + WidgetId ).modal( "hide" );

	printCurrentJson(); // debugging
};

function promptSave() {
    /* TODO */
};

function goBack() {
    // promptSave();

    goToSection( Parent[CurrentNavStatus.Section] );
};

function initQuest() {
	var EmptyQuest = {	
		quest_title: "",
		activities: []
	};

	return EmptyQuest;
};

function initActivity() {
	var EmptyActivity = {
		activity_html: "",
		right_answer: "",
		answer_score: "",
		ASK_EVAL: 0,
		expected_time: 0
	};

	return EmptyActivity;
};

function saveQuest() {
	CurrentWork.Story.quests[CurrentNavStatus.QuestN] = CurrentWork.Quest;
}

function saveActivity() {
	CurrentWork.Story.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN] = CurrentWork.Activity;
}

function editQuest( quest_n ) {
	goToSection( "EditQuest" );

	CurrentNavStatus.QuestN = quest_n;
	CurrentWork.Quest = CurrentWork.Story.quests[quest_n];
	CurrentWork.Activity = initActivity();
};

function addQuest() {
	CurrentNavStatus.QuestN = CurrentWork.Story.quests.length;
	CurrentWork.Quest = initQuest();
	CurrentWork.Activity = initActivity();

	toggleTextInput( 'EditQuestTitle' );

	/* questa parte qui sotto va fatta meglio */
	$( '#SaveQuestName' ).click( function() {
		saveQuest(); // salva la quest corrente nel json

		goToSection( "EditQuest" );
	});
};

/* APPUNTO: fare una funzione di reload che prende come argomento un valore che indica qual è la sezione da reloadare. usarlo in goToSection */