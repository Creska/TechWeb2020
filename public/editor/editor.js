var b = [ false, false, false, false, false ]; // true: b[i] è selezionato
var bgs = [ "bg-secondary", "bg-secondary", "bg-secondary", "bg-success", "bg-danger"];
var colors = [ "primary", "secondary", "warning", "success", "danger", "info" ];
var n_quests = 0; // numero di quest totali - equivalente a CurrentWork.quests.length
var n_activities = []; // numero di attività per ogni quest - equivalente a CurrentWork.quests[CurrentNavStatus.QuestN].activities.length
var mode = "default";
var first_selected_stage = "";//per lo swap
var first_selected_card_index = -1;
var selected_card = "";//indica l'ultima carta cliccata dall'utente
var GridsOfActivities = []; // contiene le griglie di attività per ogni quest
var GridsOfParagraphs = []; // contiene tutte le griglie di paragrafi

/* indica, per ogni sezione, quella genitore - gli identificatori sono gli id html */
var Parent = {
	MainMenu: "MainMenu",
  ChooseGameMode: "MainMenu",
  EditStory: "ChooseGameMode",
	EditQuest: "EditStory",
	EditActivity: "EditQuest",
	EditAnswerField: "EditActivity",
  EditText: "EditActivity",
  EditGallery: "EditActivity",
  SetAnswerOutcome: "EditActivity"
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
	story_title: "<div id='StoryTitle'>NuovaStoria</div>",
	story_ID: -1,
	game_mode: "",
	single_device: 1,
	quests: [],
	stylesheet: "",
	score: []
};


/* -------------------------- ROBA DEL GAME MODE MENU ---------------- */
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
}


/**
 * Controlla che siano selezionate le opzioni necessarie per far partire l'editing della storia
 */
function check_select() {
  if( (b[0] ^ b[1] ^ b[2]) && (b[3] ^ b[4]) )
    $( "#StartEditing" ).removeClass( "disabled" );
  else
    $( "#StartEditing" ).addClass( "disabled" );
}

/**
 * @param i --> numero del pulsante
 * Seleziona il pulsante con indice i e deseleziona tutti gli altri
 */
function select( i ) {
  b[i] = !b[i];

  if( b[i] ) {
    change_color_option( "#a" + i, bgs[i], "bg-primary" );
    deselect_other_options( i );
  }
  else
    change_color_option( "#a" + i, "bg-primary", bgs[i] );

  check_select();
}

/* ------------------------------- CREAZIONE QUEST E ATTIVITA' ---------------------------------- */

/**
 * @param which
 * Salva il titolo della storia o della quest
 */
