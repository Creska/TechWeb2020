var MediaBuffer;
/**
 * Apre (o chiude) il widget per l'impostazione della tipologia di attività
 */
function openActivityTypeWidget() {
	if ( $( "#ChooseActivityType" ).css( "display" ) == "none" ) {
		$( "#MainOutcomeWidget" ).fadeOut();
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
	let activity = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];

	switch ( $( "#ChooseActivityType input[type=radio]:checked" ).attr("id") ) {
		case "ActivityType0":
			if ( activity.activity_type != "ANSWER" ) {
				activity.answer_outcome = [{
					condition: null,
					next_quest_id: "",
					next_activity_id: "",
					score: null
				}];
				activity.activity_type = "ANSWER";
				activity.FINAL = false;
				$( "#EditActivity .p-3" ).first().find( ".btn-secondary" ).attr( "disabled", false );
			}
			break;
		case "ActivityType1":
			if ( activity.activity_type != "READING" ) {
				activity.answer_outcome = [{
					condition: null,
					next_quest_id: "",
					next_activity_id: "",
					score: null
				}];
				activity.activity_type = "READING";
				activity.FINAL = false;
				$( "#EditActivity .p-3" ).first().find( ".btn-secondary:nth-child(2n)" ).attr( "disabled", true );
				$( "#EditActivity .p-3" ).first().find( ".btn-secondary:nth-child(3)" ).attr( "disabled", false );
			}
			break;
		case "ActivityType2":
			if ( activity.FINAL == false ) {
				// c'era un'altra attività salvata come finale, la segna come non finale
				$.each( CurrentWork.quests, function( q_i, q ) {
					$.each( q.activities, function( a_i, a ) {
						if ( a.FINAL ) {
							a.FINAL = false;
							a.answer_outcome = [{
								condition: null,
								next_quest_id: "",
								next_activity_id: "",
								score: null
							}];
						}
					});
				});

				activity.activity_type = "READING";
				activity.FINAL = true;
				activity.answer_outcome = [{
					condition: null,
					next_quest_id: "",
					next_activity_id: "",
					score: null
				}];
				$( "#EditActivity .p-3" ).first().find( ".btn-secondary:not(:first-child)" ).attr( "disabled", true );
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

	$( "#InsertAnswerFieldDescription" ).val( activity.answer_field.description );

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
	}
	
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].expected_time = $( "#AnswerTimer" ).val() * 60000;
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].GET_CHRONO = $( "#InsertTimer" ).prop( "checked" );
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].ASK_EVAL = $( "#NeedEvaluation" ).prop( "checked" );

	back();
};


/**
 * Salva il paragrafo di testo inserito ed inserisce, nella rispettiva card, una sottostringa come anteprima
 */
function saveTextParagraph() {
  let text = $('#TextParInput').val().trim().replace(/(<([^>]+)>)/gi, "");

  CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN].content = text;
  if (text)
    $("#ParagraphsGrid").find("strong").eq( CurrentNavStatus.TextPartN ).html( text.substring(0, 25) + "..." );
  else
	$("#ParagraphsGrid").find("strong").eq( CurrentNavStatus.TextPartN ).html( "[vuoto]" );
	
  saveCardGrids();
  back()
};


function uploadMedia( list ) {
	if ( CurrentNavStatus.Section == "EditGallery" ) {
		for ( media of list ) {
			if ( media ) {
				switch ( getFileExtension( media.name ).toLowerCase() ) {
					case "jpg":
					case "jpeg":
					case "png":
					case "gif":
						MediaBuffer.push({
							isFile: true,
							src: media,
							name: media.name,
							alt: ""
						});
						displayMediaPreview( MediaBuffer[MediaBuffer.length - 1], "gallery" );
				}
			}
		}
	}
	else if ( CurrentNavStatus.Section == "VideoSection" ) {
		let media = list[0];
		if ( media ) {
			switch ( getFileExtension( media.name ).toLowerCase() ) {
				case "mp4":
				case "webm":
					MediaBuffer[0] = {
						isFile: true,
						src: media,
						alt: ""
					};
					displayMediaPreview( MediaBuffer[0], "video" );
			}
		}
	}
};


