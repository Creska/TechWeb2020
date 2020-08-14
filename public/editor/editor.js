/* NOTA
Le uniche volte in cui dovrebbero avvenire comunicazioni col server sono:
* salvataggio su server
* apertura dell'explorer (per editare/pubblicare/ritirare una storia già esistente)
*/

/* indica, per ogni sezione, quella genitore - gli identificatori sono gli id html */
var Parent = {
	MainMenu: "MainMenu",
	ChooseGameMode: "MainMenu",
    ChooseAccessibility: "ChooseGameMode",
    EditStory: "MainMenu",
	EditQuest: "EditStory",
	EditActivity: "EditQuest",
	EditAnswerField: "EditActivity"
};

/* indica la sezione dell'editor dove l'utente si trova attualmente e la quest/attività su cui sta lavorando */
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
	game_mode: "",
	quests: [],
	stylesheet: "",
	score: []
};


/* -------------------------------- ROBA PER DEBUGGING ----------------------------------------- */

function sayHello() {
	window.alert('hello');
};

function printCurrentJson() {
	console.log( CurrentWork );
}



/* --------------------------------------------------------------------------------------------- */

/**
 * Funzione da evolvere poi in una procedura di errore - che magari resetta l'applicazione
 */
function handleError() {
	window.alert( "!!! MAJOR ERROR !!!" );
};


function displayWarning( EVENT ) {
	switch ( EVENT ) {
		case MISSING_RIGHT_ANSWER:
			$( "#AnswerFieldSettings" ).append( $( "<div/>",
			{
				"class": "alert alert-warning EditorWarning",
				role: "alert",
				id: "MissingRightAnswerWarning",
				text: "Attenzione! Manca la risposta corretta."
			}));
			break;
	}
};


function displayError( EVENT ) {
	/* TODO */
};


/**
 * @param SectionId
 * Ricarica le sezioni dell'editor la cui interfaccia cambia a seconda del lavoro svolto dall'utente
 */
function loadSection( SectionId ) {
	/* TODO: mettere il comando di aggiornamento del nome della sezione */

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
		case "EditActivity":
			// TODO, modificare solo il nome della sezione
			break;
		default:
			handleError();
			break;
	}
};



function loadEditAnswerFieldSection( RESET ) {
	/* TODO - aggiungere aggiornamento del nome della sezione */

	if ( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field != "" ) {
		let LoadAnswerField = $.parseHTML( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field );
		switch ( $( LoadAnswerField.eq( 1 ) ).prop( "tagName" ) ) {
			case "ul":
				$( "#QuestionType_Checklist" ).prop( "checked", true );
				break;
			case "input":
				if ( $( "#QuestionType_Checklist" ).attr( "type" ) == "text" ) {
					$( "#QuestionType_Text" ).prop( "checked", true );
				}
				else if ( $( "#QuestionType_Checklist" ).attr( "type" ) == "number" ) {
					$( "#QuestionType_Number" ).prop( "checked", true );
				}
				else handleError();
				break;
			default:
				handleError();
				break;
		}
	}
	else {
		if ( RESET ) {
			$( "#QuestionType_Checklist" ).prop( "checked", false );
			$( "#QuestionType_Text" ).prop( "checked", false );
			$( "#QuestionType_Number" ).prop( "checked", false );
	
			$( "#AnswerTimer" ).val( 0.5 );
			$( "#AnswerScore" ).val( 0 );
			$( "#NeedEvaluation" ).prop( "checked", false );
			$( "#MissingRightAnswerWarning" ).remove();
			$( "#AnswerFieldPreview" ).empty();
		}
		else {
			buildAnswerFieldPreview();
		}

		$( "#InsertAnswerFieldDescription" ).val( "" );
	}
}; 