function save_title( which ) {
  switch ( which ) {
    case "story":
      if( ($( '#StoryTitleInput' ).val()).trim() != "" ) {
        CurrentWork.story_title = "<div id='StoryTitle'>" + $( '#StoryTitleInput' ).val() + "</div>";
      }
      else {
        // se l'input è lasciato vuoto, viene reinserito il titolo NuovaStoria
        $( '#StoryTitleInput' ).val( "NuovaStoria" );
      }

      change_savetitle_button( "saved" );
      break;
    case "quest":
      if (CurrentNavStatus.QuestN < 0) {
        if( ($("#NewQuestWidget input").val()).trim() != "" ) {
          /* un titolo di default è già presente nel nuovo elemento quest
          quindi viene aggiunto un nuovo titolo solo se l'utente ne ha inserito uno */
          CurrentWork.quests[n_quests - 1].quest_title = "<div class='QuestTitle'>" + $("#NewQuestWidget input").val() + "</div>";
        }
      }
      else {
        let old_title = $( $.parseHTML( CurrentWork.quests[CurrentNavStatus.QuestN].quest_title ) ).text();

        if ( ($( '#QuestTitleInput' ).val()).trim() != "" ) {
          let NewQuestTitle = ( $( '#QuestTitleInput' ).val() );

          // aggiorna il nome della card
          $("#QuestsGrid .card-text").each( function() {
            if ( $(this).text() == old_title ) {
              $(this).text( NewQuestTitle );
            }
          });

          CurrentWork.quests[CurrentNavStatus.QuestN].quest_title = "<div class='QuestTitle'>" + NewQuestTitle + "</div>";
        }
        else {
          // se l'input è lasciato vuoto, viene reinserito il titolo vecchio
          $( '#QuestTitleInput' ).val( old_title );
        }

        change_savetitle_button( "saved" );
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
      n_quests += 1;
      CurrentWork.quests.push(initQuest());
      n_activities.push(0);
      GridsOfActivities.push("");
      GridsOfParagraphs.push([]);
      save_title("quest");
      break;
    case "activity":
      n_activities[CurrentNavStatus.QuestN] += 1;
      CurrentWork.quests[CurrentNavStatus.QuestN].activities.push(initActivity());
      GridsOfParagraphs[CurrentNavStatus.QuestN].push("");
      break;
    case "TextParagraph":
      CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text.push("<p class='TextParagraph'></p>");
      break;
    case "Gallery":
      CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text.push("");
      break;
    default:
      handleError();
  }
};


/**
 * Inizializza un oggetto quest vuoto per il JSON
 */
function initQuest() {
	let EmptyQuest = {	
		quest_title: "",
		activities: []
  };
  
  EmptyQuest.quest_title = "<div class='QuestTitle'>" + "Quest" + String(n_quests-1) + "</div>";

	return EmptyQuest;
};


/**
 * Inizializza un oggetto attività vuoto per il JSON
 */
function initActivity() {
	let EmptyActivity = {
		activity_text: [],
		answer_field: "",
		right_answer: "",
		answer_score: "",
		answer_outcome: {},
		ASK_EVAL: 0,
		GET_CHRONO: 0,
		expected_time: 0
	};

	return EmptyActivity;
};


/* -------------------------------- GESTIONE INTERFACCIA ------------------------------- */

/**
 * @param mode --> modalità in cui si trova la gestione delle card
 * Gestisce il pulsante di salvataggio, segnalando quando il save è stato eseguito
 */
function change_savetitle_button( mode ) {
  let btn;

  switch ( CurrentNavStatus.Section ) {
    case "EditStory":
      btn = $( "#SaveStoryTitle" );
      break;
    case "EditQuest":
      btn = $( "#SaveQuestTitle" );
      break;
    default:
      handleError();
      break;
  }

  if ( mode == 'saved' ) {
    btn.removeClass("bg-primary");
    btn.addClass("bg-success");
    btn.text("Salvato!");
  }
  else if ( mode == 'unsaved' ) {
    btn.removeClass('bg-success');
    btn.addClass('bg-primary');
    btn.text('Salva');
  }
};


/**
 * @param target
 * @param decolor --> colore iniziale
 * @param color --> colore finale
 * Cambia il colore dell'elemento target. Funziona in base alle classi di colori di bootstrap
 */
function change_color_option(target, decolor, color) {
  $(target).removeClass(decolor);
  $(target).addClass(color);
};


/**
 * @param current --> animazione corrente di obj
 * @param obj --> elemento oggetto della chiamata
 * Cambia le animazioni dell'oggetto indicato
 */
function set_stop_animation( current, obj ) {
  switch( current ) {
    case "shake":
      obj.style.animationName = current;
      obj.style.animationIterationCount = "infinite";
      obj.style.animationDuration = "0.5s";
      break;
    case "stop":
      obj.style.animationName = "initial";
      break;
    case "puffOut":
      obj.style.animationName = current;
      obj.style.animationIterationCount = "initial";
      obj.style.animationDuration = "1s";
      setTimeout(function () {
        obj.style.animationName = "initial";
      }, 1500);
      break;
    case "swashOut":
      obj.style.animationName = current;
      obj.style.animationIterationCount = "initial";
      obj.style.animationDuration = "1.5s";
      break;
    case "swashIn":
      obj.style.animationName = current;
      obj.style.animationIterationCount = "initial";
      obj.style.animationDuration = "0.75s";
      setTimeout(function () {
        obj.style.animationName = "initial";
      }, 1250);
      break;
    default:
      obj.style.animationName = current;
      obj.style.animationIterationCount = "initial";
      obj.style.animationDuration = "1s";
      /*
      setTimeout(function () {
        quest.style.animationName = "initial";
      }, 1400); */
      break;
  }
};


/** 
 * Calcola l'indice dell'ultima card selezionata, rispetto alla griglia corrente
 * La griglia è composta da deck di tre card l'uno
*/
function get_card_index() {
  let current_grid;
  
  switch (CurrentNavStatus.Section) {
    case "EditStory":
    case "EditQuest":
      current_grid = $( "#" + CurrentNavStatus.Section + " .CardGrid" ).attr( "id" );
      break;
    case "EditActivity":
    case "EditText":
    case "EditImage":
    case "EditGallery":
    case "EditAnswerField":
      current_grid = $( "#EditActivity .CardGrid" ).attr( "id" );
  }
  
  let deck = selected_card.parentNode; // recupera il deck dove si trova la card
  let deck_index = Array.from( document.getElementById( current_grid ).children ).indexOf( deck ); // calcola l'indice del deck rispetto alla griglia
  let card_index_inside_parent = Array.from( deck.children ).indexOf( selected_card ); // calcola l'indice della card rispetto al suo deck
  return ( deck_index * 3 ) + card_index_inside_parent;
};


/**
 * Torna alla sezione precedente
*/
function back() {
  switch (CurrentNavStatus.Section) {
    case "EditStory":
    case "EditQuest":
    case "EditActivity":
      stop_shaking();
  }
  first_selected_stage="";
  new_go_to_section(Parent[CurrentNavStatus.Section]);
};


/**
 * @param where
 * Porta alla sezione specificata, facendo tutti i caricamenti necessari
 */
function new_go_to_section(where) {
  $("#"+CurrentNavStatus.Section).fadeOut( function() {
    mode = "default";
    stop_shaking();
    // i change color non funzionano sempre ma non capisco perché
    change_color_option(".SwapBtn", "primary", "secondary");
    change_color_option(".CancelBtn", "primary", "secondary");

    switch ( where ) {
      case "EditStory":
        CurrentNavStatus.QuestN = -1;
        $("#StoryTitleInput").val( $( $.parseHTML(CurrentWork.story_title)).text() );
        break;
      case "EditQuest":
        CurrentNavStatus.ActivityN = -1;
        //// BUG: click multiplo fa partire più volte l'onclick e perciò
        //get_card_index, nelle istanze successive alla prima
        //fa riferimento a ActivitiesGrid invece che a QuestsGrid
        if ( CurrentNavStatus.Section == "EditStory" ) CurrentNavStatus.QuestN = get_card_index();

        $("#QuestTitleInput").val( $($.parseHTML(CurrentWork.quests[CurrentNavStatus.QuestN].quest_title)).text() );
        $("#EditQuest h1").text( $($.parseHTML(CurrentWork.quests[CurrentNavStatus.QuestN].quest_title)).text() );

        $("#ActivitiesGrid").html(GridsOfActivities[CurrentNavStatus.QuestN]); //carica la griglia delle attività
        break;
      case "EditActivity":
        // riparare lo stesso bug del caso sopra
        if ( CurrentNavStatus.Section == "EditQuest" ) CurrentNavStatus.ActivityN = get_card_index();
        // aggiungere l'aggiornamento del titolo
        $("#ParagraphsGrid").html(GridsOfParagraphs[CurrentNavStatus.QuestN][CurrentNavStatus.ActivityN]); //carica la griglia dei paragrafi/immagini/gallerie
        break;
      case "EditText":
        $("#TextParInput").val($($.parseHTML(CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[get_card_index()])).text());
        break;
      case "EditGallery":
        loadEditGallerySection();
        break;
      case "EditAnswerField":
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
      case "SetAnswerOutcome":
        loadEditOutcomeSection();
        break;
      default:
        handleError();
        break;
    }
    
    CurrentNavStatus.Section = where;
    if ( (where == "EditStory") || (where == "EditQuest") ) change_savetitle_button("saved");
    $("#"+where).fadeIn();
  });
};


/**
 * @param titolo
 * Crea una card con tutti i parametri adeguati e la aggiunge al deck
 */
function create_card(titolo) {
  let current_grid = $( "#" + CurrentNavStatus.Section + " .CardGrid" ).attr( "id" );

  let color;

  switch ( current_grid ) {
    case "QuestsGrid":
      $("#NewQuestWidget").addClass("invisible");
      $("#NewQuestWidget input").val("");
      if ( titolo.trim() == "" )
        titolo = "Quest" + ( n_quests - 1 );
      color = colors[n_quests % 6];
      break;
    case "ActivitiesGrid":
      titolo = "Attività" + ( n_activities[CurrentNavStatus.QuestN] - 1 );
      color = colors[n_activities[CurrentNavStatus.QuestN] % 6];
      break;
    case "ParagraphsGrid":
      if ( titolo == "GALLERY" ) color = colors[0];
      else color = colors[1];
      break;
    default:
      handleError();
      break;
  }

  card = `<div class="card bg-` + color + `" onclick='
    selected_card = this;
    switch(mode) {
      case "swap":
        swap_em(this);
        break;
      case "cancel":
        if( this.style.animationName == "shake" )
          cancel_em(this);
        else
          set_stop_animation("shake", this);
        break;
      default:
        set_stop_animation("puffOut", this);
        setTimeout(function () {
          if (CurrentNavStatus.Section == "EditStory")
            new_go_to_section("EditQuest");
          else if (CurrentNavStatus.Section == "EditQuest")
            new_go_to_section("EditActivity");
          else if (CurrentNavStatus.Section == "EditActivity") {
            switch( $(selected_card).find(".card-text").prop("innerHTML") ) {
              case "GALLERY":
                new_go_to_section("EditGallery");
                break;
              default:
                new_go_to_section("EditText");
                break;
            }
          }
        }, 750);
        break;
    }'>
      <div class="card-body text-center">
        <p class="card-text">` + titolo + `</p>
      </div>
    </div>`;

  // quando il deck attuale non esiste o è vuoto, crea un nuovo deck e lo mette come ultimo figlio della griglia
  if ( $("#"+current_grid+" > div:last-child").children().length == 3 || $("#"+current_grid).children().length == 0 )
    $("#"+current_grid).append('<div class="card-deck mb-2" ></div>');
  
  $("#"+current_grid+" > div:last-child").append(card); // aggiunge la card al deck
  set_stop_animation("swashIn",document.getElementById(current_grid).lastChild.lastChild);

  if (CurrentNavStatus.QuestN >= 0 && CurrentNavStatus.ActivityN < 0)
    GridsOfActivities[CurrentNavStatus.QuestN] = $("#ActivitiesGrid").html();
  else if (CurrentNavStatus.ActivityN >= 0)
    GridsOfParagraphs[CurrentNavStatus.QuestN][CurrentNavStatus.ActivityN] = $("#ParagraphsGrid").html();
};


/**
 * Entra o esce dalla cancel mode
 */
function cancel_mode() {
  if (mode == "cancel" ) {
    change_color_option("#" + CurrentNavStatus.Section + " .CancelBtn", "btn-primary", "btn-secondary");
    mode = "default";
    stop_shaking();
  }
  else {
    stop_shaking();
    change_color_option("#" +CurrentNavStatus.Section + " .CancelBtn","btn-secondary","btn-primary");
    // eventualmente disattiva la modalità di swap
    if ( mode == "swap" ) {
      change_color_option("#" +CurrentNavStatus.Section + " .SwapBtn","btn-primary","btn-secondary");
      first_selected_stage="";
    }
    mode = "cancel";
  }
};


/**
 * @param obj
 * Cancella l'oggetto specificato
 */
function cancel_em(obj) {
  set_stop_animation("swashOut",obj);
  setTimeout( function() {
    switch (CurrentNavStatus.Section) {
      case "EditStory":
        GridsOfActivities.splice(get_card_index(),1); //cancella la griglia associata a q
        GridsOfParagraphs.splice(get_card_index(), 1);
        CurrentWork.quests.splice( get_card_index(), 1 ); //cancella la quest associata a q
        n_quests -= 1;
        n_activities.splice(CurrentNavStatus.QuestN, 1);
        break;
      case "EditQuest":
        GridsOfParagraphs[CurrentNavStatus.QuestN].splice(get_card_index(), 1);
        CurrentWork.quests[CurrentNavStatus.QuestN].activities.splice(get_card_index(), 1);
        n_activities[CurrentNavStatus.QuestN] -= 1;
        break;
      case "EditActivity":
        CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[get_card_index()];
        break;
      default:
        handleError();
        break;
    }

    // sistemazione dei decks
    iter = obj.parentElement;// iter deck padre di q
    if( iter.children.length == 1 )// se iter ha solo la card selezionata, elimina iter
      iter.remove();
    else {
      obj.remove();
      //il resto di questo else fa in modo che dopo la rimozione di q, il resto della griglia "slitti" in modo appropriato
      while( !( iter == iter.parentElement.lastChild ) ) {
        set_stop_animation("stop",iter.nextElementSibling.firstChild);
        iter.appendChild( iter.nextElementSibling.firstChild );
        iter = iter.nextElementSibling;
      }
      if( iter.children.length == 0 )
        iter.remove();
    }
  }, 1500);
};


/**
 * Entra o esce dalla swap mode
 */
function swap_mode() {
  if(mode == "swap" ) {
    change_color_option("#" +CurrentNavStatus.Section + " .SwapBtn", "btn-primary", "btn-secondary");
    mode = "default";
    first_selected_stage ="";
    stop_shaking(); //dovrà prendere un parametro per capire su quale set agire --> ?????
  }
  else {
    stop_shaking();
    change_color_option("#" +CurrentNavStatus.Section + " .SwapBtn","btn-secondary", "btn-primary");
    // eventualmente disattiva la madalità di cancel
    if( mode == "cancel" )
      change_color_option("#" +CurrentNavStatus.Section + " .CancelBtn","btn-primary","btn-secondary");
    mode = "swap";
  }
};


/**
 * @param s --> card selezionata
 * Scambia le due card selezionate
 */
function swap_em(s) {
  // se c'è già una prima card selezionata, procede con lo scambio tra essa e quella associata ad "s" (che ha triggerato l'evento)
  if(first_selected_stage) {
    //fai lo swap tra s e first_selected_stage, poi imposta first_selected_stage=""
    set_stop_animation("tinLeftOut",first_selected_stage);
    set_stop_animation("tinRightOut",s);
    setTimeout(function () {
      set_stop_animation("tinRightIn",first_selected_stage);
      set_stop_animation("tinLeftIn",s);

      if (CurrentNavStatus.Section =="EditStory") {//swappa anche le quest e le griglie associate
        [CurrentWork.quests[get_card_index()], CurrentWork.quests[first_selected_card_index]] =[CurrentWork.quests[first_selected_card_index],CurrentWork.quests[get_card_index()]];
        [GridsOfActivities[get_card_index()], GridsOfActivities[first_selected_card_index]] =[GridsOfActivities[first_selected_card_index],GridsOfActivities[get_card_index()]];
        [GridsOfParagraphs[get_card_index()], GridsOfParagraphs[first_selected_card_index]] = [GridsOfParagraphs[first_selected_card_index], GridsOfParagraphs[get_card_index()]];

        let swtmp = n_activities[first_selected_card_index];
        n_activities[first_selected_card_index] = n_activities[get_card_index()];
        n_activities[get_card_index()] = swtmp;
      }
      else if (CurrentNavStatus.Section == "EditQuest") {
        [CurrentWork.quests[CurrentNavStatus.QuestN].activities[get_card_index()], CurrentWork.quests[CurrentNavStatus.QuestN].activities[first_selected_card_index]] =[CurrentWork.quests[CurrentNavStatus.QuestN].activities[first_selected_card_index],CurrentWork.quests[CurrentNavStatus.QuestN].activities[get_card_index()]];

        [GridsOfParagraphs[CurrentNavStatus.QuestN][get_card_index()], GridsOfParagraphs[CurrentNavStatus.QuestN][first_selected_card_index]] =[GridsOfParagraphs[CurrentNavStatus.QuestN][first_selected_card_index], GridsOfParagraphs[CurrentNavStatus.QuestN][get_card_index()]];
      }
      else if (CurrentNavStatus.Section == "EditActivity") {
        [CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.QuestN].activity_text[get_card_index()], CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.QuestN].activity_text[first_selected_card_index]] = [CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.QuestN].activity_text[first_selected_card_index], CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.QuestN].activity_text[get_card_index()]];
      }

      //scambia le card
      let tmp = s;
      s.outerHTML = first_selected_stage.outerHTML;
      first_selected_stage.outerHTML = tmp.outerHTML;
      first_selected_stage_index = -1;
      first_selected_stage = "";

    },1000);
  }
  else {
    //se la card selezionata è la prima, impostala come tale e falla shakerare
    set_stop_animation("shake",s);
    first_selected_stage = s;
    first_selected_card_index = get_card_index();
  }
};


