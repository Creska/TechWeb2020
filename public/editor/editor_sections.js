var gm_b = [ false, false, false, false, false ]; // se gm_b[0] è true --> #gm0 è selezionato 

/* -------------------------------- ROBA PER DEBUGGING ----------------------------------------- */

function sayHello() {
	window.alert('hello');
};

function printCurrentJson() {
	console.log( CurrentWork );
}


/* -------------------------- PROCEDURE ---------------- */
/**
 * @param i --> indice del pulsante selezionato
 * Deseleziona tutte le opzioni diverse dal pulsante di indice i
 */
function deselect_other_options( i ) {
	if ( i < 3 ) {
		for ( y = 0; y < 3; y++ ) {
			if ( y != i ) {
				change_color_option( "#gm" + y, "bg-primary", "bg-secondary" );
	  			gm_b[y] = false;
			}
		}
	}
	else {
		for ( y = 3; y < 5; y++ ) {
			if ( y != i ) {
				change_color_option( "#gm" + y, "bg-primary", "bg-secondary" );
	  			gm_b[y] = false;
			}
		}
	}
};

  
/**
* @param i --> numero del pulsante
* Seleziona il pulsante con indice i e deseleziona tutti gli altri
*/
function select( i ) {
	gm_b[i] = !gm_b[i];
  
	if( gm_b[i] ) {
	  change_color_option( "#gm" + i, "bg-secondary", "bg-primary" );
	  deselect_other_options( i );

	  switch (i) {
		case 0:
		  $( "#PlayersN" ).fadeOut();
		  $( "#PlayersN input" ).val( "" );
		  break;
		case 1:
		case 2:
		  $( "#PlayersN" ).fadeIn();
		  $( "#PlayersN input" ).val( "" );
	  }
	}
	else {
		change_color_option( "#gm" + i, "bg-primary", "bg-secondary" );
		if ( i < 3 )
			$( "#PlayersN" ).fadeOut();
	}
};


/**
 * Carica, in base ai dati nel json, la sezione di modifica della Game Mode
 */
function loadGameModeSection() {
	gm_b = [ false, false, false, false, false ];

	switch ( CurrentWork.game_mode ) {
		case "SINGLE":
			select(0);
			break;
		case "GROUP":
			select(1);
			if ( CurrentWork.players )
				$( "#PlayersN input" ).val( CurrentWork.players );
			break;
		case "CLASS":
			select(2);
			if ( CurrentWork.players )
				$( "#PlayersN input" ).val( CurrentWork.players );
			break;
		default:
			$( "#ChooseGameMode .card-deck .card" ).removeClass( "bg-primary" );
			$( "#ChooseGameMode .card-deck .card" ).addClass( "bg-secondary" );
			$( "#PlayersN input" ).val( "" );
	}

	if ( CurrentWork.ACCESSIBILITY )
		select(3);
	else
		select(4);
};


/**
 * Salva nel json le modifiche effettuate alla Game Mode
 */
function saveGameModeSettings() {
	if ( gm_b[0] )
		CurrentWork.game_mode = "SINGLE";
	else if ( gm_b[1] ) {
		CurrentWork.game_mode = "GROUP";
		if ( $( "#PlayersN input" ).first().val() )
			CurrentWork.players = $( "#PlayersN input" ).first().val();
	}
	else if ( gm_b[2] ) {
		CurrentWork.game_mode = "CLASS";
		if ( $( "#PlayersN input" ).first().val() )
			CurrentWork.players = $( "#PlayersN input" ).first().val();
	}
	else
		CurrentWork.game_mode = "";

	if ( gm_b[3] )
		CurrentWork.ACCESSIBILITY = true;
	else
		CurrentWork.ACCESSIBILITY = false;

	back();
};


/**
 * Apre (o chiude) il widget per l'impostazione della tipologia di attività
 */
function openActivityTypeWidget() {
	if ( $( "#ChooseActivityType" ).css( "display" ) == "none" ) {
		if ( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_type == "READING" ) {
			if ( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].FINAL )
				$( "#ActivityType2" ).prop( "checked", true );
			else
				$( "#ActivityType1" ).prop( "checked", true );
		}
		else
			$( "#ActivityType0" ).prop( "checked", true );

		$( "#ChooseActivityType" ).fadeIn();
	}
	else
		$( "#ChooseActivityType" ).fadeOut();
};


