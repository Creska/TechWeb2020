var b = [ false, false, false, false, false, false, false ]; // true: b[i] è selezionato
var bgs = [ "bg-secondary", "bg-secondary", "bg-secondary", "bg-secondary", "bg-secondary", "bg-success", "bg-danger"];

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
	let x;
	switch (i) {
	  case 3:
		x = i+1;
		break;
	  case 4:
		x = i-1;
		break;
	  case 5:
		x = i+1;
		break;
	  case 6:
		x = i-1;
		break;
	  default:
		x = -1;
		for ( y = 0; y < 3; y++ ) {
		  if ( b[y] && (y != i) )
			x = y;
		}
	}
  
	if( b[x] ) {
	  change_color_option( "#a" + x, "bg-primary", bgs[x] );
	  b[x] = false;
	}
};
  
  
/**
* Controlla che siano selezionate le opzioni necessarie per far partire l'editing della storia
*/
function check_select() {
	if( (b[0] ^ b[1] ^ b[2]) && (b[5] ^ b[6]) ) {
	  if ( b[1] ^ b[2] ) {
		if ( b[3] ^ b[4] )
		  $( "#StartEditing" ).removeClass( "disabled" );
		else
		  $( "#StartEditing" ).addClass( "disabled" );
  
		return;
	  }
  
	  $( "#StartEditing" ).removeClass( "disabled" );
	}
	  
	else
	  $( "#StartEditing" ).addClass( "disabled" );
};

  
/**
* @param i --> numero del pulsante
* Seleziona il pulsante con indice i e deseleziona tutti gli altri
*/
function select( i ) {
	b[i] = !b[i];
  
	if( b[i] ) {
	  change_color_option( "#a" + i, bgs[i], "bg-primary" );
	  deselect_other_options( i );
  
	  switch (i) {
		case 0:
		  $( "#NumberOfDevices" ).toggle(false);
		  break;
		case 1:
		case 2:
		  $( "#NumberOfDevices" ).toggle(true);
	  }
	}
	else
	  change_color_option( "#a" + i, "bg-primary", bgs[i] );
  
	check_select();
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
		default:
			$( "#AFtype input[name=QuestionType" ).prop("checked", false);
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

	$( "#AFtype input[name=QuestionType]" ).each( function() {
		if ( $(this).prop("checked") ) {
			switch ( $(this).attr("id") ) {
				case "QuestionType_Checklist":
					CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field.type = "checklist";
					break;
				case "QuestionType_Text":
					CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field.type = "text";
					break;
				case "QuestionType_Number":
					CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field.type = "number";
					break;
			}
		}
	});

	if ( $("#QuestionType_Checklist").prop("checked") ) {
		$("#ChecklistPreview ul li").each( function() {
			CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field.options.push( $(this).find("span").first().text() );
		});
	}

	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].expected_time = $( "#AnswerTimer" ).val() * 60000;
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].GET_CHRONO = $( "#InsertTimer" ).prop( "checked" );
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].ASK_EVAL = $( "#NeedEvaluation" ).prop( "checked" );

	back();
};


/**
 * Carica la sezione ed i parametri in base ai dati salvati nel json. Aggiunge eventuali alert nel caso sia scelta l'opzione di attività interattiva ma mancano i requisiti per farlo funzionare (ovvero: spuntata l'opzione di richeista valutazione, oppure answer field incompleto)
 */
function loadEditOutcomeSection() {
	let CurrentStage = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];

  	/* costruzione del recap dell'Answer Field */
  	$( "#AnswerFieldRecap" ).empty();

	let OutcomeAlert = $( `<div class="col-xs-12 alert alert-danger text-justify" role="alert"><i class="fas fa-exclamation-circle"></i></div>` );

  	if ( CurrentStage.ASK_EVAL ) {
    	OutcomeAlert.append( $("<p>Per questa attività è stata richiesta la valutazione in tempo reale.</p>") );
    	$( "#AnswerFieldRecap" ).append( OutcomeAlert );
  	}
  	else {
    	if ( $.isEmptyObject( CurrentStage.answer_field ) || CurrentStage.answer_field.type == "" || ( CurrentStage.answer_field.type == "checklist" && CurrentStage.answer_field.options.length < 2 ) ) {
			OutcomeAlert.append( $("<p>Campo risposta incompleto.</p>") );
			$( "#AnswerFieldRecap" ).append( OutcomeAlert );
    	}
    	else {
      		$( "#AnswerFieldRecap" ).append( $( "<h4>Anteprima del campo risposta</h4>" ) );
    	}
  	}

	/* reset delle tabelle degli outcomes */
	$( "#AnswerActivity .OutcomesTable tr:nth-child(n+3)" ).remove();
	$( ".OutcomesTable input[type=checkbox]" ).prop( "checked", false );
	$( ".OutcomesTable input[type=number]" ).attr( "disabled", false );
	$( ".OutcomesTable input[type=number]" ).val( "" );

	/* caricamento dei dati presenti nel JSON */
	if ( CurrentStage.activity_type == 'ANSWER' ) {
		$( "#ActivityType_Answer" ).prop( "checked", true );
		$( "#AnswerActivity" ).toggle(true);
		$( "#ReadingActivity" ).toggle(false);
		$( "#SetAnswerOutcome .Save-Cancel button:first-child" ).attr( "disabled", $( "#AnswerFieldRecap .alert-danger" ).length );

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
			tr.find("input[type=number]").attr( "disabled", value.nextquest );
			tr.find("input[type=number]").val( value.nextactivity );
		}); 
	}
	else if ( CurrentStage.activity_type == 'READING' ) {
		$( "#ActivityType_Reading" ).prop( "checked", true );
		$( "#AnswerActivity" ).toggle(false);
		$( "#ReadingActivity" ).toggle(true);
		$( "#SetAnswerOutcome .Save-Cancel button:first-child" ).attr( "disabled", false );
		
		$( "#ReadingActivity .OutcomesTable tr:nth-child(2) :input[type='checkbox']" ).prop( "checked", CurrentStage.answer_outcome[0].nextquest );
		$( "#ReadingActivity .OutcomesTable tr:nth-child(2) :input[type='number']" ).attr( "disabled", CurrentStage.answer_outcome[0].nextquest );
		$( "#ReadingActivity .OutcomesTable tr:nth-child(2) :input[type='number']" ).val( CurrentStage.answer_outcome[0].nextactivity );
	}
	else {
		$( "#ChooseActivityType input[type=radio]" ).prop( "checked", false );
		$( "#SetAnswerOutcome .Save-Cancel button:first-child" ).attr( "disabled", false );

		$( "#AnswerActivity" ).toggle(false);
		$( "#ReadingActivity" ).toggle(false);
	}
};


