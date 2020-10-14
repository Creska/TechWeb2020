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
		  $( "#NumberOfDevices" ).addClass( "invisible" );
		  break;
		case 1:
		case 2:
		  $( "#NumberOfDevices" ).removeClass( "invisible" );
	  }
	}
	else
	  change_color_option( "#a" + i, "bg-primary", bgs[i] );
  
	check_select();
};


/**
 * @param MODE --> indica la modalità di caricamento
 * Prepara la sezione di editing del Campo Risposta. A seconda dei casi, carica la sezione come nuova oppure la compila con i dati salvati in CurrentWork
 * La modalità di caricamento può essere quella di reset totale della finestra, quella di cambiamento di tipologia dell'input oppure quella di caricmento dell'Answer Field salvato
 */
function loadEditAnswerFieldSection( MODE ) {
	switch ( MODE ) {
		case "LOAD":
			let LoadAnswerField = $.parseHTML( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field );

			switch ( $( $( LoadAnswerField ).children()[1] ).prop( "tagName" ) ) {
				case "UL":
					$( "#QuestionType_Checklist" ).prop( "checked", true );

					$( "#AnswerFieldPreview" ).prop( "innerHTML", $( $( LoadAnswerField ).children()[1] ).prop( "outerHTML" ) );

					$( $( "#AnswerFieldPreview" ).find( "label" ) ).each( function( index ) {
						if ( $( this ).text() == CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].right_answer ) {
							$( this ).prev().prop( "checked", true );
						}

						$( this ).replaceWith( $( "<input/>",
              {
                type: "text",
                val: $( this ).text()
              }));
					});

					$( "#AnswerFieldPreview" ).append( $( "<button/>",
						{
							"class": "btn btn-secondary AddRadio",
							onclick: "addRadio('AnswerInput');",
							text: "+"
						}));

					break;
				case "INPUT":
					if ( $( $( LoadAnswerField ).children()[1] ).attr( "type" ) == "text" ) {
						$( "#QuestionType_Text" ).prop( "checked", true );
					}
					else if ( $( $( LoadAnswerField ).children()[1] ).attr( "type" ) == "number" ) {
						$( "#QuestionType_Number" ).prop( "checked", true );
					}

					$( "#AnswerFieldPreview" ).prop( "innerHTML", $( $( LoadAnswerField ).children()[1] ).prop( "outerHTML" ) );
				
					$( "#AnswerFieldPreview" ).find( "input" ).val( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].right_answer );

					break;
				default:
					handleError();
			}

			$( "#InsertAnswerFieldDescription" ).val( $( $( LoadAnswerField ).children()[0] ).text() );
			$( "#AnswerTimer" ).val( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].expected_time / 60000 );
			$( "#AnswerScore" ).val( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_score );
			$( "#InsertTimer" ).prop( "checked", CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].GET_CHRONO );
			if ( $( "#InsertTimer" ).prop( "checked" ) )
				$( "#AnswerTimer" ).prop( "disabled", false );
			else
				$( "#AnswerTimer" ).prop( "disabled", true );
			$( "#NeedEvaluation" ).prop( "checked", CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].ASK_EVAL );
			break;
		case "CHG_TYPE":
			buildAnswerFieldPreview();
			$( "#InsertAnswerFieldDescription" ).val( "" );
			break;
		case "RESET":
			$( "#QuestionType_Checklist" ).prop( "checked", false );
			$( "#QuestionType_Text" ).prop( "checked", false );
			$( "#QuestionType_Number" ).prop( "checked", false );
	
			$( "#AnswerTimer" ).val( 0.5 );
			$( "#AnswerTimer" ).attr( "disabled", true );
			$( "#InsertTimer" ).prop( "checked", false );
			$( "#AnswerScore" ).val( 0 );
			$( "#NeedEvaluation" ).prop( "checked", false );
			$( "#MissingRightAnswerWarning" ).remove();
			$( "#AnswerFieldPreview" ).empty();
			$( "#InsertAnswerFieldDescription" ).val( "" );
			break;
		default:
			handleError();
			break;
	}
};


/**
 * Costruisce il campo risposta in base alla tipologia scelta dall'utente.
 * I campi testo/numero non hanno nessun valore di default, così come non viene spuntato nessun radio di default
 */
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
			placeholder: "0"
		}));
	}
};


