var gm_b = [ false, false, false ]; // se gm_b[0] è true --> #gm0 è selezionato 

/* ------------------------- */

/**
 * @param which
 * Salva il titolo della storia o della quest
 */
function save_title( which ) {
	let title;
	switch ( which ) {
	  case "story":
		title = $( '#StoryTitleInput' ).val().trim().replace(/(<([^>]+)>)/gi, "");
		CurrentWork.story_title = title;
  
		if ( title )
		  $( "#EditStory header small" ).html( title );
		else
		  $( "#EditStory header small" ).html( "<em>StoriaSenzaNome</em>" );
  
		change_color_option( "#SaveStoryTitle", "btn-primary", "btn-success" );
		$( "#SaveStoryTitle" ).text( "Salvato!" );
		break;
	  case "quest":
		if (CurrentNavStatus.QuestN < 0) {
		  title = $("#NewQuestWidget input").val().trim().replace(/(<([^>]+)>)/gi, "");
		  if ( title ) {
			/* un titolo di default è già presente nel nuovo elemento quest
			quindi viene aggiunto un nuovo titolo solo se l'utente ne ha inserito uno */
			CurrentWork.quests[CurrentWork.quests.length - 1].quest_title = title;
		  }
		}
		else {
		  title = $( '#QuestTitleInput' ).val().trim().replace(/(<([^>]+)>)/gi, "");
  
		  // aggiorna il nome della card e il titolo della sezione
		  if ( title ) {
			$( "#QuestsGrid .card-title strong" ).eq( CurrentNavStatus.QuestN ).html( title );
			$( "#EditQuest header small" ).html( $( "#EditStory header small" ).html() + " · " + title );
		  }
		  else {
			$( "#QuestsGrid .card-title strong" ).eq( CurrentNavStatus.QuestN ).html( "<em>QuestSenzaNome" + CurrentNavStatus.QuestN + "</em>" );
			$( "#EditQuest header small" ).html( $( "#EditStory header small" ).html() + " · " + "<em>QuestSenzaNome" + CurrentNavStatus.QuestN + "</em>" );
		  }
  
		  CurrentWork.QuestGrid = $( "#QuestsGrid" ).html();
  
		  CurrentWork.quests[CurrentNavStatus.QuestN].quest_title = title;
  
		  change_color_option( "#SaveQuestTitle", "btn-primary", "btn-success" );
		  $( "#SaveQuestTitle" ).text( "Salvato!" );
		}
		break;
	  default:
		  handleError();
	}
  };
  
  
  /**
   * Crea una quest/attività/elemento vuoto e lo aggiunge al json, nonché agli array di supporto
  */
  function create_stuff(what) {
	switch (what) {
	  case "quest":
		CurrentWork.quests.push(initQuest());
		CurrentWork.ActivityGrids.push("");
		CurrentWork.ParagraphGrids.push([]);
		save_title("quest");
		break;
	  case "activity":
		CurrentWork.quests[CurrentNavStatus.QuestN].activities.push(initActivity());
		CurrentWork.ParagraphGrids[CurrentNavStatus.QuestN].push("");
		break;
	  case "TextParagraph":
		CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text.push({
		  type: "text",
		  content: ""
		});
		break;
	  case "Gallery":
		CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text.push({
		  type: "gallery",
		  content: []
		});
		break;
		case "Video":
			CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text.push({
			  type: "video",
			  content: ""
			});
			break;
	  default:
		handleError();
	}
  };
  
  
  /**
   * Inizializza una nuova storia
   */
  function initStory() {
	CurrentWork = {
	  accessibility: {
		  WA_visual: false,
		  WA_motor: false,
		  WA_hearing: false,
		  WA_convulsions: false,
		  WA_cognitive: false
	  },
	  story_title: "",
	  game_mode: "",
	  players: 0,
	  quests: [],
	  QuestGrid: "",
	  ActivityGrids: [],
	  ParagraphGrids: []
	};
  
	CSSdata = {
	  sheet: "",
	  valid: true
	};
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
	  activity_text: [],
	  activity_type: "ANSWER",
		  answer_field: {
		description: "",
		type: "",
		options: []
	  },
		  right_answer: "",
		  answer_outcome: [{
			  response: "default",
			  nextquest: "",
			  nextactivity: "",
			  score: ""
		  }],
		  ASK_EVAL: 0,
		  GET_CHRONO: 0,
	  expected_time: "",
	  FINAL: 0
	  };
  
	  return EmptyActivity;
  };