/**
 * @param label
 * Aggiunge alla tabella un nuovo outcome con la label specificata
 */
function addOutcome( label ) {
	label = label.replace(/(<([^>]+)>)/gi, ""); // rimuove tags html

	if ( label && label != "default" ) {
		let newtr = $( "<tr/>" );
  		newtr.append( $.parseHTML( "<td>" + label + "</td>" ) );
  		newtr.append( $.parseHTML( '<td><input type="checkbox"></td>' ) );
  		newtr.append( ( $( "<input/>",
  		{
    		type: "number",
			placeholder: 0,
			size: 6,
    		min: 0
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

	if ( $( "#ActivityType_Reading" ).prop("checked") ) {
		CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_type = 'READING';

		CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome.push({
			response: "default",
			nextquest: $("#ReadingActivity .OutcomesTable input[type=checkbox]").eq(0).prop( "checked" ),
			nextactivity: $("#ReadingActivity .OutcomesTable input[type=number]").eq(0).val()
		})
	}
	else if ( $( "#ActivityType_Answer" ).prop("checked") ) {
		CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_type = 'ANSWER';

		let response_name;

		$( "#AnswerActivity .OutcomesTable tr:nth-child(n+2)" ).each( function() {
			if ( $(this).children().first().attr("id") )
				response_name = "default";
			else
				response_name = $(this).children().first().text();

			CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome.push({
				response: response_name,
				nextquest: $(this).find("input[type=checkbox]").first().prop( "checked" ),
				nextactivity: $(this).find("input[type=number]").first().val()
			})
		})
	}	
  
  	// console.log(CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome); // debugging
  	back();
};


/**
 * Salva il paragrafo di testo inserito ed inserisce, nella rispettiva card, una sottostringa come anteprima
 */
function saveTextParagraph() {
  let text = $('#TextParInput').val().trim().replace(/(<([^>]+)>)/gi, "");

  CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[get_card_index()].content = text;
  if (text)
    $("#ParagraphsGrid").find(".card-text").eq( get_card_index() ).html( text.substring(0, 25) + "..." );
  else
	$("#ParagraphsGrid").find(".card-text").eq( get_card_index() ).html( "[vuoto]" );
	
  GridsOfParagraphs[CurrentNavStatus.QuestN][CurrentNavStatus.ActivityN] = $("#ParagraphsGrid").html();
  back()
};


/**
 * @param image
 * @param newload --> segnala se l'oggetto è al suo primo caricamento o se era già presente nel json
 * Carica una nuova immagine nella gallery di anteprima
 */
function addImage( image, newload ) {
  let newrow = $( "<div class='row'></div>" );

  let newpreview;

  if (newload) {
    newpreview = $( "<img>" );

    const reader = new FileReader();
    reader.readAsDataURL(image);
      
    reader.addEventListener("load", function() {
      newpreview.attr( "src", this.result );
    });
  }
  else
    newpreview = $(image).clone(); // usata clone() perché senza sarebbe stato modificato direttamente l'oggetto passato come parametro ad addImage()
      
  newrow.append( newpreview );
  newrow.append( $( "<input type='text' placeholder='Descrizione'></input>"));
  newrow.append( $( '<button class="btn btn-danger" onclick="$(this).parent().parent().remove()"><i class="fas fa-minus"></i></button>' ));

  newrow.children().wrap("<div class='col-sm'></div>");
  $("#GalleryPreview").append(newrow);
};


/**
 * Carica la galleria di anteprima
 */
function loadEditGallerySection() {
  	$("#GalleryPreview").empty();

  	let gallery = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[get_card_index()].content;

  	$.each( gallery, function(index, value) {
		addImage( value, false ); // inserisce l'immagine nella gallery di anteprima
		$("#GalleryPreview").find("input[type=text]").eq(index).val( $(value).attr("alt") ); // inserisce la descrizione
  	});
};


/**
 * Salva la galleria di immagini nel json.
 */
function saveImageGallery() {
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[get_card_index()].content = [];

    $("#GalleryPreview .row").each( function(index) {
      	let row = $(this);
		let newpic = $( "<img/>",
		{
			src: row.find("img").first().attr("src"),
			alt: row.find("input[type=text]").first().val().replace(/(<([^>]+)>)/gi, "")
		});

		CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[get_card_index()].content.push( newpic.prop("outerHTML") );
	});
  	back();
};