/**
 * Salva il parametro Risposta Esatta specificato dall'utente, a seconda del tipo di campo risposta scelto
 */
function saveRightAnswer() {
	if ( $( "#QuestionType_Checklist" ).prop( "checked" ) ) {
		$( "#AnswerFieldPreview input[type='radio']" ).each( function( index ) {
			if ( $( this ).prop( "checked" ) && $( this ).next().val().trim() ) {
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].right_answer = $( this ).next().val().trim();
				return;
			}
    });
	}
	else {
		CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].right_answer = $( "#AnswerFieldPreview input" ).val().trim();
	}
};


/**
 * Salva tutte le personalizzazioni che l'utente ha creato per il Campo risposta
 */
function saveAnswerFieldSettings() {
	saveRightAnswer();

	if ( $( "#QuestionType_Checklist" ).prop( "checked" ) ) {
		let InputLabel;
		$( "#AnswerFieldPreview input[type='text']" ).each( function( index ) {
			InputLabel = $( "<label/>",
			{
				for: "AnswerOption" + String( index )
			});

			if ( $( this ).val().trim() == "" ) {
				InputLabel.text( "Opzione" + String( index ) );
			}
			else {
				InputLabel.text( $( this ).val().trim() );
			}

			$( this ).replaceWith( InputLabel );
		});
	}
	
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
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].expected_time = $( "#AnswerTimer" ).val() * 60000;
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_score = $( "#AnswerScore" ).val();
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].GET_CHRONO = $( "#InsertTimer" ).prop( "checked" );
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].ASK_EVAL = $( "#NeedEvaluation" ).prop( "checked" );

	back();
};


/**
 * @param MODE --> indica se il sistema di progressione si basa su un'attività di sola lettura o provvista di un campo risposta
 * Carica la sezione per la gestione della progressione (outcome) dell'attività.
 * Se chiamata senza parametri, prepara tutto l'html necessario, altrimenti modifica la modalità scelta dall'utente
 */
