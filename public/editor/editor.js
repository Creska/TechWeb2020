/* NOTA
Le uniche volte in cui dovrebbero avvenire comunicazioni col server sono:
* salvataggio su server
* apertura dell'explorer (per editare/pubblicare/ritirare una storia già esistente)
*/

/* indica, per ogni sezione, quella genitore - gli identificatori sono gli id html */
var Parent = {
    MainMenu: "MainMenu",
    ChooseAccessibility: "MainMenu",
    EditStory: "MainMenu",
	EditQuest: "EditStory",
	EditActivity: "EditQuest"
};

/* indica la dell'editor dove l'utente si trova attualmente e la quest/attività su cui sta lavorando */
var CurrentNavStatus = {
	Section: "MainMenu",
	QuestN: -1,
	ActivityN: -1
};

/* variabile usata per i salvataggi temporanei del JSON su cui l'utente sta lavorando */
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

/**
 * Funzione da evolvere poi in una procedura di errore - che magari resetta l'applicazione
 */
function printError() {
	window.alert( "!!! MAJOR ERROR !!!");
};


/**
 * @param SectionId
 * Ricarica le sezioni dell'editor la cui interfaccia cambia a seconda del lavoro svolto dall'utente
 */
function loadSection( SectionId ) {
	/* TODO: mettere il comando di aggiornamento del nome della sezione */
	/* TODO: ricontrollare la correttezza delle procedure di creazione elementi */

	switch ( SectionId ) {
		case "EditStory":
			$( "#QuestList ul" ).empty();

			for ( i = 0; i < CurrentWork.quests.length; i++ ) {
				let NewButton = $( "<button/>",
				{
					class: "btn btn-secondary btn-lg StageButton GoToStage",
					onclick: "editQuest(" + String( i ) + ");",
					text: "Quest" + String( i ),
				}).wrap( "<li></li>" );

				$( "#QuestList ul" ).append( NewButton );
			}

			let AddQuestButton = $( "<button/>",
				{
					class: "btn btn-secondary btn-lg StageButton AddStage",
					onclick: "toggleIndexInput();",
					text: "+"
				}).wrap( "<li></li>" );

			$( "#QuestList ul" ).append( AddQuestButton );
			break;
		case "EditQuest":
			$( "#ActivityList ul" ).empty();

			for ( i = 0; i < CurrentWork.quests[CurrentNavStatus.QuestN].activities.length; i++ ) {
				/* probabilmente non è correttissimo e infatti funziona male  */
				let NewButton = $( "<button/>",
				{
					class: "btn btn-secondary btn-lg StageButton GoToStage",
					onclick: "editActivity(" + String( i ) + ");",
					text: "Activity" + String( i ),
				}).wrap( "<li></li>" );

				$( "#ActivityList ul" ).append( NewButton );
			}

			let AddActivityButton = $( "<button/>",
				{
					class: "btn btn-secondary btn-lg StageButton AddStage",
					onclick: "toggleIndexInput();",
					text: "+"
				}).wrap( "<li></li>" );

			$( "#ActivityList ul" ).append( AddActivityButton );
			break;
		default:
			printError();
			break;
	}
};


/**
 * @param newSectionId
 * Fa scomparire la sezione corrente e, appena l'animazione è finita, fa comparire quella nuova indicata
 */
function goToSection( newSectionId ) {
	/* Reloading per le sezioni che ne necessitano */
	switch ( newSectionId ) {
		case "EditStory":
			loadSection( "EditStory" );
			break;
		case "EditQuest":
			loadSection( "EditQuest" );
			break;
		case "EditActivity":
			loadSection( "EditActivity" );
			break;
		default:
			break;
	}

    $( "#" + CurrentNavStatus.Section ).fadeOut( function() {
        $( "#" + newSectionId ).fadeIn(); 
    }
    );

    CurrentNavStatus.Section = newSectionId;
};


function promptSave() {
    /* TODO */
};


/**
 * Attiva il ritorno alla sezione precedente, eventualmente richiedendo un salvataggio
 */
function goBack() {
    // promptSave();

    goToSection( Parent[CurrentNavStatus.Section] );
};


/**
 * Inizializza un oggetto quest vuoto per il JSON
 */
function initQuest() {
	let EmptyQuest = {	
		quest_title: "",
		activities: []
	};

	return EmptyQuest;
};


/**
 * Inizializza un oggetto attività vuoto per il JSON
 */
