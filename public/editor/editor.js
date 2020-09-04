var b = [ false, false, false, false, false ];//true: i è selezionato
var bgs = [ "bg-secondary", "bg-secondary", "bg-secondary", "bg-success", "bg-danger"];
var colors = [ "primary", "warning", "success", "danger", "dark", "info" ];
var n_quests = 0; // numero di quest totali - equivalente a CurrentWork.quests.length
var n_activities = []; // numero di attività per ogni quest - equivalente a CurrentWork.quests[CurrentNavStatus.QuestN].activities.length
var mode = "default";
var first_selected_stage = "";//per lo swap
var first_selected_card_index = -1;
var selected_card = "";//indica l'ultima carta cliccata dall'utente
var quests_grids = []; // contiene le griglie di attività per ogni quest

/* indica, per ogni sezione, quella genitore - gli identificatori sono gli id html */
var Parent = {
	MainMenu: "MainMenu",
  ChooseGameMode: "MainMenu",
  EditStory: "ChooseGameMode",
	EditQuest: "EditStory",
	EditActivity: "EditQuest",
	EditAnswerField: "EditActivity",
	EditActivityText: "EditActivity"
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
	story_title: "",
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
        NewStoryTitle.text( "NuovaStoria ");
        $( '#StoryTitleInput' ).val( "NuovaStoria" );
      }

      CurrentWork.story_title = NewStoryTitle.prop( "outerHTML" );
      change_savetitle_button( "saved" );
      break;
    case "quest":
      if (CurrentNavStatus.QuestN < 0) {
        if( $("#NewQuestWidget input").val()=="" )
          value = "Quest" + n_quests;
        else {
          value = $("#NewQuestWidget input").val();
        }

        let NewQuestTitle = $( "<div/>",
        {
          "class": "QuestTitle",
          text: value
        });
        CurrentWork.quests[n_quests - 1].quest_title = NewQuestTitle.prop( "outerHTML" );
      }
      else {
        let NewQuestTitle = $( "<div/>",
          {
            "class": "QuestTitle"
          });

        if( $( '#QuestTitleInput' ).val() != "" ) {
          NewQuestTitle.text( $( '#QuestTitleInput' ).val() );
        }
        else {
          NewStoryTitle.text( "Quest" + get_card_index());
          $( '#QuestTitleInput' ).val( "Quest" + get_card_index() );
        }

        let old_title = $( $.parseHTML( CurrentWork.quests[CurrentNavStatus.QuestN].quest_title ) ).text();
        $("#QuestsGrid .card-text").each( function() {
          if ( $(this).text() == old_title ) {
            $(this).text( NewQuestTitle.text() ); // aggiorna il nome della card
          }
        });

        CurrentWork.quests[CurrentNavStatus.QuestN].quest_title = NewQuestTitle.prop( "outerHTML" );
        change_savetitle_button( "saved" );
      }
      break;
    default:
        handleError()
  }
};

  // crea una quest/attività vuota e la aggiunge all'array del json. se si tratta di una quest, crea un nuovo elemento nell'array delle griglie di attività