function loadEditOutcomeSection( MODE ) {
	switch ( MODE ) {
		case "ONLYREADING":
			$( "#AnswerFieldRecap" ).addClass( "invisible" );
			$( "#SetAnswerOutcome table tr" ).each( function(index) {
				if (index <= 1) $(this).removeClass( "invisible" );
				else $(this).addClass( "invisible" );
			});
			$( "#SetAnswerOutcome .SaveBtn" ).attr( "disabled", false );
			return;
		case "ANSWER":
			$( "#AddOutcomeWidget input" ).val("");
			$( "#AnswerFieldRecap" ).removeClass( "invisible" );
			$( "#SetAnswerOutcome table tr" ).each( function(index) {
				if (index === 1) $(this).addClass( "invisible" );
				else $(this).removeClass( "invisible" );
			});
			if ( $( "#AnswerFieldRecap .alert" ).length ) $( "#SetAnswerOutcome .SaveBtn" ).attr( "disabled", true );
			else $( "#SetAnswerOutcome .SaveBtn" ).attr( "disabled", false );
			return;
	}
	
	let CurrentStage = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];

  	let OutcomeAlert = $( "<div/>",
  	{
    	"class": "alert alert-danger",
    	role: "alert"
	});

  	/* costruzione del recap dell'Answer Field */
  	$( "#AnswerFieldRecap" ).empty();

  	if ( CurrentStage.ASK_EVAL ) {
    	OutcomeAlert.text( "Per questa attività è stata richiesta la valutazione in tempo reale." );
    	$( "#AnswerFieldRecap" ).append( OutcomeAlert );
    	$( "#SetAnswerOutcome .SaveBtn" ).attr( "disabled", true );
  	}
  	else {
    	$( "#SetAnswerOutcome .SaveBtn" ).attr( "disabled", false );

    	if ( CurrentStage.answer_field && CurrentStage.right_answer ) {
      		$( "#AnswerFieldRecap" ).append( $.parseHTML( "<h2>Anteprima del campo risposta</h2>" ) );
      		$( "#AnswerFieldRecap" ).append( $.parseHTML( CurrentStage.answer_field ));
     		$( "#AnswerFieldRecap" ).append( $.parseHTML( "<strong>Risposta corretta: <cite>" + CurrentStage.right_answer + "</cite>" ));
    	}
    	else {
      		OutcomeAlert.text( "Campo risposta incompleto o risposta giusta mancante." );
      		$( "#AnswerFieldRecap" ).append( OutcomeAlert );
      		$( "#SetAnswerOutcome .SaveBtn" ).attr( "disabled", true );
    	}
  	}

  	/* costruzione della tabella */
  	$( "#OutcomesTable" ).empty();
  	$( "#OutcomesTable" ).append( $.parseHTML(`
    	<tr>
      		<th>Risposta</th>
      		<th>Passa alla quest successiva</th>
      		<th>Attività su cui spostarsi</th>
      		<th>Rimuovi</th>
    	</tr>`
	  ));
	addOutcome("<em>Solo lettura</em>", "OnlyReading");
  	addOutcome("<em>Riposta corretta</em>", "correct");
  	addOutcome("<em>Risposta errata</em>", "wrong");

	/* caricamento dei dati presenti nel JSON */
	if ( typeof CurrentStage.answer_outcome === 'object' && CurrentStage.answer_outcome !== null ) {
		let tr;

  		for ( const[prop,val] of Object.entries( CurrentStage.answer_outcome ) ) {
    		switch ( prop ) {
      			case "RightAnswer":
        			tr = $( "#OutcomesTable tr:nth-child(3)" );
       				break;
      			case "WrongAnswer":
        			tr = $( "#OutcomesTable tr:nth-child(4)" );
        			break;
      			default:
        			tr = $( "<tr/>" );
        			tr.append( $.parseHTML( "<td>" + String( prop ) + "</td>" ) );
        			tr.append( $.parseHTML( '<td><input type="checkbox" ></td>' ) );
        			tr.append( ( $( "<input/>",
        				{
          					type: "number",
          					placeholder: 0,
          					min: 0
        				})).wrap( "<td></td>" ).parent());
        			tr.append( $.parseHTML( "<td><button class='btn btn-danger' onclick='$(this).parent().parent().remove()'>Cancella</button></td>" ) );
        			$( "#OutcomesTable" ).append( tr );
        			tr = $( "#OutcomesTable tr:last-child" );
    		}

    		if ( val == "nextquest" ) {
      			tr.find( ":input[type='number']" ).val( "" );
      			tr.find( ":input[type='number']" ).attr( "disabled", true );
      			tr.find( ":input[type='checkbox']" ).prop( "checked", true );
    		}
    		else tr.find( "input[type=number]" ).val( val );

		  }
		  
		  $( "#OutcomeSwitch" ).prop( "checked", true );
		  loadEditOutcomeSection( "ANSWER" );
	}
	else {
		if ( CurrentStage.answer_outcome == "nextquest" ) {
			$( "#OutcomesTable tr:nth-child(2) :input[type='number']" ).val( "" );
			$( "#OutcomesTable tr:nth-child(2) :input[type='number']" ).attr( "disabled", true );
			$( "#OutcomesTable tr:nth-child(2) :input[type='checkbox']" ).prop( "checked", true );
		}
		else $( "#OutcomesTable tr:nth-child(2) input" ).val( CurrentStage.answer_outcome );

		$( "#OutcomeSwitch" ).prop( "checked", false );
		loadEditOutcomeSection( "ONLYREADING" );
	}
};


/**
 * @param label 
 * @param id
 * Aggiunge alla UI un nuovo outcome, aggiungengo la label e l'id specificati.
 * L'id esiste solo per gli outcome predefiniti
 */
function addOutcome( label, id ) {
  let newtr = $( "<tr/>" );
  newtr.append( $.parseHTML( "<td>" + label + "</td>" ) );
  newtr.append( $.parseHTML( '<td><input type="checkbox" ></td>' ) );
  newtr.append( ( $( "<input/>",
  {
    id: id,
    type: "number",
    placeholder: 0,
    min: 0
  })).wrap( "<td></td>" ).parent());
  newtr.append( $.parseHTML( `<td><button class="btn btn-danger" onclick="$(this).parent().parent().remove()">Cancella</button></td>` ) );
  $( "#OutcomesTable" ).append( newtr );
};


