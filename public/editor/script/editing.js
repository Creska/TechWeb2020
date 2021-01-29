var gm_b = [ false, false, false ]; // se gm_b[0] è true --> #gm0 è selezionato 
var before_section; //to know where to go from graph section
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
  
		breadcrumbs();
  
		change_color_option( "#SaveStoryTitle", "btn-primary", "btn-success" );
		$( "#SaveStoryTitle" ).text( "Salvato!" );
		break;
	  case "quest":
		if (CurrentNavStatus.QuestN < 0) {
		  title = $("#NewQuestWidget input").val().trim().replace(/(<([^>]+)>)/gi, "");
		  CurrentWork.quests[CurrentWork.quests.length - 1].quest_title = title;
		}
		else {
		  title = $( '#QuestTitleInput' ).val().trim().replace(/(<([^>]+)>)/gi, "");

		  CurrentWork.quests[CurrentNavStatus.QuestN].quest_title = title;
		  breadcrumbs();
  
		  // aggiorna il nome della card
		  if ( title )
			$( "#QuestsGrid .card-title strong" ).eq( CurrentNavStatus.QuestN ).html( title );
		  else
			$( "#QuestsGrid .card-title strong" ).eq( CurrentNavStatus.QuestN ).html( "<em>QuestSenzaNome</em>" );
  
		  CurrentWork.QuestGrid = $( "#QuestsGrid" ).html();
  
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
		  quest_id: get_new_id("quest"),
		  activities: []
	};
  
	  return EmptyQuest;
  };
  
  function get_new_id(which) {
	let id;
	let not_unique = false;
	switch (which) {
		case "quest":
			do {
				id = "Q"+ Math.floor(Math.random() * 1000).toString();//generate number from 0 to 999 
				for(i=0;i <CurrentWork.quests.length;i++ ){
					if(CurrentWork.quests[i].quest_id == id) {
						not_unique = true;
						break;
					}
				}
			}while(not_unique);
			break;
		case "activity":
			do {
				id = CurrentWork.quests[CurrentNavStatus.QuestN].quest_id+"A"+Math.floor(Math.random() * 1000).toString();//generate number from 0 to 999 
				for(i=0;i <CurrentWork.quests[CurrentNavStatus.QuestN].activities.length;i++ ){
					if(CurrentWork.quests[CurrentNavStatus.QuestN].activities[i].activity_id == id) {
						not_unique = true;
						break;
					}
				}
			}while(not_unique);
			break;
	}
	return id;
}
  /**
   * Inizializza un oggetto attività vuoto per il JSON
   */
  function initActivity() {
	  let EmptyActivity = {
	  activity_id: get_new_id("activity"),
	  activity_text: [],
	  activity_type: "ANSWER",
		  answer_field: {
		description: "",
		type: "",
		options: []
	  },
		  answer_outcome: [{
			  condition: null,
			  next_quest_id: "",
			  next_activity_id: "",
			  score: null
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
		case "Graph":
			goToSection( before_section );
			break;
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
	
	if( where == "MainMenu" || where == "final_section" || where == "ChooseStoryToEdit") {
		$('.masthead').fadeOut();
		$( "#breadcrumbs" ).fadeOut();
	}
	  
	/* cambia sezione */

	$( "#" + CurrentNavStatus.Section ).fadeOut( function() {
	  change_color_option(".SwapBtn", "btn-primary", "btn-secondary");
	  change_color_option(".CancelBtn", "btn-primary", "btn-secondary");
  
	  switch ( where ) {
		case "Graph":
		  before_section = CurrentNavStatus.Section;
		  break;
		case "MainMenu":
			$( "#breadcrumbs" ).fadeOut();
		  break;
		case "EditStory":
		  $('.masthead').fadeIn();
		  $( "#breadcrumbs" ).fadeIn();
  
		  $( "#ErrorList" ).empty();
		  $( "#StoryTitleInput" ).val( CurrentWork.story_title );
		  change_color_option( "#SaveStoryTitle", "btn-primary", "btn-success" );
		  $( "#SaveStoryTitle" ).text( "Salvato!" );
  
		  $( "#QuestsGrid" ).html( String(CurrentWork.QuestGrid) );
		  break;
		case "ChooseGameMode":
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
  
		  /* sistemazione pulsanti e widgets */
		  $( "#ChooseActivityType" ).css( "display", "none" );
		  $( "#MainOutcomeWidget" ).css( "display", "none" );

		  let activity = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];
		  if ( activity.activity_type == "READING" ) {
			$( "#EditActivity .p-3" ).first().find( ".btn-secondary:nth-child(2n)" ).attr( "disabled", true );
  
			if ( activity.FINAL )
			  $( "#EditActivity .p-3" ).first().find( ".btn-secondary:nth-child(3)" ).attr( "disabled", true );
			else
			  $( "#EditActivity .p-3" ).first().find( ".btn-secondary:nth-child(3)" ).attr( "disabled", false );
		  }
		  else {
			$( "#EditActivity .p-3" ).first().find( ".btn-secondary" ).attr( "disabled", false );
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
  
		  $( "#TextParInput" ).val( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN].content );
		  break;
		case "EditGallery":
		  CurrentNavStatus.TextPartN = get_card_index();
		  if ( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN] === undefined ) {
			handleError();
			return;
		  }
  
		  loadEditGallerySection();
		  break;
		case "VideoSection":
			CurrentNavStatus.TextPartN = get_card_index();
			if ( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN] === undefined ) {
				handleError();
				return;
			}

			loadVideoSection();
			break;
		case "EditAnswerField":
		  loadEditAnswerFieldSection();
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
	  breadcrumbs();
	  $("#"+where).fadeIn();
	  
	});
};


function breadcrumbs() {
	switch ( CurrentNavStatus.Section ) {
		case "EditStory":
		case "ChooseGameMode":
			$( "#breadcrumbs ol li:not(:first-child)" ).remove();

			if ( CurrentWork.story_title )
				$( "#breadcrumbs ol li" ).first().text( CurrentWork.story_title );
			else
				$( "#breadcrumbs ol li" ).first().html( "<em>StoriaSenzaNome</em>" );
			break;
		case "EditQuest":
			let quest = CurrentWork.quests[CurrentNavStatus.QuestN]
			$( "#breadcrumbs ol li:not(:first-child)" ).remove();

			if ( quest.quest_title )
				$( "#breadcrumbs ol" ).append( $( "<li class='breadcrumb-item'/>" ).text( quest.quest_title + " - (" + quest.quest_id + ")" ) );
			else
				$( "#breadcrumbs ol" ).append( $( "<li class='breadcrumb-item'/>" ).html( "<em>QuestSenzaNome</em>" + "&nbsp;- (" + quest.quest_id + ")" ) );
			break;
		case "EditActivity":
		case "EditAnswerField":
		case "OutcomesSection":
			let activity = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];
			$( "#breadcrumbs ol li:nth-child(n+3)" ).remove();
			$( "#breadcrumbs ol" ).append( $( "<li class='breadcrumb-item'/>" ).text( "Attività " + activity.activity_id ) );
			break;
		case "EditText":
		case "EditGallery":
		case "VideoSection":
			$( "#breadcrumbs ol" ).append( $( "<li class='breadcrumb-item'/>" ).text( "parte " + CurrentNavStatus.TextPartN ) );
	}
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
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome = [{
					condition: null,
					next_quest_id: "",
					next_activity_id: "",
					score: null
				}];
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_type = "ANSWER";
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].FINAL = false;
				$( "#EditActivity .p-3" ).first().find( ".btn-secondary" ).attr( "disabled", false );
			}
			break;
		case "ActivityType1":
			if ( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_type != "READING" ) {
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome = [{
					condition: null,
					next_quest_id: "",
					next_activity_id: "",
					score: null
				}];
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_type = "READING";
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].FINAL = false;
				$( "#EditActivity .p-3" ).first().find( ".btn-secondary:nth-child(2n)" ).attr( "disabled", true );
				$( "#EditActivity .p-3" ).first().find( ".btn-secondary:nth-child(3)" ).attr( "disabled", false );
			}
			break;
		case "ActivityType2":
			if ( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].FINAL == false ) {
				// segna tutte le altre attività come non finali
				CurrentWork.quests.forEach( function( q, i ) {
					q.activities.forEach( function( a, j ) {
						a.FINAL = false;
						a.answer_outcome = [{
							condition: null,
							next_quest_id: "",
							next_activity_id: "",
							score: null
						}];
					});
			  	});
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_type = "READING";
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].FINAL = true;
				CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome = [];
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