/**
 * Imposta la tipologia di attività, in base alla scelta effettuata
 */
function setActivityType() {
	switch ( $( "#ChooseActivityType input[type=radio]:checked" ).attr("id") ) {
		case "ActivityType0":
			if ( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_type != "ANSWER" ) {
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome = [];
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_type = "ANSWER";
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].FINAL = false;
				$( "#EditActivity .p-3" ).first().find( "button:not(:first-child)" ).attr( "disabled", false );
			}
			break;
		case "ActivityType1":
			if ( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_type != "READING" ) {
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome = [];
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_type = "READING";
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].FINAL = false;
				$( "#EditActivity .p-3" ).first().find( "button:nth-child(2)" ).attr( "disabled", true );
				$( "#EditActivity .p-3" ).first().find( "button:nth-child(3)" ).attr( "disabled", false );
			}
			break;
		case "ActivityType2":
			if ( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].FINAL == false ) {
				// segna tutte le altre attività come non finali
				CurrentWork.quests.forEach( function( q, i ) {
					q.activities.forEach( function( a, j ) {
				  		a.FINAL = false;
					});
			  	});
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_type = "READING";
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].FINAL = true;
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome = [];
				$( "#EditActivity .p-3" ).first().find( "button:not(:first-child)" ).attr( "disabled", true );
			}
	}

	$( "#ChooseActivityType" ).fadeOut();
};


/**
 * Carica la sezione e i parametri in base ai dati salvati nel json
 */
function loadEditAnswerFieldSection() {
	let activity = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];

	$( "#ChecklistPreview ul" ).empty();

	switch ( activity.answer_field.type ) {
		case "checklist":
			$( "#QuestionType_Checklist" ).prop("checked", true);

			$.each( activity.answer_field.options, function( index, value ) {
				addAnswerOption( value );
			});
	
			$( "#ChecklistPreview" ).toggle(true);
			break;
		case "text":
			$( "#QuestionType_Text" ).prop("checked", true);
			$( "#ChecklistPreview" ).toggle(false);
			break;
		case "number":
			$( "#QuestionType_Number" ).prop("checked", true);
			$( "#ChecklistPreview" ).toggle(false);
			break;
		case "date":
			$( "#QuestionType_Date" ).prop("checked", true);
			$( "#ChecklistPreview" ).toggle(false);
			break;
		case "time":
			$( "#QuestionType_Time" ).prop("checked", true);
			$( "#ChecklistPreview" ).toggle(false);
			break;
		default:
			$( "#AFtype input[name=QuestionType]" ).prop("checked", false);
			$( "#ChecklistPreview" ).toggle(false);
	}

	$("InsertAnswerFieldDescription").val( activity.answer_field.description );

	$( "#AnswerTimer" ).val( activity.expected_time / 60000 );
	$( "#AnswerScore" ).val( activity.answer_score );
	$( "#InsertTimer" ).prop( "checked", activity.GET_CHRONO );
	if ( $( "#InsertTimer" ).prop( "checked" ) )
		$( "#AnswerTimer" ).prop( "disabled", false );
	else
		$( "#AnswerTimer" ).prop( "disabled", true );
	$( "#NeedEvaluation" ).prop( "checked", activity.ASK_EVAL );
};


/**
 * @param option
 * Aggiunge option all'elenco delle risposte della checklist
 */
function addAnswerOption( option ) {
	/* anche se non è un metodo perfetto, return false cancella il link ad href */
	option = option.replace(/(<([^>]+)>)/gi, "");

	if ( option && option != "default" )
		$("#ChecklistPreview ul").append( $( "<li>" + "<span>" + option + "</span><a class='badge badge-danger ml-3' href='#' onclick='$(this).parent().remove(); return false;'><i class='fas fa-minus'></i></a></li>" ) );

	$("#AddAnswerOption input").val("");
};


