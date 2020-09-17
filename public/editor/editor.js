var b = [ false, false, false, false, false ];//true: i è selezionato
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
  function deselect_other_options(i) {
  switch (i) {
    case 3:
      x = i+1;
      break;
    case 4:
      x = i-1;
      break;
    default:
      x=-1;//-1 valore a caso purchè != 0..4
      for(y=0;y<3;y++) {
        if(b[y]==true && y!=i)
          x=y;
      }
  }
    if( b[x] ) {//se è selezionato
      change_color_option("#a"+x,"bg-primary",bgs[x]);
      b[x] = false;
    }
}

  function check_select() {
  if( (b[0] ^ b[1] ^ b[2])  & (b[3] ^ b[4]) )
    $("#dis").removeClass("disabled");
  else
    $("#dis").addClass("disabled");
}

  function select(i) {
  b[i] = !b[i];
  if(b[i]) {
    change_color_option("#a"+i,bgs[i],"bg-primary");
    deselect_other_options(i);
  }
  else
    change_color_option("#a"+i,"bg-primary",bgs[i]);

  check_select();
}

/* ------------------------------- CREAZIONE QUEST E ATTIVITA' ---------------------------------- */


function save_title( which ) {
  switch ( which ) {
    case "story":
      let NewStoryTitle = $( "<div/>",
        {
          id: "StoryTitle"
        });

      if( $( '#StoryTitleInput' ).val() != "" ) {
        NewStoryTitle.text( $( '#StoryTitleInput' ).val() );
      }
      else {
        // se l'input è lasciato vuoto, viene reinserito il titolo NuovaStoria
        $( '#StoryTitleInput' ).val( "NuovaStoria" );
      }

      CurrentWork.story_title = NewStoryTitle.prop( "outerHTML" );
      change_savetitle_button( "saved" );
      break;
    case "quest":
      if (CurrentNavStatus.QuestN < 0) {
        if( $("#NewQuestWidget input").val() != "" ) {
          /* un titolo di default è già presente nel nuovo elemento quest */
          /* quindi viene aggiunto un nuovo titolo solo se l'utente ne ha inserito uno */
          let NewQuestTitle = $( "<div/>",
            {
              "class": "QuestTitle",
              text: $("#NewQuestWidget input").val()
            });

          CurrentWork.quests[n_quests - 1].quest_title = NewQuestTitle.prop( "outerHTML" );
        }
      }
      else {
        let old_title = $( $.parseHTML( CurrentWork.quests[CurrentNavStatus.QuestN].quest_title ) ).text();

        if( $( '#QuestTitleInput' ).val() != "" ) {
          let NewQuestTitle = $( "<div/>",
          {
            "class": "QuestTitle"
          });

          NewQuestTitle.text( $( '#QuestTitleInput' ).val() );

          $("#QuestsGrid .card-text").each( function() {
            if ( $(this).text() == old_title ) {
              $(this).text( NewQuestTitle.text() ); // aggiorna il nome della card
            }
          });

          CurrentWork.quests[CurrentNavStatus.QuestN].quest_title = NewQuestTitle.prop( "outerHTML" );
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


// crea una quest/attività vuota e la aggiunge all'array del json. se si tratta di una quest, crea un nuovo elemento nell'array delle griglie di attività
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
    case "Image":
      CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text.push("<img class='Image'>");
      break;
    case "Gallery":
      CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text.push(`
        <div class="carousel slide Gallery" data-ride="carousel">
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
        </div>`);
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


// cambia il colore di target da decolor a color - funziona in base alle classi di bootstrap
function change_color_option(target,decolor,color) {
  $(target).removeClass(decolor);
  $(target).addClass(color);
};


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

//calcola l'indice della card selezionata, rispetto alla griglia corrente
//la griglia è composta da deck di tre card l'uno
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
  
  parent_element = selected_card.parentNode;//recupera il card deck dove si trova la card
  parent_index = Array.from(document.getElementById(current_grid).children).indexOf(parent_element);//calcola l'indice' del card deck rispetto alla griglia
  card_index_inside_parent = Array.from(parent_element.children).indexOf(selected_card);//calcola l'indice della card rispetto al suo deck
  return ((parent_index)*3 )+card_index_inside_parent;
};


//va alla sezione precedente
function back() {
  switch (CurrentNavStatus.Section) {
    case "EditStory":
    case "EditQuest":
    case "EditActivity":
      stop_shaking();
  }
  mode="default";
  first_selected_stage="";
  if (Parent[CurrentNavStatus.Section] == "EditStory") CurrentNavStatus.QuestN = -1;
  else if (Parent[CurrentNavStatus.Section] == "EditQuest") CurrentNavStatus.ActivityN = -1
  new_go_to_section(Parent[CurrentNavStatus.Section]);
};


//sostituisce goToSection quando ci si sposta in EditStory o EditQuest
function new_go_to_section(where) {
  $("#"+CurrentNavStatus.Section).fadeOut( function() {
    stop_ffs();
    // i change color non funzionano sempre ma non capisco perché
    change_color_option(".SwapBtn", "primary", "secondary");
    change_color_option(".CancelBtn", "primary", "secondary");

    switch (where) {
      case "EditStory":
        $("#StoryTitleInput").val( $( $.parseHTML(CurrentWork.story_title)).text() );
        break;
      case "EditQuest":
        //// BUG: click multiplo fa partire più volte l'onclick e perciò
        //get_card_index, nelle istanze successive alla prima
        //fa riferimento a ActivitiesGrid invece che a QuestsGrid
        if ( CurrentNavStatus.Section == "EditStory" ) CurrentNavStatus.QuestN = get_card_index();

        if (CurrentWork.quests[CurrentNavStatus.QuestN] == "")
          $("#QuestTitleInput").val("Quest" + CurrentNavStatus.QuestN);
        else
          $("#QuestTitleInput").val( $( $.parseHTML(CurrentWork.quests[CurrentNavStatus.QuestN].quest_title)).text() );
  
        node = $(CurrentWork.quests[CurrentNavStatus.QuestN].quest_title);
        $("#EditQuest h1").text(node.text());//inserisci il titolo della quest in EditQuest
        $("#ActivitiesGrid").html(GridsOfActivities[CurrentNavStatus.QuestN]);//carica la griglia delle attività
        break;
      case "EditActivity":
        // riparare lo stesso bug del caso sopra
        if ( CurrentNavStatus.Section == "EditQuest" ) CurrentNavStatus.ActivityN = get_card_index();
        // aggiungere l'aggiornamento del titolo
        $("#ParagraphsGrid").html(GridsOfParagraphs[CurrentNavStatus.QuestN][CurrentNavStatus.ActivityN]);//carica la griglia dei paragrafi/immagini/gallerie
        break;
      case "EditText":
        if (CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[get_card_index()] === undefined )
          $("#TextParInput").val("");
        else
          $("#TextParInput").val($($.parseHTML(CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[get_card_index()])).text());
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


//le card non hanno id e sono associate alle rispettive griglie e quest/activity tramite il loro indice nella giglia in cui si trovano
function create_card(titolo) {
  let current_grid = $( "#" + CurrentNavStatus.Section + " .CardGrid" ).attr( "id" );

  let color;

  switch ( current_grid ) {
    case "QuestsGrid":
      $("#NewQuestWidget").addClass("invisible");
      $("#NewQuestWidget input").val("");
      if (titolo =="") // TODO: AGGIUNGERE CONTROLLO SU TUTTE LE STRINGHE CON SOLO CARATTERI VUOTI
        titolo = "Quest" + ( n_quests - 1 );
      color = colors[n_quests % 6];
      break;
    case "ActivitiesGrid":
      titolo = "Attività" + ( n_activities[CurrentNavStatus.QuestN] - 1 );
      color = colors[n_activities[CurrentNavStatus.QuestN] % 6];
      break;
    case "ParagraphsGrid":
      if ( titolo == "IMMAGINE" ) color = colors[0];
      else if ( titolo == "GALLERY" ) color = colors[5];
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
            switch( $( $(this).attr("id") + ":first-child:first-child" ).text() ) {
              case "IMAGE":
                /* TODO */
                break;
              case "GALLERY":
                /* TODO */
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
        <p class="card-text">`+titolo+`</p>
      </div>
      </div>`;

  // se si tratta di una quest, va aggiunto l'onclick di inizializzazione del val del title input
  if( $("#"+current_grid+" > div:last-child").children().length == 3 || $("#"+current_grid).children().length == 0 ) {
    $("#"+current_grid).append('<div class="card-deck mb-2" ></div>'); //quando il deck attuale non esiste o è vuoto crea  un nuovo deck e mettilo come ultimo figlio della griglia
  }
  
  $("#"+current_grid+" > div:last-child").append(card); //aggiungo la card al deck
  set_stop_animation("swashIn",document.getElementById(current_grid).lastChild.lastChild);
  if (CurrentNavStatus.QuestN >= 0 && CurrentNavStatus.ActivityN < 0) GridsOfActivities[CurrentNavStatus.QuestN] = $("#ActivitiesGrid").html();
  else if (CurrentNavStatus.ActivityN >= 0)
    GridsOfParagraphs[CurrentNavStatus.QuestN][CurrentNavStatus.ActivityN] = $("#ParagraphsGrid").html();
};


// entra o esce dalla cancel mode
function cancel_mode() {
  if (mode == "cancel" ) {
    change_color_option("#" + CurrentNavStatus.Section + " .CancelBtn", "btn-primary", "btn-secondary");
    mode = "default";
    stop_shaking();
  }
  else {
    stop_shaking();
    change_color_option("#" +CurrentNavStatus.Section + " .CancelBtn","btn-secondary","btn-primary");
    if ( mode == "swap" ) {//se swap è attivo disattivalo
      change_color_option("#" +CurrentNavStatus.Section + " .SwapBtn","btn-primary","btn-secondary");
      first_selected_stage="";
    }
    mode = "cancel";
  }
};

function cancel_em(obj) {
  set_stop_animation("swashOut",obj);
  setTimeout( function() {
    switch (CurrentNavStatus.Section) {
      case "EditStory":
        GridsOfActivities.splice(get_card_index(),1);//cancella la griglia associata a q
        GridsOfParagraphs.splice(get_card_index(), 1);
        CurrentWork.quests.splice( get_card_index(), 1 )//cancella la quest associata a q
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

function swap_mode() {
  //esci dalla swap mode
  if(mode == "swap" ) {
    change_color_option("#" +CurrentNavStatus.Section + " .SwapBtn", "btn-primary", "btn-secondary");
    mode = "default";
    first_selected_stage ="";
    stop_shaking();//dovrà prendere un parametro per capire su quale set agire
  }
  else {//entra in swap mode
    stop_shaking();
    change_color_option("#" +CurrentNavStatus.Section + " .SwapBtn","btn-secondary", "btn-primary");
    if( mode == "cancel" )
      change_color_option("#" +CurrentNavStatus.Section + " .CancelBtn","btn-primary","btn-secondary");
    mode = "swap";
  }
};


function swap_em(s) {
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

// blocca lo shaking per tutte le card che lo stanno utilizzando
function stop_shaking() {
  for (card of $("#" + CurrentNavStatus.Section + " .card")) {
    if( card.style.animationName == "shake" )
      set_stop_animation("stop",card);
  }
};

// blocca le animazioni di swap
function stop_ffs() {
  for (card of $("#"+CurrentNavStatus.Section +" .card")) {
    if( card.style.animationName == "tinLeftIn" || card.style.animationName == "tinRightIn" )
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

					let TextInput;
					$( $( "#AnswerFieldPreview" ).find( "label" ) ).each( function( index ) {
						if ( $( this ).text() == CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].right_answer ) {
							$( this ).prev().prop( "checked", true );

						}

						TextInput = $( "<input/>",
							{
								type: "text",
								val: $( this ).text()
							}
						);

						$( this ).replaceWith( TextInput );
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

function toggle_ActivityN_input(box) {
  if ( box.prop("checked") )
    $(box.parent().next().children().first()).attr("disabled", true);
  else
  $(box.parent().next().children().first()).attr("disabled", false);
};


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
    </tr>
    <tr>
      <td><em>Riposta corretta</em></td>
      <td><input type="checkbox" onclick="toggle_ActivityN_input($(this))"></td>
      <td><input type="number" id="correct" placeholder="0" min="0"></td>
      <td></td>
    </tr>
    <tr>
      <td><em>Risposta errata</em></td>
      <td><input type="checkbox" onclick="toggle_ActivityN_input($(this))"></td>
      <td><input type="number" id="wrong" placeholder="0" min="0"></td>
      <td></td>
    </tr>
    <tr>
      <td><em>Tempo scaduto</em></td>
      <td><input type="checkbox" onclick="toggle_ActivityN_input($(this))"></td>
      <td><input type="number" id="expired" placeholder="0" min="0"></td>
      <td></td>
    </tr>`
  ));

  // disabilitare/abilitare anche la checkbox
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
          tr.append( $.parseHTML( '<td><input type="checkbox" onclick="toggle_ActivityN_input($(this))"></td>' ) );
          tr.append( ( $( "<input/>",
          {
            id: String( prop ) + "Outcome",
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


function addOutcome() {
  let newtr = $( "<tr/>" );
  newtr.append( $.parseHTML( "<td>" + $( "#AddOutcomeWidget input" ).val() + "</td>" ) );
  newtr.append( $.parseHTML( '<td><input type="checkbox" onclick="toggle_ActivityN_input($(this))"></td>' ) );
  newtr.append( ( $( "<input/>",
  {
    id: $( "#AddOutcomeWidget input" ).val() + "Outcome", // aggiunta "Outcome" per evitare in qualsiasi modo un ID doppio
    type: "number",
    placeholder: 0,
    min: 0
  })).wrap( "<td></td>" ).parent());
  newtr.append( $.parseHTML( `<td><button class="btn btn-danger" onclick="$(this).parent().parent().remove()">Cancella</button></td>` ) );
  $( "#OutcomesTable" ).append( newtr );
};


function saveOutcomes() {
  let newobj = {};

  let next;
  let answer;

  $( "#OutcomesTable input[type=number]" ).each( function( index ) {
    if ( $(this).parent().prev().children().first().prop( "checked" ) )
      next = "nextquest";
    else
      next = $(this).val();

    answer= $(this).attr( "id" );
    answer = answer.replace("Outcome", "");
  
    switch ( answer ) {
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
        newobj[answer] = next;
    }
  });

  CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome = newobj;
  console.log(newobj); // debugging
  back();
};