function initActivity() {
	let EmptyActivity = {
		activity_html: "",
		right_answer: "",
		answer_score: "",
		ASK_EVAL: 0,
		expected_time: 0
	};

	return EmptyActivity;
};


/**
 * @param quest_n
 * Invia alla sezione di editing della quest specificata
 */
function editQuest( quest_n ) {
	CurrentNavStatus.QuestN = quest_n;
	CurrentNavStatus.ActivityN = -1;
	
	goToSection( "EditQuest" );
};


/**
 * @param WidgetId
 * Attiva il widget specificato, apposito per l'input di un testo
 * Viene inizializzato il testo di default, sulla base di ciò che era presente nel relativo campo del JSON
 */
function toggleTextInput( WidgetId ) {
	switch ( WidgetId ) {
		case "EditStoryTitle":
			if ( CurrentWork.story_title == "" ) {
				$( "#" + "StoryTitleInput" ).val( "MyStory" );
			}
			else {
				$( "#" + "StoryTitleInput" ).val( CurrentWork.story_title );
			}
		
			$( "#EditStoryTitle" ).modal( "toggle" );
			break;
		case "EditQuestTitle":
			if ( CurrentWork.quests[CurrentNavStatus.QuestN].quest_title == "" ) {
				$( "#" + "QuestTitleInput" ).val( "NewQuest" );
			}
			else {
				$( "#" + "QuestTitleInput" ).val( CurrentWork.quests[CurrentNavStatus.QuestN].quest_title );
			}
		
			$( "#EditQuestTitle" ).modal( "toggle" );
			break;
		default:
			printError();
			break;
	}
};


/**
 * Attiva il widget di inserimento dell'indice di una quest o attività.
 * Il tipo di oggetto da indicizzare viene detto sulla base dei valori attuali nel CurrentNavStatus
 */
function toggleIndexInput() {
	let UseLastIndex = $( "#UseLastIndex" );
	let SelectIndex = $( "#SelectIndex" );
	let IndexInput = $( "#IndexInput" );

	/* inizializzazione dei valori di default */
	UseLastIndex.prop( "checked", true );
	SelectIndex.prop( "checked", false );
	IndexInput.attr( "disabled", true );

	if ( CurrentNavStatus.QuestN < 0 ) {
		IndexInput.val( CurrentWork.quests.length );
		IndexInput.attr( "max", IndexInput.val() );
	}
	else {
		IndexInput.val( CurrentWork.quests[CurrentNavStatus.QuestN].activities.length );
		IndexInput.attr( "max", IndexInput.val() );
	}

	$( "#InsertStageIndex" ).modal( "toggle" );
};


/**
 * Inserisce una nuova quest/attività all'interno del JSON, sulla base dei dati inseriti dall'utente nel widget di inserimento indice
 */
function insertNewStage() {
	/* TODO: decidere cosa fare in seguito all'inserimento dello stage - mandare nella sua apposita sezione di editing? */
	let UseLastIndex = $( "#UseLastIndex" );
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
	}
	else {
		if ( UseLastIndex.prop( "checked" ) ) {
			ChosenIndex = CurrentWork.quests[CurrentNavStatus.QuestN].activities.length;
		}
		else {
			ChosenIndex = IndexInput.val();
		}

		CurrentWork.quests[CurrentNavStatus.QuestN].activities.splice( ChosenIndex, 0, initActivity() );
	}

	$( "#InsertStageIndex" ).modal( "hide" );

	loadSection( CurrentNavStatus.Section );
};


/**
 * @param field --> campo del JSON
 * @param value --> valore da assegnare al campo specificato
 * Aggiorna il campo del JSON con il suo valore
 */
function saveDataFragment( field, value ) {
	switch ( field ) {
		case "story_title":
			CurrentWork.story_title = value;
			break;
		case "settings":
			/* TODO */
			break;
		case "settings_form":
			/* TODO */
			break;
		case "quest_title":
			CurrentWork.quests[CurrentNavStatus.QuestN].quest_title = value;
			break;
		case "activity_html":
			CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_html = value;
			break;
		case "right_answer":
			CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].right_answer = value;
			break;
		case "answer_score":
			CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_score = value;
			break;
		case "ASK_EVAL":
			CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].ASK_EVAL = value;
			break;
		case "expected_time":
			CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].expected_time = value;
			break;
		case "stylesheet":
			/* TODO */
			break;
		case "score":
			/* TODO */
			break;
		default:
			printError();
			break;
	}

	printCurrentJson(); // debugging
};