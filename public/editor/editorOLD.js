/* -------------------------------- ROBA PER DEBUGGING ----------------------------------------- */

function sayHello() {
	window.alert('hello');
};

function printCurrentJson() {
	console.log( CurrentWork );
}


/* VECCHIE FUNZIONI ANCORA IN USO - DA SISTEMARE */

/**
 * Funzione da evolvere poi in una procedura di errore - che magari resetta l'applicazione
 */
function handleError() {
	window.alert( "!!! MAJOR ERROR !!!" );
};


function promptSave() {
    /* TODO */
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
					text: $( "#InsertAnswerFieldDescription" ).val().trim()
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