/**
 * Torna alla sezione precedente
*/
function back() {
	switch ( CurrentNavStatus.Section ) {
	  	case "ChooseGameMode":
			goToSection( "EditStory" );
			break;
	  	case "EditQuest":
			goToSection( "EditStory" );
			CurrentNavStatus.QuestN = -1;
			break;
	  	case "EditActivity":
			goToSection( "EditQuest" );
			CurrentNavStatus.ActivityN = -1;
			break;
	  	case "EditAnswerField":
	  	case "SetAnswerOutcome":
		case "OutcomesSection":
			goToSection( "EditActivity" );
			break;
	  	case "EditText":
	  	case "EditGallery":
		case "VideoSection":
			CurrentNavStatus.TextPartN = -1;
			goToSection( "EditActivity" );
			break;
	}
};
  
  
/**
* @param where
* Porta alla sezione specificata, facendo tutti i caricamenti necessari
*/
  
function goToSection(where) {
	/* esegue eventuali reset, che non dovrebbero essere necessari
	mode = "default";
	first_selected_stage = "";*/
	switch ( CurrentNavStatus.Section ) {
	  case "MainMenu":
		change_navbar("hide");//i'm coming from home so i have to hide extra navbar stuff
		break;
	  case "ChooseStoryToEdit":
		change_navbar("show");
		break;
	  case "EditStory":
	  case "EditQuest":
	  case "EditActivity":
		stopAnimation( "#" + CurrentNavStatus.Section + " .CardGrid" );
	}
	if( where == "EditStory")//make sure error div is not shown, it can't be done after fadeout
		$("#EditStory_div_error").css("display", "none");
	if( where == "MainMenu" || where == "final_section" || where == "ChooseStoryToEdit")
	  $('.masthead').fadeOut();
	/* cambia sezione */
	$("#"+CurrentNavStatus.Section).fadeOut( function() {
	  change_color_option(".SwapBtn", "btn-primary", "btn-secondary");
	  change_color_option(".CancelBtn", "btn-primary", "btn-secondary");
  
	  switch ( where ) {
		case "MainMenu":
		  break;
		case "EditStory":
		  $('.masthead').fadeIn();
		  if ( CurrentWork.story_title )
			$( "#EditStory header small" ).html( CurrentWork.story_title );
		  else
			$( "#EditStory header small" ).html( "<em>StoriaSenzaNome</em>" );
  
		  $( "#ErrorList" ).empty();
		  $( "#StoryTitleInput" ).val( CurrentWork.story_title );
		  change_color_option( "#SaveStoryTitle", "btn-primary", "btn-success" );
		  $( "#SaveStoryTitle" ).text( "Salvato!" );
  
		  $( "#QuestsGrid" ).html( String(CurrentWork.QuestGrid) );
		  break;
		case "ChooseGameMode":
		  $( "#ChooseGameMode header small" ).html( $( "#EditStory header small" ).html() );
		  loadGameModeSection();
		  break;
		case "EditQuest":
		  if ( CurrentNavStatus.Section == "EditStory" ) {
			CurrentNavStatus.QuestN = get_card_index();
			if ( CurrentWork.quests[CurrentNavStatus.QuestN] === undefined ) {
				handleError();
				return;
			}
		  }
  
		  $( "#EditQuest header small" ).html( $( "#EditStory header small" ).html() + " · " + $( "#EditStory .card-title strong" ).eq(CurrentNavStatus.QuestN).html() );
  
		  $( "#QuestTitleInput" ).val( CurrentWork.quests[CurrentNavStatus.QuestN].quest_title );
		  change_color_option( "#SaveQuestTitle", "btn-primary", "btn-success" );
		  $( "#SaveQuestTitle" ).text( "Salvato!" );
  
		  $( "#ActivitiesGrid" ).html( CurrentWork.ActivityGrids[CurrentNavStatus.QuestN] ); //carica la griglia delle attività
		  break;
		case "EditActivity":
		  if ( CurrentNavStatus.Section == "EditQuest" ) {
			CurrentNavStatus.ActivityN = get_card_index();
			if ( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN] === undefined ) {
				handleError();
				return;
			}
		  }
		  
		  $( "#EditActivity header small" ).html( $( "#EditQuest header small" ).html() + " · " + $( "#EditQuest .card-title strong" ).eq(CurrentNavStatus.ActivityN).html() );
		  $( "#EditActivity header h1" ).html( "Attività" );
  
		  /* sistemazione dei pulsanti */
		  $( "#ChooseActivityType" ).css( "display", "none" );
		  let activity = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];
		  if ( activity.activity_type == "READING" ) {
			$( "#EditActivity .p-3" ).first().find( "button:nth-child(2)" ).attr( "disabled", true );
  
			if ( activity.FINAL )
			  $( "#EditActivity .p-3" ).first().find( "button:nth-child(3)" ).attr( "disabled", true );
			else
			  $( "#EditActivity .p-3" ).first().find( "button:nth-child(3)" ).attr( "disabled", false );
		  }
		  else {
			$( "#EditActivity .p-3" ).first().find( "button" ).attr( "disabled", false );
		  }
	  
		  //carica la griglia dei paragrafi/immagini/gallerie
		  $( "#ParagraphsGrid" ).html( CurrentWork.ParagraphGrids[CurrentNavStatus.QuestN][CurrentNavStatus.ActivityN] );
		  break;
		case "EditText":
		  CurrentNavStatus.TextPartN = get_card_index();
		  if ( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN] === undefined ) {
			handleError();
			return;
		  }
  
		  // per forza di cose, il titolo di questa e delle successive tre sezioni è uguale a quello di EditActivity
		  $( "#EditText header small" ).html( $( "#EditActivity header small" ).html() );
  
		  $( "#TextParInput" ).val( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN].content );
		  break;
		case "EditGallery":
		  CurrentNavStatus.TextPartN = get_card_index();
		  if ( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN] === undefined ) {
			handleError();
			return;
		  }
  
		  $( "#EditGallery header small" ).html( $( "#EditActivity header small" ).html() );
  
		  loadEditGallerySection();
		  break;
		case "VideoSection":
			CurrentNavStatus.TextPartN = get_card_index();
			if ( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN] === undefined ) {
				handleError();
				return;
			}

			$( "#VideoSection header small" ).html( $( "#EditActivity header small" ).html() );

			loadVideoSection();
			break;
		case "EditAnswerField":
		  $( "#EditAnswerField header small" ).html( $( "#EditActivity header small" ).html() );
  
		  loadEditAnswerFieldSection();
		  break;
		case "SetAnswerOutcome":
		  $( "#SetAnswerOutcome header small" ).html( $( "#EditActivity header small" ).html() );
  
		  loadEditOutcomeSection();
		  break;
		case "OutcomesSection":
			loadOutcomesSection();
			break;
		case "ChooseStoryToEdit":
		  getStories("ChooseStoryToEdit"); 
		  break;
		case "Explorer":
		  getStories("Explorer");
		  break;   
		case "final_section":
			break;
		default:
		  handleError();
	  }
	  
	  CurrentNavStatus.Section = where;
	  $("#"+where).fadeIn();
	  
	});
};
  