/**
 * Salva tutte le personalizzazioni che l'utente ha creato per il Campo risposta
 */
function saveAnswerFieldSettings() {
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field.description = $( "#InsertAnswerFieldDescription" ).val().trim().replace(/(<([^>]+)>)/gi, "");
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field.options = [];

	let new_type = $( "#AFtype input[name=QuestionType]:checked" );
	if ( new_type ) {
		switch ( new_type.attr("id") ) {
			case "QuestionType_Checklist":
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field.type = "checklist";
				$("#ChecklistPreview ul li").each( function() {
					CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field.options.push( $(this).find("span").first().text() );
				});
				break;
			case "QuestionType_Text":
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field.type = "text";
				break;
			case "QuestionType_Number":
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field.type = "number";
				break;
			case "QuestionType_Date":
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field.type = "date";
				break;
			case "QuestionType_Time":
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field.type = "time";
		}

		if ( new_type.attr("id") != CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field.type )
			CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome = [];
	}
	
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].expected_time = $( "#AnswerTimer" ).val() * 60000;
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].GET_CHRONO = $( "#InsertTimer" ).prop( "checked" );
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].ASK_EVAL = $( "#NeedEvaluation" ).prop( "checked" );

	back();
};


/**
 * Carica la sezione ed i parametri in base ai dati salvati nel json. Aggiunge eventuali alert nel caso sia scelta l'opzione di attività interattiva ma mancano i requisiti per farlo funzionare (ovvero: spuntata l'opzione di richiesta valutazione, oppure answer field incompleto)
 */
function loadEditOutcomeSection() {
	let CurrentStage = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];

  	/* aggiunta di eventuali alert */
  	$( "#SetAnswerOutcome .alert" ).remove();

	let OutcomeAlert;

  	if ( CurrentStage.ASK_EVAL ) {
		OutcomeAlert = $( `<div class="col-xs-12 alert alert-warning text-justify" role="alert"><i class="fas fa-exclamation-triangle"></i></div>` );
    	OutcomeAlert.append( $("<p>Per questa attività è stata richiesta la valutazione in tempo reale.\nEventuali outcomes inseriti non saranno quindi presi in considerazione dall'applicazione Player.</p>") );
    	$( "#AnswerActivity" ).prepend( OutcomeAlert );
  	}
  	else {
    	if ( $.isEmptyObject( CurrentStage.answer_field ) || CurrentStage.answer_field.type == "" || ( CurrentStage.answer_field.type == "checklist" && CurrentStage.answer_field.options.length < 2 ) ) {
			OutcomeAlert = $( `<div class="col-xs-12 alert alert-danger text-justify" role="alert"><i class="fas fa-exclamation-circle"></i></div>` );
			OutcomeAlert.append( $("<p>Campo risposta incompleto</p>") );
			$( "#AnswerActivity" ).prepend( OutcomeAlert );
    	}
	}

	/* preparazione della tabella e caricamento di eventuali dati presenti nel JSON */
	if ( CurrentStage.activity_type == 'READING' ) {
		$( "#AnswerActivity" ).toggle(false);
		$( "#ReadingActivity" ).toggle(true);
		
		if ( CurrentStage.answer_outcome.length && CurrentStage.answer_outcome[0].response == "default" ) {
			$( "#ReadingActivity .OutcomesTable tr:nth-child(2) :input[type='checkbox']" ).prop( "checked", CurrentStage.answer_outcome[0].nextquest );
			$( "#ReadingActivity .OutcomesTable tr:nth-child(2) :input[type='number']" ).attr( "disabled", CurrentStage.answer_outcome[0].nextquest );
			$( "#ReadingActivity .OutcomesTable tr:nth-child(2) :input[type='number']" ).val( CurrentStage.answer_outcome[0].nextactivity );
		}
		else {
			$( "#ReadingActivity .OutcomesTable input[type=checkbox]" ).prop( "checked", false );
			$( "#ReadingActivity .OutcomesTable input[type=number]" ).attr( "disabled", false );
			$( "#ReadingActivity .OutcomesTable input[type=number]" ).val( "" );
		}
	}
	else {
		$( "#AnswerActivity" ).toggle(true);
		$( "#ReadingActivity" ).toggle(false);

		$( "#AnswerActivity .OutcomesTable tr:nth-child(n+3)" ).remove();
		$( "#AnswerActivity .OutcomesTable input[type=checkbox]" ).prop( "checked", false );
		$( "#AnswerActivity .OutcomesTable .NextActivityInput" ).attr( "disabled", false );
		$( "#AnswerActivity .OutcomesTable input[type=number]" ).val( "" );

		let tr;

		$.each( CurrentStage.answer_outcome, function(index, value) {
			if ( value.response == "default" ) {
				tr = $( "#AnswerActivity .OutcomesTable tr:nth-child(2)" )
			}
			else {
				addOutcome( value.response );
				tr = $( "#AnswerActivity .OutcomesTable tr:last-child" );
			}

			tr.find("input[type=checkbox]").prop( "checked", value.nextquest );
			tr.find(".NextActivityInput").attr( "disabled", value.nextquest );
			tr.find(".NextActivityInput").val( value.nextactivity );
			tr.find(".ScoreInput").val( value.score );
		}); 
	}

	/* sistemazione del widget di inserimento outcome */
	$( "#AddOutcomeWidget .OutcomeInput" ).remove();
	if ( $( "#SetAnswerOutcome .alert-danger" ).length < 1 ) {
		if ( CurrentStage.answer_field.type == "checklist" ) {
			$( "#AddOutcomeWidget > p" ).after( $( "<ul class='OutcomeInput'></ul>" ) );
			let newli;

			$.each( CurrentStage.answer_field.options, function(index, value) {
				newli = $( "<li class='form-check'></li>" );
				newli.append( $( "<input/>",
					{
						class: "form-check-input",
						type: "radio",
						name: "radio-checklist",
						id: "opt" + index
					}));
				newli.append( $( "<label/>",
					{
						class: "form-check-label",
						for: "opt" + index,
						text: value
					}));
				$( "#AddOutcomeWidget ul" ).append( newli );
			});
		}
		else {
			$( "#AddOutcomeWidget > p" ).after( $( "<input/>", 
			{
				class: "OutcomeInput",
				type: CurrentStage.answer_field.type
			}));
		}

		$( "#AddOutcomeWidget" ).toggle(true);
	}
	else {
		$( "#AddOutcomeWidget" ).toggle(false);
	}
};