/**
 * Blocca l'animazione di shaking per tutte le card che la stanno utilizzando
 */
function stop_shaking() {
  for (card of $("#" + CurrentNavStatus.Section + " .card")) {
    if( card.style.animationName == "shake" )
      set_stop_animation("stop",card);
  }
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
					break;
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


/**
 * Salva tutte le personalizzazioni che l'utente ha creato per il Campo risposta
 */
function saveAnswerFieldSettings() {
	saveRightAnswer();

	if ( $( "#QuestionType_Checklist" ).prop( "checked" ) ) {
		let InputLabel;
		$( "#AnswerFieldPreview [type='text']" ).each( function( index ) {
			InputLabel = $( "<label/>",
			{
				for: "AnswerOption" + String( index )
			});

			if ( $( this ).val() == "" ) {
				InputLabel.text( "Opzione" + String( index ) );
			}
			else {
				InputLabel.text( $( this ).val() );
			}

			$( this ).replaceWith( InputLabel );
		});
	}
	
	saveDataFragment( "answer_field", 0 );
	saveDataFragment( "expected_time", $( "#AnswerTimer" ).val() * 60000 );
	saveDataFragment( "answer_score", $( "#AnswerScore" ).val() );
	saveDataFragment( "GET_CHRONO", $( "#InsertTimer" ).prop( "checked" ) );
	saveDataFragment( "ASK_EVAL", $( "#NeedEvaluation" ).prop( "checked" ) );

	back();
};


/**
 * Carica la sezione di editing dell'outcome dell'attività, in base ai parametri settati nella sezione dell'Answer Field e a ciò che è già stato salvato nel JSON
 */
function loadEditOutcomeSection() {
  let CurrentStage = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];
  $('#AddOutcomeWidget input').val('');

  let OutcomeAlert = $( "<div/>",
  {
    "class": "alert alert-danger",
    role: "alert"
  });

  // componiamo il recap
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

  // caricamento della Tabella degli Outcomes
  $( "#OutcomesTable" ).empty();
  $( "#OutcomesTable" ).append( $.parseHTML(`
    <tr>
      <th>Risposta / Evento</th>
      <th>Passa alla quest successiva</th>
      <th>Attività su cui spostarsi</th>
      <th>Rimuovi</th>
    </tr>`
  ));
  addOutcome("<em>Riposta corretta</em>", "correct");
  addOutcome("<em>Risposta errata</em>", "wrong");
  addOutcome("<em>Tempo scaduto</em>", "expired");

  // disabilita/abilita gli input riguardanti il tempo scaduto, in base alla decisione di abilitare il timer
  if ( CurrentStage.GET_CHRONO ) $( "#OutcomesTable tr:nth-child(4) input" ).attr( "disabled", false );
  else $( "#OutcomesTable tr:nth-child(4) input" ).attr( "disabled", true );

  let tr;

  for ( const[prop,val] of Object.entries( CurrentStage.answer_outcome ) ) {
    switch ( prop ) {
      case "RightAnswer":
        tr = $( "#OutcomesTable tr:nth-child(2)" );
        break;
      case "WrongAnswer":
        tr = $( "#OutcomesTable tr:nth-child(3)" );
        break;
      case "TimeExpired":
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
  let newobj = {};

  let next;
  let label;

  $( "#OutcomesTable input[type=number]" ).each( function( index ) {
    if ( $(this).parent().prev().children().first().prop( "checked" ) )
      next = "nextquest";
    else
      next = $(this).val();

    label = $(this).attr("id");
  
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
        newobj[$(this).parent().parent().children().first().prop("innerHTML")] = next;
    }
  });

  CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome = newobj;
  // console.log(newobj); // debugging
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
}


/**
 * @param image
 * @param newload --> segnala se l'oggetto è al suo primo caricamento o se era già presente nel json
 * Carica una nuova immagine nella gallery di anteprima
 */
function addImage( image, newload ) {
  let newrow = $( "<div class='row'></div>" );

  let newpreview;

  if (newload) {
    newpreview = $( "<img class='ImgPreview'>" );

    const reader = new FileReader();
    reader.readAsDataURL(image);
      
    reader.addEventListener("load", function() {
      newpreview.attr( "src", this.result );
    });
  }
  else {
    newpreview = $(image).clone(); // usata clone() perché senza sarebbe stato modificato direttamente l'oggetto passato come parametro ad addImage()
    newpreview.attr("class", "ImgPreview");
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

    CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[get_card_index()] = $("#GalleryPreview .row img").first().prop("outerHTML");
  }
  else {
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
 * @param name
 * Restituisce l'estensione del file specificato
 */
function getFileExtension( name ) {
  let i = name.lastIndexOf(".");
  if (i > -1)
    return name.slice((i - 1 >>> 0) + 2);
  else
    return "null";
};