/**
* Mostra/nasconde la guida
*/
function showHelp() {
	if ( $( "#Help" ).css( "display" ) == "none" ) {
	  stopAnimation();
	  $( "#" + CurrentNavStatus.Section ).fadeOut();
	  $( "#Help" ).fadeIn( function() {
		$( "#HelpBtn" ).html( '<i class="fas fa-times"></i>' );
	  });
	}
	else {
	  $( "#Help" ).fadeOut();
	  $( "#" + CurrentNavStatus.Section ).fadeIn( function() {
		$( "#HelpBtn" ).html( '<i class="fas fa-question"></i>' );
	  });
	}
};


/**
 * @param i --> indice del pulsante selezionato
 * Deseleziona tutte le opzioni diverse dal pulsante di indice i
 */
function deselect_other_options( i ) {
	for ( y = 0; y < 3; y++ ) {
		if ( y != i ) {
			change_color_option( "#gm" + y, "bg-primary", "bg-secondary" );
			  gm_b[y] = false;
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
	gm_b = [ false, false, false ];

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

	for ( [key,value] of Object.entries( CurrentWork.accessibility ) ) {
		$( "#" + String( key ) ).prop( "checked", value );
	}
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

	$.each( $( "#Access input[type=checkbox]" ), function( i, val ) {
		CurrentWork.accessibility[ $(val).attr("id") ] = $( val ).prop( "checked" );
	});

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
 * Marca l'attività corrente come "finale" o viceversa, a seconda dello stato attuale.
 */
function setFinalActivity() {
	let CurrentStage = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];
  
	if ( CurrentStage.FINAL == 0 ) {
	  change_color_option( "#FinalStageBtn", "btn-secondary", "btn-success" );
	  $("#FinalStageBtn").next().attr( "disabled", true );
	  $("#FinalStageBtn").next().next().attr( "disabled", true );
  
	  // segna tutte le altre attività come non finali
	  CurrentWork.quests.forEach( function( q, i ) {
		q.activities.forEach( function( a, j ) {
		  a.FINAL = 0;
		});
	  });
  
	  CurrentStage.FINAL = 1;
	}
	else {
	  change_color_option( "#FinalStageBtn", "btn-success", "btn-secondary" );
	  $("#FinalStageBtn").next().attr( "disabled", false );
	  $("#FinalStageBtn").next().next().attr( "disabled", false );
	  CurrentStage.FINAL = 0;
	}
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
			$( "#AddOutcomeWidget > p" ).after( $( "<ul class='border border-light rounded p-3 OutcomeInput'></ul>" ) );
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



function loadOutcomesSection() {
	let activity = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];

	if ( activity.activity_type == "READING" ) {
		if ( activity.answer_outcome.length > 1 ) {
			handleError();
			return;
		}

		$( "#ReadingActivity .outcome-score" ).val( activity.answer_outcome.score );
		loadStageSelector( $( "#ReadingActivity .outcome-next-quest-index" ) );
		$( "#ReadingActivity .outcome-next-quest-index option" ).eq( activity.answer_outcome.nextquest ).prop( "selected", true );
		loadStageSelector( $( "#ReadingActivity .outcome-next-activity-index" ) );
		$( "#ReadingActivity .outcome-next-activity-index option" ).val( activity.answer_outcome.nextactivity ).prop( "selected", true );

		$( "#ReadingActivity" ).css( "display", true );
		$( "#AnswerActivity" ).css( "display", false );
	}
	else {
		$( "#AnswerActivity .OutcomesTable .outcome-entry:not(:first-child)" ).remove();

		for ( i = 1; i < activity.answer_outcome.length; i++ ) {
			addOutcome( activity.answer_outcome[i].response );
		}

		for ( j = 0; j < activity.answer_outcome.length; j++ ) {
			$( "#AnswerActivity .outcome-score" ).eq(j).val( activity.answer_outcome[j].score );
			loadStageSelector( $( "#AnswerActivity .outcome-next-activity-index" ).eq(j) );
			$( "#AnswerActivity .outcome-next-quest-index" ).eq(j).find( "option" ).eq( activity.answer_outcome[j].nextquest ).prop( "selected", true );
			loadStageSelector( $( "#AnswerActivity .outcome-next-activity-index" ).eq(j) );
			$( "#AnswerActivity .outcome-next-activity-index" ).eq(j).find( "option" ).eq( activity.answer_outcome[j].nextactivity ).prop( "selected", true );
		}

		$( "#AnswerActivity" ).css( "display", true );
		$( "#ReadingActivity" ).css( "display", false );

		loadOutcomeWidget();
	}
};


function loadOutcomeWidget() {
	CurrentStage = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];

	$( "#AddOutcomeWidget .OutcomeInput" ).remove();
	if ( $( "#SetAnswerOutcome .alert-danger" ).length < 1 ) {
		if ( CurrentStage.answer_field.type == "checklist" ) {
			$( "#AddOutcomeWidget > p" ).after( $( "<ul class='border border-light rounded p-3 OutcomeInput'></ul>" ) );
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
		let newentry = $( "<div class='outcome-entry'></div>" );
		newentry.append( $( "<p/>", 
		{
			class: "outcome-answer",
			text: label
		}));
		newentry.append( $( "<input/>", 
		{
			type: "number",
			class: "outcome-score",
			placeholder: "0"
		}));
		newentry.append( loadQuestSelector( $( "<select/>", { class: "outcome-next-quest-index" })));
		newentry.append( $( "<select/>", { class: "outcome-next-activity-index" }));
	}
};


function loadStageSelector( sel ) {
	sel.empty();

	if ( sel.hasClass( "outcome-next-quest-index" ) ) {
		$.each( CurrentWork.quests, function( q_i, quest ) {
			sel.append( $( "<option/>" ), 
			{
				value: q_i,
				text: quest.quest_title
			});
		});
	}
	else if ( sel.hasClass( "outcome-next-activity-index" ) ) {
		if ( sel.parent().find( "option:selected" ).length ) {
			for ( i = 0; i < CurrentWork.quests[sel.parent().find( "option:selected" ).val()].activities.length; i++ ) {
				sel.append( $( "<option/>", 
				{
					value: i,
					text: "Attività" + i
				}));
			}
		}
	}

	return sel;
};



function saveOutcomesSection() {
	let activity = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];
	activity.answer_outcome = [];
	let section;

	if ( activity.activity_type == "READING" )
		section = $( "#ReadingActivity" );
	else
		section = $( "#AnswerActivity" );

	section.find( ".outcome-entry" ).each( function( this ) {
		activity.answer_outcome.push({
			response: $(this).find( ".outcome-answer" ).text(),
			nextquest: ( $(this).find( ".outcome-next-quest-index option:selected" ).length ? $(this).find( ".outcome-next-quest-index option:selected" ) : null ),
			nextactivity: ( $(this).find( ".outcome-next-activity-index option:selected" ).length ? $(this).find( ".outcome-next-activity-index option:selected" ) : null ),
			score: $(this).find( ".outcome-score" ).val()
		});
	});

	// console.log(CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome); // debugging
	back();
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
			newpreview.attr( "src", media.src );
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

		/*
		if ( media.isFile ) {
			$( "#VideoPreview video" ).toggle(false);
			$( "#Video_Empty" ).toggle(false);

			$( "#Video_IsLoaded p" ).eq( 1 ).html( media.src.name );
			$( "#Video_IsLoaded" ).toggle(true);
		}
		else {
			$( "#Video_IsLoaded" ).toggle(false);
			$( "#Video_Empty" ).toggle(false);

			$( "#VideoPreview video source" ).attr( "src", media.src );
			$( "#VideoPreview video source" ).attr( "type", "video/" + getFileExtension( media.src ) );
			$( "#VideoPreview video" ).toggle(true);
		}

		$( "#VideoDescr" ).val( media.alt );
		*/
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

		/*
		$( "#Video_IsLoaded" ).toggle(false);
		$( "#VideoPreview video" ).toggle(false);
		*/
	}
};


function saveVideoSection() {
	/*
	if ( MediaBuffer.length )
		MediaBuffer[0].alt = $( "#VideoDescr" ).val().replace(/(<([^>]+)>)/gi, "");
	*/
	
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN].content = MediaBuffer;

	back();
};

