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
*/
var CurrentWork = {
	ACCESSIBILITY: 0,
	story_title: "",
	story_ID: -1,
	settings: {},
	settings_form: "",
	quests: [],
	stylesheet: "",
	score: []
};




/* -------------------------------- ROBA PER DEBUGGING ----------------------------------------- */

function sayHello() {
	window.alert('hello');
};

function printCurrentJson() {
	console.log( JSON.stringify(CurrentWork ));
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

/* APPUNTO: fare una funzione di reload che prende come argomento un valore che indica qual è la sezione da reloadare. usarlo in goToSection */

/**
 * @param WidgetId
 * attiva il widget specificato, apposito per l'input di un testo
 * viene inizializzato il testo di default, sulla base di ciò che era presente nel relativo campo del JSON
 */
function toggleTextInput( WidgetId ) {
	switch ( WidgetId ) {
		case 'EditStoryTitle':
			if ( CurrentWork.story_title == '' ) {
				$( '#' + 'StoryTitleInput' ).val( 'MyStory' );
			}
			else {
				$( '#' + 'StoryTitleInput' ).val( CurrentWork.story_title );
			}
		
			$( "#EditStoryTitle" ).modal( "toggle" );
			break;
		case 'EditQuestTitle':
			if ( CurrentWork.quests[CurrentNavStatus.QuestN].quest_title == '' ) {
				$( '#' + 'QuestTitleInput' ).val( 'NewQuest' );
			}
			else {
				$( '#' + 'QuestTitleInput' ).val( CurrentWork.quests[CurrentNavStatus.QuestN].quest_title );
			}
		
			$( "#EditQuestTitle" ).modal( "toggle" );
			break;
		default:
			printError();
			break;
	}
};

function toggleIndexInput() {
	let UseLastIndex = $( "#UseLastIndex" );
	let SelectIndex = $( "#SelectIndex" );
	let IndexInput = $( "#IndexInput" );

	/* inizializzazione dei valori di default */
	UseLastIndex.prop("checked", true);
	SelectIndex.prop("checked", false);
	IndexInput.attr("disabled", true);

	if ( CurrentNavStatus.QuestN < 0 ) {
		IndexInput.val( CurrentWork.quests.length );
		IndexInput.attr('max', IndexInput.val() );
	}
	else {
		IndexInput.val( CurrentWork.quests[QuestN].activities.length );
		IndexInput.attr('max', IndexInput.val() );
	}

	$( "#InsertStageIndex" ).modal( "toggle" );
};

function insertNewStage() {
	let UseLastIndex = $( "#UseLastIndex" );
	let SelectIndex = $( "#SelectIndex" );
	let IndexInput = $( "#IndexInput" );

	let ChosenIndex;

	if ( CurrentNavStatus.QuestN < 0 ) {
		if ( UseLastIndex.prop( "checked" ) ) {
			ChosenIndex = CurrentWork.quests.length;
		}
		else {
			ChosenIndex = IndexInput.val();
		}

		CurrentWork.quests.splice( ChosenIndex, 0, initQuest() );

		/* decidere cosa fare */
	}
	else {
		if ( UseLastIndex.prop( "checked" ) ) {
			ChosenIndex = CurrentWork.quests[CurrentNavStatus.QuestN].activities.length;
		}
		else {
			ChosenIndex = IndexInput.val();
		}

		CurrentWork.quests[CurrentNavStatus.QuestN].activities.splice( ChosenIndex, 0, initActivity() );

		/* decidere cosa fare */
	}

	$('#InsertStageIndex').modal('hide');
}


function saveDataFragment( field, value, quest_n, activity_n ) {
	switch ( field ) {
		case 'story_title':
			CurrentWork.story_title = value;
			break;
		case 'settings':
			/* TODO */
			break;
		case 'settings_form':
			/* TODO */
			break;
		case 'quest_title':
			if ( quest_n < 0 || quest_n > CurrentWork.quests.length ) {
				printError();
			}
			else {
				CurrentWork.quests[quest_n].quest_title = value;
			}
			break;
		case 'activity_html':
			if ( ( quest_n < 0 || quest_n > CurrentWork.quests.length ) || ( activity_n < 0 || activity_n > CurrentWork.quests[quest_n].activities.length ) ) {
				printError();
			}
			else {
				CurrentWork.quests[quest_n].activities[activity_n].activity_html = value;
			}
			break;
		case 'right_answer':
			if ( ( quest_n < 0 || quest_n > CurrentWork.quests.length ) || ( activity_n < 0 || activity_n > CurrentWork.quests[quest_n].activities.length ) ) {
				printError();
			}
			else {
				CurrentWork.quests[quest_n].activities[activity_n].right_answer = value;
			}
			break;
		case 'answer_score':
			if ( ( quest_n < 0 || quest_n > CurrentWork.quests.length ) || ( activity_n < 0 || activity_n > CurrentWork.quests[quest_n].activities.length ) ) {
				printError();
			}
			else {
				CurrentWork.quests[quest_n].activities[activity_n].answer_score = value;
			}
			break;
		case 'ASK_EVAL':
			if ( ( quest_n < 0 || quest_n > CurrentWork.quests.length ) || ( activity_n < 0 || activity_n > CurrentWork.quests[quest_n].activities.length ) ) {
				printError();
			}
			else {
				CurrentWork.quests[quest_n].activities[activity_n].ASK_EVAL = value;
			}
			break;
		case 'expected_time':
			if ( ( quest_n < 0 || quest_n > CurrentWork.quests.length ) || ( activity_n < 0 || activity_n > CurrentWork.quests[quest_n].activities.length ) ) {
				printError();
			}
			else {
				CurrentWork.quests[quest_n].activities[activity_n].expected_time = value;
			}
			break;
		case 'stylesheet':
			/* TODO */
			break;
		case 'score':
			/* TODO */
			break;
		case 'ACCESSIBILITY':
		case 'story_ID':
			window.alert( "non è possibile effettuare questa modifica" ); // migliorare l'alert
			break;
		default:
			printError();
			break;
	}

	printCurrentJson(); // debugging
};