/**
 * @param label
 * Aggiunge un outcome alla tabella. In fase di loading dei salvataggi del JSON, all'argomento 'label' corrisponde la risposta settata per quel particolare outcome
 */
function addOutcome( label ) {
	if ( label == undefined ) {
		if ( $( "#AddOutcomeWidget input" ).first().attr("type") == "radio" && $( "#AddOutcomeWidget input[type=radio]:checked" ) )
			label = $( "#AddOutcomeWidget input[type=radio]:checked" ).first().next().text();
		else
			label = $( "#AddOutcomeWidget input" ).val();
	
		label = label.replace(/(<([^>]+)>)/gi, ""); // rimuove tags html
	}

	if ( label && label != "default" ) {
		let newtr = $( "<tr/>" );
  		newtr.append( $.parseHTML( "<td>" + label + "</td>" ) );
  		newtr.append( $.parseHTML( '<td><input type="checkbox"></td>' ) );
  		newtr.append( ( $( "<input/>",
  		{
			type: "number",
			class: "NextActivityInput",
			placeholder: 0,
			size: 6,
    		min: 0
		})).wrap( "<td></td>" ).parent());
		newtr.append( ( $( "<input/>",
  		{
			type: "number",
			class: "ScoreInput",
			placeholder: 0,
			size: 6
		})).wrap( "<td></td>" ).parent());
  		newtr.append( $.parseHTML( `<td><a class='badge badge-danger ml-3' href='#' onclick='$(this).parent().parent().remove(); return false;'><i class='fas fa-minus'></i></a></td>` ) );
  		$( "#AnswerActivity .OutcomesTable" ).append( newtr );
	}
};


