/* NOTA
Le uniche volte in cui dovrebbero avvenire comunicazioni col server sono:
* salvataggio su server
* apertura dell'explorer (per editare/pubblicare/ritirare una storia già esistente)
*/



var EditRemove = "<div class='EditRemove'><button type='button' class='btn btn-primary btn-sm' onclick=''>Modifica</button><button type='button' class='btn btn-danger btn-sm' onclick=''>Rimuovi</button></div>";


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


/**
 * @param EVENT
 * Attiva il warning specifico per l'evento segnalato
 */
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


/**
 * @param EVENT
 * Attiva la finestra di errore relativa all'evento segnalato
 */
function displayError( EVENT ) {
	/* TODO */
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
			loadSection( "EditAnswerField" );
		default:
			break;
	}

    $( "#" + CurrentNavStatus.Section ).fadeOut( function() {
        $( "#" + newSectionId ).fadeIn(); 
    }
    );

	CurrentNavStatus.Section = newSectionId;
};


/**
 * @param SectionId 
 * @param parameters --> parametri aggiuntivi
 * Funzione variadica che ricarica la sezione dell'editor specificata. Viene usata per le sezioni la cui interfaccia cambia a seconda di relativi parametri
 */
function loadSection( SectionId, ...parameters ) {
	/* TODO: mettere il comando di aggiornamento del nome della sezione */

	switch ( SectionId ) {
		case "EditStory":
			$( "#QuestList ul" ).empty();

			for ( i = 0; i < CurrentWork.quests.length; i++ ) {
				let NewButton = $( "<button/>",
				{
					"class": "btn btn-secondary btn-lg StageButton GoToStage",
					onclick: "editQuest(" + String( i ) + ");",
					text: "Quest" + String( i ),
				}).wrap( "<li></li>" );

				$( "#QuestList ul" ).append( NewButton );
			}

			let AddQuestButton = $( "<button/>",
				{
					"class": "btn btn-secondary btn-lg StageButton AddStage",
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
					"class": "btn btn-secondary btn-lg StageButton GoToStage",
					onclick: "editActivity(" + String( i ) + ");",
					text: "Activity" + String( i ),
				}).wrap( "<li></li>" );

				$( "#ActivityList ul" ).append( NewButton );
			}

			let AddActivityButton = $( "<button/>",
				{
					"class": "btn btn-secondary btn-lg StageButton AddStage",
					onclick: "toggleIndexInput();",
					text: "+"
				}).wrap( "<li></li>" );

			$( "#ActivityList ul" ).append( AddActivityButton );
			break;
		case "EditActivity":
			// TODO modificare solo il nome della sezione
			break;
		case "EditAnswerField":
			// TODO modificare nome della sezione
			if ( CurrentNavStatus.Section == "EditActivity" ) {
				if ( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field != "" ) {
					loadEditAnswerFieldSection( "LOAD" );
				}
				else {
					loadEditAnswerFieldSection( "RESET" );
				}
			}
			else
				loadEditAnswerFieldSection( "CHG_TYPE" );
			break;
		case "EditActivityText":
			$( "#ParagraphList ul" ).empty();

			let oldtext = $( $.parseHTML( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text ) );

			for ( i = 0; i < oldtext.children().length; i++ ) {
				let NewButton = $( "<button/>",
				{
					"class": "btn btn-secondary btn-lg ParagraphButton",
					"data-toggle": "popover"
				});

				let twinbuttons = $( $.parseHTML( EditRemove ) );
				$( twinbuttons.children()[0] ).attr( "onclick", "editParagraph(" + String( i ) + ");" );
				$( twinbuttons.children()[1] ).attr( "onclick", "removeParagraph(" + String( i ) + ");" );

				NewButton.popover({
					placement: "bottom",
					html: true,
					content: twinbuttons,
					trigger: "focus"
				});

				if ( oldtext.children()[i].tagName == "P" ) {
					NewButton.addClass( "TextParBtn" );
					if ( $( oldtext.children()[i] ).text().substr( 0, 10 ) != "" )
						NewButton.html( $( oldtext.children()[i] ).text().substr( 0, 10 ) );
					else
						NewButton.html( "[empty]" );
				}
				else if ( oldtext.children()[i].tagName == "DIV" ) {
					NewButton.addClass( "ImgGalleryBtn" );
					NewButton.html( "IMG<br>Gallery" );
				}

				$( "#ParagraphList ul" ).append( NewButton.wrap( "<li></li>" ) );
			}
			break;
		default:
			handleError();
			break;
	}

	$('[data-toggle="popover"]').popover();
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
 * @param Container
 * Aggiunge un elemento lista con un relativo radio input al Container specificato
 */
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
				val: "Opzione" + String( $( "#AnswerInput li" ).length )
			}));
			$( "#AnswerInput" ).append( newli );
			break;
		default:
			break;
	}
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
	let IndexInput = $( "#IndexInput" );

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
	let ChosenIndex = $( "#IndexInput" ).val();

	if ( CurrentNavStatus.QuestN < 0 ) {
		CurrentWork.quests.splice( ChosenIndex, 0, initQuest() );
	}
	else {
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





function toggleParagraphInput() {
	$( "#addTextPar" ).prop( "checked", true );
	$( "#addGallery" ).prop( "checked", false );
	$( "#ParagraphIndexInput" ).val( $( $.parseHTML( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text ) ).children().length );
	$( "#ParagraphIndexInput" ).attr( "max", $( "#ParagraphIndexInput" ).val() );
	$( "#InsertParagraph" ).modal( "toggle" );
};


function insertNewParagraph() {
	let newpar;

	if ( $( "#addTextPar" ).prop( "checked" ) ) {
		newpar = "<p class='TextParagraph'></p>";
	}
	else {
		newpar = `
		<div id="Q0A1_Carousel" class="carousel slide ImgGallery" data-ride="carousel">
		<div class="carousel-inner">
		</div>
		<a class="carousel-control-prev" href="#Q0A1_Carousel" role="button" data-slide="prev">
			<span class="carousel-control-prev-icon" aria-hidden="true"></span>
			<span class="sr-only">Previous</span>
		  </a>
		  <a class="carousel-control-next" href="#Q0A1_Carousel" role="button" data-slide="next">
			<span class="carousel-control-next-icon" aria-hidden="true"></span>
			<span class="sr-only">Next</span>
		  </a>
		</div>`;
	}
	
	saveDataFragment( "activity_text", newpar, "ADD", $( "#ParagraphIndexInput" ).val() );
	$( "#InsertParagraph" ).modal( "hide" );
	loadSection( CurrentNavStatus.Section );
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
			let text = $( $.parseHTML( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text ) ); // testo da modificare
			let i = saveDataFragment.arguments[3]; // indice dell'elemento da manipolare
			switch ( saveDataFragment.arguments[2] ) {
				case "ADD":
					if ( i == 0 )
						text.prepend( $.parseHTML( saveDataFragment.arguments[1] ) );
					else {
						$( $.parseHTML( saveDataFragment.arguments[1] )).insertAfter( text.children()[i-1] );
					}
					CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text = text.prop( "outerHTML" );
					break;
				case "UPDATE":
					//
					break;
				case "DEL":
					//
					break;
				default:
					handleError();
					break;
			}
			console.log(CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text = text.prop( "outerHTML" )); // debugging
			break;
		case "answer_field":
			let AnswerField = $( "<div/>",
			{
				"class": "AnswerField",
				id: "AnswerField"
			});
			AnswerField.prepend( $( "<div/>",
				{
					"class": "AnswerFieldDescription",
					id: "AnswerFieldDescription",
					text: $( "#InsertAnswerFieldDescription" ).val()
				}));
			AnswerField.append( $( "#AnswerInput" ));
			
			CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field = AnswerField.prop( "outerHTML" );
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
		case "GET_CHRONO":
			CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].GET_CHRONO = value;
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