/**
 * Salva nel JSON tutti gli outcomes settati dall'autore
*/
function saveOutcomes() {
	if ( $("#OutcomeSwitch").prop( "checked" ) ) {
		let newobj = {};

  		let next;
  		let label;

  		$( "#OutcomesTable tr:not(:first-child):not(.invisible)" ).each( function( index ) {
    		if ( $(this).find("input[type=checkbox]").first().prop( "checked" ) )
      			next = "nextquest";
    		else
      			next = $(this).find("input[type=number]").first().val();

    		label = $(this).find("input[type=number]").first().attr("id");
  
    		switch ( label ) {
      			case "correct":
        			newobj["RightAnswer"] = next;
       				 break;
      			case "wrong":
        			newobj["WrongAnswer"] = next;
        			break;
      			case "expired":
        			newobj["TimeExpired"] = next;
        			break;
      			default:
        			newobj[$(this).children().first().prop("innerHTML")] = next;
    		}
  		});

  		CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome = newobj;
	}
	else {
		if ( $( "#OutcomesTable tr:nth-child(2) :input[type=checkbox]" ).first().prop( "checked" ) )
			CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome = "nextquest";
		else
			CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome = $( "#OutcomesTable tr:nth-child(2) :input[type=number]" ).first().val();
	}
  
  	// console.log(CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome); // debugging
  	back();
};


/**
 * Salva il paragrafo di testo inserito ed inserisce, nella rispettiva card, una sottostringa come anteprima
 */
function saveTextParagraph() {
  let text = $('#TextParInput').val().trim();

  CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[get_card_index()] = "<p class='TextParagraph'>" + text + "</p>";
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
    newpreview = $( "<img class='SingleImage'>" );

    const reader = new FileReader();
    reader.readAsDataURL(image);
      
    reader.addEventListener("load", function() {
      newpreview.attr( "src", this.result );
    });
  }
  else {
    newpreview = $(image).clone(); // usata clone() perché senza sarebbe stato modificato direttamente l'oggetto passato come parametro ad addImage()
    newpreview.attr("class", "SingleImage");
  }
      
  newrow.append( newpreview );
  newrow.append( $( "<input type='text' placeholder='Descrizione'></input>"));
  newrow.append( $( '<button class="btn btn-danger" onclick="$(this).parent().parent().remove()">Cancella</button>' ));

  newrow.children().wrap("<div class='col-sm'></div>");
  $("#GalleryPreview").append(newrow);
};


/**
 * Carica la galleria di anteprima
 */
function loadEditGallerySection() {
  $("#GalleryPreview").empty();

  gallery = $( $.parseHTML( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[get_card_index()] ));

  if ( gallery.prop("tagName") == "IMG" ) {
    addImage(gallery, false);
    $( "#GalleryPreview input" ).first().val( gallery.attr("alt") );
  }
  else {
    gallery.find("img").each( function() {
      addImage(this, false);
    });
    /* inserisce in ogni input la descrizione abbinata a ciascuna immagine */
    $("#GalleryPreview").find("input").each( function(index) {
      $(this).val( gallery.find("img").eq(index).attr("alt") );
    });
  }
};


/**
 * Salva la galleria di immagini nel json.
 * A seconda del numero di immagini, crea una img singola o un carousel di Bootstrap
 */
function saveImageGallery() {
  if ( $("#GalleryPreview .row").length == 1 ) {
	$("#GalleryPreview .row img").first().attr( "alt", $("#GalleryPreview .row input").first().val() );
	$("#GalleryPreview .row img").first().attr( "class", "SingleImage" );

    CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[get_card_index()] = $("#GalleryPreview .row img").first().prop("outerHTML");
  }
  else {
	  /* l'id "ActiveGallery" serve a far funzionare le frecce per scorrere le immagini */
    let newgallery = $(`
    <div id="ActiveGallery" class="carousel slide ImageGallery" data-ride="carousel">
      <div class="carousel-inner">
      </div>
      <a class="carousel-control-prev" href="#ActiveGallery" role="button" data-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="sr-only">Previous</span>
      </a>
      <a class="carousel-control-next" href="#ActiveGallery" role="button" data-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="sr-only">Next</span>
      </a>
    </div>`);

    $("#GalleryPreview .row").each( function(index) {
      let row = $(this);
      let newpic = $("<div class='carousel-item'></div>");

      if (index == 0) newpic.addClass("active");

      newpic.append( $("<img/>",
      {
        "class": "d-block w-100",
        src: row.find("img").eq(0).attr("src"),
        alt: row.find("input").eq(0).val()
      }));

      newgallery.children().first().append(newpic);
    });

    CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[get_card_index()] = newgallery.prop("outerHTML");
  }

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