/**
 * Salva nel JSON tutti gli outcomes settati dall'autore e la tipologia di attività
*/
function saveOutcomes() {
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome = [];

	if ( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_type == 'READING' ) {
		CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome.push({
			response: "default",
			nextquest: $("#ReadingActivity .OutcomesTable input[type=checkbox]").eq(0).prop( "checked" ),
			nextactivity: $("#ReadingActivity .OutcomesTable input[type=number]").eq(0).val()
		})
	}
	else {
		let response_name;

		$( "#AnswerActivity .OutcomesTable tr:nth-child(n+2)" ).each( function() {
			if ( $(this).children().first().attr("id") )
				response_name = "default";
			else
				response_name = $(this).children().first().text();

			CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome.push({
				response: response_name,
				nextquest: $(this).find("input[type=checkbox]").first().prop( "checked" ),
				nextactivity: $(this).find(".NextActivityInput").first().val(),
				score: $(this).find(".ScoreInput").first().val(),
			});
		});
	}	
  
  	// console.log(CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome); // debugging
  	back();
};


/**
 * Salva il paragrafo di testo inserito ed inserisce, nella rispettiva card, una sottostringa come anteprima
 */
function saveTextParagraph() {
  let text = $('#TextParInput').val().trim().replace(/(<([^>]+)>)/gi, "");

  CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN].content = text;
  if (text)
    $("#ParagraphsGrid").find(".card-text").eq( CurrentNavStatus.TextPartN ).html( text.substring(0, 25) + "..." );
  else
	$("#ParagraphsGrid").find(".card-text").eq( CurrentNavStatus.TextPartN ).html( "[vuoto]" );
	
  saveCardGrids();
  back()
};


/**
 * @param img
 * Aggiunge l'immagine specificata alla galleria di anteprima
 */
function addImage( img ) {
	let newpreview = $( "<img>" );

	if ( img.server ) {
		newpreview.attr( "src", img.src );
	}
	else {
		let reader = new FileReader();
    	reader.readAsDataURL( img.src );
    	reader.addEventListener( "load", function() {
      		newpreview.attr( "src", this.result );
    	});
	}
		
	let newrow = $( "<div class='row'></div>" )
	newrow.append( newpreview );
	newrow.append( $( "<input type='text' placeholder='Descrizione'></input>"));
	newrow.find( "input" ).val( img.alt );
  	newrow.append( $( '<button class="btn btn-danger" onclick="rmImage( $(this) );"><i class="fas fa-minus"></i></button>' ));
  	newrow.children().wrap( "<div class='col-sm'></div>" );
  	$( "#GalleryPreview" ).append( newrow );
};


/**
 * @param img
 * Elimina dall'anteprima l'immagine specificata come argomento. In realtà, quello passato come parametro, è il tasto di eliminazione. In ogni caso, ne si ricava comunque la riga di tabella corrispondente all'immagine da cancellare
 */
function rmImage( img ) {
	let iter = img.parent().parent().previousSibling;
	let count = 0;

	while ( iter ) {
		count += 1;
		iter = iter.previousSibling;
	}

	$( img.parent().parent() ).remove();
	ImgBuffer.splice( count, 1 );
};


/**
 * Carica la galleria di anteprima
 */
function loadEditGallerySection() {
  	$( "#GalleryPreview" ).empty();

	ImgBuffer = new Array( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN].content.length );
	
	/* uso questo sistema al posto di eguagliare i due array. in questo modo, una modifica non salvata ad ImgBuffer non influenzerà l'array di CurrentWork */
	for ( i = 0; i < ImgBuffer.length; i++ ) {
		ImgBuffer[i] = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN].content[i];
	}

  	$.each( ImgBuffer, function( i, val ) {
		addImage( val );
	});
};


/**
 * Salva la galleria di immagini nel json.
 */
function saveImageGallery() {
    $.each( ImgBuffer, function( i, val ) {
		val.alt = $( "#GalleryPreview" ).find("input[type=text]").eq( i ).val().replace(/(<([^>]+)>)/gi, "");
	});

	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN].content = ImgBuffer;
  	back();
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