function buildAnswerFieldPreview() {
	$( "#AnswerFieldPreview" ).empty();

	if ( $( "#QuestionType_Checklist" ).prop( "checked" ) ) {
		$( "#AnswerFieldPreview" ).prepend( $( "<ul/>",
		{
			"class": "AnswerInput",
			id: "AnswerInput"
		}));

		for ( i = 0; i < 2; i++ ) {
			addRadio( "AnswerInput" );
		}

		$( "#AnswerFieldPreview" ).append( $( "<button/>",
		{
			"class": "btn btn-secondary AddRadio",
			onclick: "addRadio('AnswerInput');",
			text: "+"
		}));
	}
	else if ( $( "#QuestionType_Text" ).prop( "checked" ) ) {
		$( "#AnswerFieldPreview" ).prepend( $( "<input/>",
		{
			type: "text",
			"class": "AnswerInput",
			id: "AnswerInput",
			placeholder: "Risposta"
		}));
	}
	else if ( $( "#QuestionType_Number" ).prop( "checked" ) ) {
		$( "#AnswerFieldPreview" ).prepend( $( "<input/>",
		{
			type: "number",
			"class": "AnswerInput",
			id: "AnswerInput",
			val: "0"
		}));
	}
};



function addRadio( Container ) {
	let newButton = $( "<input/>",
	{
		type: "radio"
	});

	let newli = $( "<li/>", {});

	switch ( Container ) {
		case "AnswerInput":
			newButton.attr( "name", "AnswerInputGroup" );
			newButton.attr( "id", "AnswerOption" + String( $( "#AnswerInput li" ).length ) );
			newli.append( newButton );
			newli.append( $( "<input/>",
			{
				type: "text",
				placeholder: "Opzione" + String( $( "#AnswerInput li" ).length )
			}));
			$( "#AnswerInput" ).append( newli );
			break;
		default:
			break;
	}
};



function saveRightAnswer() {
	if ( $( "#QuestionType_Checklist" ).prop( "checked" ) ) {
		$( "#AnswerFieldPreview [type='radio']" ).each( function( index ) {
			if ( $( this ).prop( "checked" ) ) {
				saveDataFragment( "right_answer", $( this ).next().val() );
				return;
			}
		});
	}
	else {
		saveDataFragment( "right_answer", $( "#AnswerFieldPreview input" ).val() );
	}
}

function saveAnswerFieldSettings() {
	/* Questa parte andrebbe corretta ma forse non vale comunque la pena di metterla

	if ( $( "#NeedEvaluation" ).prop( "checked" ) == false ) {
		if ( $( "#AnswerInput" ).prop( "tagName" ) == "input" ) {
			if ( $( "#AnswerInput" ).val() == "" ) {
				displayWarning( MISSING_RIGHT_ANSWER );
			}
		}
		else if ( $( "#AnswerInput" ).prop( "tagName" ) == "ul" ) {
			let Found = false;
			$( "#AnswerInput radio" ).each( function( index ) {
				if ( $( this ).prop( "checked" ) == true ) {
					Found = true;
				}
			});

			if ( !Found ) {
				displayWarning( MISSING_RIGHT_ANSWER );
			}
		}
	}

	*/

	saveRightAnswer();

	if ( $( "#QuestionType_Checklist" ).prop( "checked" ) ) {
		let InputLabel;
		$( "#AnswerFieldPreview [type='text']" ).each( function( index ) {
			InputLabel = $( "<label/>",
			{
				for: "AnswerOption" + String( index )
			});

			if ( $( this ).val() == "" ) {
				InputLabel.text( "[empty]" );
			}
			else {
				InputLabel.text( $( this ).val() );
			}

			$( this ).replaceWith( InputLabel );
		});

		$( "#AnswerFieldPreview .AddRadio" ).remove();
	}
	
	saveDataFragment( "answer_field", "none" );
	saveDataFragment( "expected_time", $( "#AnswerTimer" ).val() * 60000 );
	saveDataFragment( "answer_score", $( "#AnswerScore" ).val() );
	saveDataFragment( "ASK_EVAL", $( "#NeedEvaluation" ).prop( "checked" ) );

	goBack();
};