function displayMediaPreview( media, mediatype ) {
	if ( mediatype == "gallery" ) {
		let newpreview = $( "<img>" );
		let reader;

		if ( media.isFile ) {
			reader = new FileReader();
    		reader.readAsDataURL( media.src );
    		reader.addEventListener( "load", function() {
      			newpreview.attr( "src", this.result );
			});
		}
		else {
			newpreview.attr( "src", get_media_path(media.name) );
		}
		
		let newrow = $( "<div class='row'></div>" )
		newrow.append( newpreview );
		newrow.append( $( "<input type='text' placeholder='Descrizione'></input>"));
		newrow.find( "input" ).val( media.alt );
  		newrow.append( $( '<button class="btn btn-danger" onclick="removeMediaPreview( $(this) );"><i class="fas fa-minus"></i></button>' ));
  		newrow.children().wrap( "<div class='col-sm'></div>" );
  		$( "#GalleryPreview" ).append( newrow );
	}
	else if ( mediatype == "video" ) {
		$( "#yt-video" ).html( media );
	}
};


/**
 * @param media
 * Elimina dall'anteprima l'immagine specificata come argomento. In realtà, quello passato come parametro, è il tasto di eliminazione. In ogni caso, ne si ricava comunque la riga di tabella corrispondente all'immagine da cancellare
 */
function removeMediaPreview( media ) {
	if ( CurrentNavStatus.Section == "EditGallery" ) {
		let iter = media.parent().parent().prev();
		let count = 0;

		while ( iter.length ) {
			count += 1;
			iter = iter.prev();
		}

		$( media.parent().parent() ).remove();
		MediaBuffer.splice( count, 1 );
	}
	else if ( CurrentNavStatus.Section == "VideoSection" ) {
		$( "#yt-video" ).html( "<div class='video-placeholder'>Nessun video selezionato</div>" );
		MediaBuffer = "";
	}
};


/**
 * Carica la galleria di anteprima
 */
function loadEditGallerySection() {
  	$( "#GalleryPreview" ).empty();

	MediaBuffer = new Array( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN].content.length );
	
	/* uso questo sistema al posto di eguagliare i due array. in questo modo, una modifica non salvata (che influenza MediaBuffer) non attaccherà anche l'array di CurrentWork */
	for ( i = 0; i < MediaBuffer.length; i++ ) {
		MediaBuffer[i] = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN].content[i];
	}

  	$.each( MediaBuffer, function( i, val ) {
		displayMediaPreview( val, CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN].type );
	});
};


/**
 * Salva la galleria di immagini nel json.
 */
function saveImageGallery() {
    $.each( MediaBuffer, function( i, val ) {
		val.alt = $( "#GalleryPreview" ).find("input[type=text]").eq( i ).val().replace(/(<([^>]+)>)/gi, "");
	});

	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN].content = MediaBuffer;
  	back();
};


function embedVideo() {
	html_text = $( "#YTLink textarea" ).val();
	let parsed_text = $.parseHTML( html_text );

	let isHtml = parsed_text.filter( function(e) {
		return e instanceof HTMLElement;
	}).length;

	if ( isHtml ) {
		parsed_text = $( parsed_text );
		
		if ( parsed_text.prop( "tagName" ) != "IFRAME" ) {
			$( "yt-video" ).html( "<div class='video-placeholder'>Errore: Elemento non identificato correttamente</div>" );
			return;
		}

		parsed_text.removeAttr( "width" );
		parsed_text.removeAttr( "length" );
		parsed_text.html( "" );

		MediaBuffer = html_text;

		$( "#YTLink textarea" ).val( "" );
		$( "#YTLink" ).addClass( "invisible" );
		displayMediaPreview( MediaBuffer, "video" );
		return;
	}

	$( "#yt-video" ).html( "<div class='video-placeholder'>Errore: Elemento non identificato correttamente</div>" );
	return;
};


function loadVideoSection() {
	MediaBuffer = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN].content;

	$( "#YTLink textarea" ).val( "" );

	if ( MediaBuffer ) {
		displayMediaPreview( MediaBuffer, "video" );
	}
	else {
		$( "#yt-video" ).html( "<div class='video-placeholder'>Nessun video selezionato</div>" );
	}
};


function saveVideoSection() {
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN].content = MediaBuffer;

	back();
};