function create_stuff(what) {
  switch (what) {
    case "quest":
      CurrentWork.quests.push(initQuest());
      quests_grids.push("");
      n_activities.push(0);
      n_quests += 1;
      save_title("quest");
      break;
    case "activity":
      CurrentWork.quests[CurrentNavStatus.QuestN].activities.push(initActivity());
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
		answer_outcome: "",
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
  let current_grid = $( "#" + CurrentNavStatus.Section + " .CardGrid" ).attr( "id" );
  parent_element = selected_card.parentNode;//recupera il card deck dove si trova la card
  parent_index = Array.from(document.getElementById(current_grid).children).indexOf(parent_element);//calcola l'indice' del card deck rispetto alla griglia
  card_index_inside_parent = Array.from(parent_element.children).indexOf(selected_card);//calcola l'indice della card rispetto al suo deck
  return ((parent_index)*3 )+card_index_inside_parent;
};


//va alla sezione precedente
function back() {
  stop_shaking();
  mode="default";
  first_selected_stage="";
  quests_grids[CurrentNavStatus.QuestN] = $("#ActivitiesGrid").html();
  CurrentNavStatus.QuestN = -1;
  $("#ActivitiesGrid").empty(); // inutile
  new_go_to_section(Parent[CurrentNavStatus.Section]);
};


//sostituisce goToSection quando ci si sposta in EditStory o EditQuest
function new_go_to_section(where) {
  $("#"+CurrentNavStatus.Section).fadeOut( function() {
    switch (where) {
      case "EditStory":
        if (CurrentWork.story_title == "")
          $("#StoryTitleInput").val("NuovaStoria");
        else
          $("#StoryTitleInput").val( $( $.parseHTML(CurrentWork.story_title)).text() );
        break;
      case "EditQuest":
        //// BUG: click multiplo fa partire più volte l'onclick e perciò
        //get_card_index, nelle istanze successive alla prima
        //fa riferimento a ActivitiesGrid invece che a QuestsGrid
        CurrentNavStatus.QuestN = get_card_index();

        if (CurrentWork.quests[CurrentNavStatus.QuestN] == "")
          $("#QuestTitleInput").val("Quest" + CurrentNavStatus.QuestN);
        else
          $("#QuestTitleInput").val( $( $.parseHTML(CurrentWork.quests[CurrentNavStatus.QuestN].quest_title)).text() );
        node = $(CurrentWork.quests[CurrentNavStatus.QuestN].quest_title);
        $("#EditQuest h1").text(node.text());//inserisci il titolo della quest in EditQuest
        $("#ActivitiesGrid").html(quests_grids[CurrentNavStatus.QuestN]);//carica la griglia della quest
        break;
      default:
        handleError();
        break;
    }

    stop_ffs();
    change_color_option("#" + CurrentNavStatus.Section + " .SwapBtn", "primary", "secondary");
    change_color_option("#" + CurrentNavStatus.Section + " .CancelBtn", "primary", "secondary");
    CurrentNavStatus.Section = where;
    $("#"+where).fadeIn();
  });
};


//le card non hanno id e sono associate alle rispettive griglie e quest/activity tramite il loro indice nella giglia in cui si trovano
function create_card(titolo) {
  let current_grid = $( "#" + CurrentNavStatus.Section + " .CardGrid" ).attr( "id" );

  let value;
  switch ( current_grid ) {
    case "QuestsGrid":
      $("#NewQuestWidget").addClass("invisible");
      $("#NewQuestWidget input").val("");
      value = n_quests-1;
      if (titolo =="")// TODO: AGGIUNGERE CONTROLLO SU TUTTE LE STRINGHE CON SOLO CARATTERI VUOTI
        titolo ="Quest"+(n_quests-1);
      break;
    case "ActivitiesGrid":
      titolo = "Attività"+n_activities[CurrentNavStatus.QuestN];
      value = n_activities[CurrentNavStatus.QuestN];
      n_activities[CurrentNavStatus.QuestN] += 1;
      break;
    default:
      handleError();
      break;
  }

  card = `<div class="card bg-` + colors[ (value%6) ] + ` "onclick='
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
            /* TODO */
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
        quests_grids.splice(get_card_index(),1);//cancella la griglia associata a q
        CurrentWork.quests.splice( get_card_index(), 1 )//cancella la quest associata a q
        n_quests -= 1;
        n_activities.splice(CurrentNavStatus.QuestN, 1);
        break;
      case "EditQuest":
        CurrentWork.quests[CurrentNavStatus.QuestN].activities.splice(get_card_index(), 1);
        n_activities[CurrentNavStatus.QuestN] -= 1;
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
        [quests_grids[get_card_index()], quests_grids[first_selected_card_index]] =[quests_grids[first_selected_card_index],quests_grids[get_card_index()]];

        let swtmp = n_activities[first_selected_card_index];
        n_activities[first_selected_card_index] = n_activities[get_card_index()];
        n_activities[get_card_index()] = swtmp;
      }
      else if (CurrentNavStatus.Section == "EditQuest") {
        [CurrentWork.quests[CurrentNavStatus.QuestN].activities[get_card_index()], CurrentWork.quests[CurrentNavStatus.QuestN].activities[first_selected_card_index]] =[CurrentWork.quests[CurrentNavStatus.QuestN].activities[first_selected_card_index],CurrentWork.quests[CurrentNavStatus.QuestN].activities[get_card_index()]];
      }
      else if (CurrentNavStatus.Section == "EditActivity") {
        /* TODO */
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