/**
 * @param newSectionId
 * Fa scomparire la sezione corrente e, appena l'animazione è finita, fa comparire quella nuova indicata
 */
function goToSection( newSectionId ) {
	/* Reloading per le sezioni che ne necessitano */
	switch ( newSectionId ) {
		case "EditStory":
			CurrentNavStatus.QuestN = -1;
			CurrentNavStatus.ActivityN = -1;
			loadSection( "EditStory" );
			break;
		case "EditQuest":
			CurrentNavStatus.ActivityN = -1;
			loadSection( "EditQuest" );
			break;
		case "EditActivity":
			loadSection( "EditActivity" );
			break;
		case "EditAnswerField":
			loadEditAnswerFieldSection( true );
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
		activity_text: "",
		answer_field: "",
		right_answer: "",
		answer_score: "",
		answer_outcome: "",
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
 * @param activity_n
 * Invia alla sezione di editing dell'attività specificata - ovviamente facente parte della quest corrente
 */
function editActivity( activity_n ) {
	CurrentNavStatus.ActivityN = activity_n;
	goToSection( "EditActivity" );
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
			handleError();
			break;
	}
};


/**
 * Attiva il widget di inserimento dell'indice di una quest o attività.
 * Il tipo di oggetto da indicizzare viene dedotto sulla base dei valori attuali nel CurrentNavStatus
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
 * Cancella l'attività o la quest specificata. Il tipo di oggetto da eliminare viene dedotto dai dati in CurrentNavStatus
 */
function removeSelectedStage() {
	if ( CurrentNavStatus.ActivityN < 0 ) {
		CurrentWork.quests.splice( CurrentNavStatus.QuestN, 1 );
	}
	else {
		CurrentWork.quests[CurrentNavStatus.QuestN].activities.splice( CurrentNavStatus.ActivityN, 1 );
	}

	$( "#RemoveStage" ).modal( "hide" );

	goBack();
};


/**
 * @param field --> campo del JSON
 * @param value --> valore da assegnare al campo specificato
 * Aggiorna il campo del JSON con il suo valore - inserendolo eventualmente in un'apposita struttura HTML (ovvero tag + id e classe)
 */
function saveDataFragment( field, value ) {
	switch ( field ) {
		case "story_title":
			let NewStoryTitle = $( "<div/>",
			{
				id: "StoryTitle",
				text: value
			});
			CurrentWork.story_title = NewStoryTitle.prop( "outerHTML" );
			break;
		case "story_ID":
			CurrentWork.story_ID = value;
			break;
		case "game_mode":
			/* TODO */
			break;
		case "quest_title":
			let NewQuestTitle = $( "<div/>",
			{
				"class": "QuestTitle",
				id: "QuestTitle",
				text: value
			});
			CurrentWork.quests[CurrentNavStatus.QuestN].quest_title = NewQuestTitle.prop( "outerHTML" );
			break;
		case "activity_text":
			let NewActivityText = $( "<div/>",{
				"class": "ActivityText",
				id: "ActivityText",
				text: value
			});
			CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text = NewActivityText.prop( "outerHTML" );
			break;
		case "answer_field":
			$( "#AnswerFieldPreview" ).prepend( $( "<div/>",
				{
					"class": "AnswerFieldDescription",
					text: $( "#InsertAnswerFieldDescription" ).val()
				}));
			$( "#AnswerFieldPreview" ).attr( "class", "AnswerField" );
			
			CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field = $( ".AnswerField" ).prop( "outerHTML" );
			console.log(CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field); // debugging
			break;
		case "right_answer":
			CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].right_answer = value;
			break;
		case "answer_score":
			CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_score = value;
			break;
		case "answer_outcome":
			/* TODO */
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
			handleError();
			break;
	}
};


/* ROBA DA FARE
scomporre la loadSection in varie funzioni di load. sarà più semplice fare una gestione corretta
*/