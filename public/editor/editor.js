var colors = [ "primary", "secondary", "warning", "success", "danger", "info" ];
var mode = "default";
var first_selected_stage = "";//per lo swap
var first_selected_card_index = -1;
var selected_card = "";//indica l'ultima carta cliccata dall'utente
var CardClickDisabled = false;
var data_array = [];
/* indica la sezione dell'editor dove l'utente si trova attualmente e la quest/attività su cui sta lavorando */
var CurrentNavStatus = {
	Section: "MainMenu",
	QuestN: -1,
	ActivityN: -1
};

/* variabile usata per i salvataggi temporanei del JSON su cui l'utente sta lavorando */
var CurrentWork;

/* FINESTRE - WIP */
var CSS_Editor_Window;
var Preview_Window;

/* variabile che contiene il CSS personalizzato dall'autore */
var CSSdata;


/* ------------------------------- PROCEDURE ---------------------------------- */

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
        $( "#EditStory .SectionTitle" ).html( title );
      else
        $( "#EditStory .SectionTitle" ).html( "<i>StoriaSenzaNome</i>" );

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

        if ( title ) {
          // aggiorna il nome della card
          $("#QuestsGrid .card-text").eq( CurrentNavStatus.QuestN ).html( title );

          
        }
        else {
          // se l'input è lasciato vuoto, viene reinserito il titolo vecchio
          $( '#QuestTitleInput' ).val( old_title );
        }

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
    default:
      handleError();
  }
};


/**
 * Inizializza una nuova storia
 */
function initStory() {
  CurrentWork = {
    ACCESSIBILITY: 0,
    story_title: "",
    story_ID: -1,
    game_mode: "",
    single_device: 1,
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
		answer_outcome: [],
		ASK_EVAL: 0,
		GET_CHRONO: 0,
    expected_time: "",
    FINAL: 0
	};

	return EmptyActivity;
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
function setAnimation( current, obj ) {
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
    case "EditText":
    case "EditGallery":
      goToSection( "EditActivity" );
      break;
  }
};


/**
 * @param where
 * Porta alla sezione specificata, facendo tutti i caricamenti necessari
 */
function goToSection(where) {
  /* esegue eventuali reset */
  mode = "default";
  first_selected_stage = "";
  switch ( CurrentNavStatus.Section ) {
    case "EditStory":
    case "EditQuest":
    case "EditActivity":
      stopAnimation( "#" + CurrentNavStatus.Section + " .CardGrid" );
  }

  /* cambia sezione */
  $("#"+CurrentNavStatus.Section).fadeOut( function() {
    change_color_option(".SwapBtn", "btn-primary", "btn-secondary");
    change_color_option(".CancelBtn", "btn-primary", "btn-secondary");

    switch ( where ) {
      case "MainMenu":
        $('.masthead').fadeOut();
        break;
      case "EditStory":
        $('header').css('display','block');       
        CurrentNavStatus.QuestN = -1;
        if ( CurrentWork.story_title )
          $( "#EditStory .SectionTitle" ).html( CurrentWork.story_title );
        else
          $( "#EditStory .SectionTitle" ).html( "<i>StoriaSenzaNome</i>" );
        $("#StoryTitleInput").val( CurrentWork.story_title );
        $("#QuestsGrid").html( CurrentWork.QuestGrid );
        change_color_option( "#SaveStoryTitle", "btn-primary", "btn-success" );
        $( "#SaveStoryTitle" ).text( "Salvato!" );
        break;
      case "ChooseGameMode":
        loadGameModeSection();
        break;
      case "EditQuest":
        if ( CurrentNavStatus.Section == "EditStory" ) CurrentNavStatus.QuestN = get_card_index();

        $("#QuestTitleInput").val( CurrentWork.quests[CurrentNavStatus.QuestN].quest_title );
        change_color_option( "#SaveQuestTitle", "btn-primary", "btn-success" );
        $( "#SaveQuestTitle" ).text( "Salvato!" );
        $("#EditQuest h1").html( $("#EditStory .card-text").eq(get_card_index()).prop("innerHTML") );

        $("#ActivitiesGrid").html(CurrentWork.ActivityGrids[CurrentNavStatus.QuestN]); //carica la griglia delle attività
        break;
      case "EditActivity":
        if ( CurrentNavStatus.Section == "EditQuest" ) CurrentNavStatus.ActivityN = get_card_index();
        
        $("#EditActivity header small").html( $( "#EditStory .card-text").eq(CurrentNavStatus.QuestN).html() );
        $("#EditActivity header h1").html( "Activity" + CurrentNavStatus.ActivityN );

        /* sistemazione del widget ChooseActivityType */
        $( "#ChooseActivityType" ).css( "display", "none" );
        let activity = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];
        if ( activity.activity_type == "READING" ) {
          $( "#EditActivity p-3" ).first().find( "button:nth-child(2)" ).attr( "disabled", true );

          if ( activity.FINAL )
            $( "#EditActivity p-3" ).first().find( "button:nth-child(3)" ).attr( "disabled", true );
        }
        else {
          $( "#EditActivity p-3" ).first().find( "button" ).attr( "disabled", false );
        }
    
        $("#ParagraphsGrid").html(CurrentWork.ParagraphGrids[CurrentNavStatus.QuestN][CurrentNavStatus.ActivityN]); //carica la griglia dei paragrafi/immagini/gallerie
        break;
      case "EditText":
        // per forza di cose, il titolo di questa e delle successive tre sezioni è uguale a quello di EditActivity
        $("#EditText header small").html( $("#EditActivity header small").html() );
        $("#EditText header h1").html( $("#EditActivity header h1").html() );

        $("#TextParInput").val( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[get_card_index()].content );
        break;
      case "EditGallery":
        $("#EditGallery header small").html( $("#EditActivity header small").html() );
        $("#EditGallery header h1").html( $("#EditActivity header h1").html() );

        loadEditGallerySection();
        break;
      case "EditAnswerField":
        $("#EditAnswerField header small").html( $("#EditActivity header small").html() );
        $("#EditAnswerField header h1").html( $("#EditActivity header h1").html() );

        loadEditAnswerFieldSection();
        break;
      case "SetAnswerOutcome":
        $("#SetAnswerOutcome header small").html( $("#EditActivity header small").html() );
        $("#SetAnswerOutcome header h1").html( $("#EditActivity header h1").html() );

        loadEditOutcomeSection();
        break;
      case "ChooseStoryToEdit":
        CurrentNavStatus.Section = where;
        create_stories_grid();
        //getStories(); 
        break;
      case "Explorer":
        getStories();
        let a =[1,2,3,4,5];
        let b= ["A","B","C","D"];
        create_Explorer_grids(a,b);
        //stories_obj = getStories(); 
        //if( stories_obj.data )
          //alert(stories_obj.data);
        //else
          //alert(stories_obj.status);
          //getStories();
        break;   
        default:
        handleError();
    }
    
    CurrentNavStatus.Section = where;
    $("#"+where).fadeIn();
    
  });
};

/**
 * @param card
 * A seconda della modalità corrente, apre la sezione puntata dalla card, oppure attiva la cancel o swap mode.
 * Al momento del click, disabilita per mezzo secondo la possibilità di cliccarci sopra. Questo viene fatto per evitare problemi causati da un doppio click effettuato per sbaglio
 */
function openCard( card ) {
  if ( CardClickDisabled )
    return;

  CardClickDisabled = true;

  selected_card = card;

  switch(mode) {
    case "swap":
      swap_em(card);
      break;
    case "cancel":
      if ( card.style.animationName == "shake" )
        cancel_em(card);
      else
        setAnimation("shake", card);
      break;
    default:
      setAnimation("puffOut", card);
      setTimeout( function () {
        if (CurrentNavStatus.Section == "EditStory")
          goToSection("EditQuest");
        else if (CurrentNavStatus.Section == "EditQuest")
          goToSection("EditActivity");
        else if (CurrentNavStatus.Section == "EditActivity") {
          switch( $(card).find(".card-text").first().prop("innerHTML") ) {
            case "GALLERY":
              goToSection("EditGallery");
              break;
            default:
              goToSection("EditText");
              break;
          }
        }
        else if (CurrentNavStatus.Section == "ChooseStoryToEdit") {
          //sovrascrivo Currentwork con quello recuperato con ajax, poi gotoSection("EditStory")
            if(!CurrentWork)
              initStory();
            goToSection("EditStory");
            /*$("#ChooseStoryToEdit").fadeOut(function () {
              $("#EditStory").fadeIn();
            });*/
          }
    }, 750);
    break;
  }

  setTimeout( function() {
    CardClickDisabled = false;
  }, 500);
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
      titolo = titolo.replace(/(<([^>]+)>)/gi, "");
      if ( titolo.trim() == "" )
        titolo = "<i>QuestSenzaNome" + ( CurrentWork.quests.length - 1 ) + "</i>";
      color = colors[CurrentWork.quests.length % 6];
      break;
    case "ActivitiesGrid":
      titolo = "Attività" + ( CurrentWork.quests[CurrentNavStatus.QuestN].activities.length - 1 );
      color = colors[CurrentWork.quests[CurrentNavStatus.QuestN].activities.length % 6];
      break;
    case "ParagraphsGrid":
      if ( titolo == "GALLERY" ) color = colors[0];
      else color = colors[1];
      break;
    case "StoriesGrid":
      color = "info";
      break;
    default:
      handleError();
  }

  let card = $("<div/>",
    {
      "class": "card bg-" + color,
      onclick: "openCard( this )"
    });
  card.append( $("<div class='card-body text-center'></div>") );
  card.children().append( $("<p class='card-text'>" + titolo + "</p>") );

  // quando il deck attuale non esiste o è vuoto, crea un nuovo deck e lo mette come ultimo figlio della griglia
  if ( $("#"+current_grid+" > div:last-child").children().length == 3 || $("#"+current_grid).children().length == 0 )
    $("#"+current_grid).append('<div class="card-deck mb-2" ></div>');
  
  $("#"+current_grid+" > div:last-child").append(card); // aggiunge la card al deck
  setAnimation("swashIn",document.getElementById(current_grid).lastChild.lastChild);
  if( current_grid != "ChooseStoryToEdit" ) { 
    saveCardGrids();
  }
};//the hell is this

function create_stories_grid() {
  //create_card per ogni storia recuperata con la chiamata ajax
  for(i=0;i<7;i++){
    create_card(i);
  }
}


/**
 * Entra o esce dalla cancel mode
 */
function cancel_mode() {
  stopAnimation( "#" + CurrentNavStatus.Section + " .CardGrid");

  if (mode == "cancel" ) {
    change_color_option("#" + CurrentNavStatus.Section + " .CancelBtn", "btn-primary", "btn-secondary");
    mode = "default";
  }
  else {
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
  setAnimation("swashOut",obj);
  setTimeout( function() {
    /* cancella tutte le griglie di card e tutti i dati associati all'elemento obj */
    switch (CurrentNavStatus.Section) {

      case "EditStory":
        CurrentWork.ActivityGrids.splice( get_card_index(), 1 );
        CurrentWork.ParagraphGrids.splice( get_card_index(), 1 );
        CurrentWork.quests.splice( get_card_index(), 1 );
        break;
      case "EditQuest":
        CurrentWork.ParagraphGrids[CurrentNavStatus.QuestN].splice(get_card_index(), 1);
        CurrentWork.quests[CurrentNavStatus.QuestN].activities.splice(get_card_index(), 1);
        break;
      case "EditActivity":
        CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text.splice( get_card_index(), 1 );
        break;
      case "ChooseStoryToEdit":
        break;
      default:
        handleError();
    }

    /* cancellazione di obj e sistemazione dei decks */
    iter = obj.parentElement;// iter deck padre della quest
    if( iter.children.length == 1 )// se iter ha solo la card selezionata, elimina iter
      iter.remove();
    else {
      obj.remove();
      //il resto di questo else fa in modo che, dopo la rimozione della quest, il resto della griglia "slitti" in modo appropriato
      while( !( iter == iter.parentElement.lastChild ) ) {
        setAnimation("stop",iter.nextElementSibling.firstChild);
        iter.appendChild( iter.nextElementSibling.firstChild );
        iter = iter.nextElementSibling;
      }
      if( iter.children.length == 0 )
        iter.remove();
    }
  }, 1500);
  if(CurrentNavStatus.Section!="ChooseStoryToEdit"){
    saveCardGrids();
  }
};


/**
 * Entra o esce dalla swap mode
 */
function swap_mode() {
  stopAnimation( "#" + CurrentNavStatus.Section + " .CardGrid");

  if(mode == "swap" ) {
    change_color_option("#" +CurrentNavStatus.Section + " .SwapBtn", "btn-primary", "btn-secondary");
    mode = "default";
    first_selected_stage ="";
  }
  else {
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
  // fa lo swap tra s e first_selected_stage, poi imposta first_selected_stage=""
  if (first_selected_stage) {
    setAnimation("tinLeftOut",first_selected_stage);
    setAnimation("tinRightOut",s);

    setTimeout(function () {
      setAnimation("tinRightIn",first_selected_stage);
      setAnimation("tinLeftIn",s);

      /* swappa i due elementi specificati e tutti i dati o griglie di card associati ad essi */
      switch ( CurrentNavStatus.Section ) {
        case "EditStory":
          [CurrentWork.quests[get_card_index()], CurrentWork.quests[first_selected_card_index]] = [CurrentWork.quests[first_selected_card_index],CurrentWork.quests[get_card_index()]];
        
          [CurrentWork.ActivityGrids[get_card_index()], CurrentWork.ActivityGrids[first_selected_card_index]] = [CurrentWork.ActivityGrids[first_selected_card_index],CurrentWork.ActivityGrids[get_card_index()]];

          [CurrentWork.ParagraphGrids[get_card_index()], CurrentWork.ParagraphGrids[first_selected_card_index]] = [CurrentWork.ParagraphGrids[first_selected_card_index], CurrentWork.ParagraphGrids[get_card_index()]];
          break;
        case "EditQuest":
          [CurrentWork.quests[CurrentNavStatus.QuestN].activities[get_card_index()], CurrentWork.quests[CurrentNavStatus.QuestN].activities[first_selected_card_index]] =[CurrentWork.quests[CurrentNavStatus.QuestN].activities[first_selected_card_index],CurrentWork.quests[CurrentNavStatus.QuestN].activities[get_card_index()]];

          [CurrentWork.ParagraphGrids[CurrentNavStatus.QuestN][get_card_index()], CurrentWork.ParagraphGrids[CurrentNavStatus.QuestN][first_selected_card_index]] =[CurrentWork.ParagraphGrids[CurrentNavStatus.QuestN][first_selected_card_index], CurrentWork.ParagraphGrids[CurrentNavStatus.QuestN][get_card_index()]];
          break;
        case "EditActivity":
          [CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[get_card_index()], CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[first_selected_card_index]] = [CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[first_selected_card_index], CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[get_card_index()]];
      }

      //scambia le card
      let tmp = s;
      s.outerHTML = first_selected_stage.outerHTML;
      first_selected_stage.outerHTML = tmp.outerHTML;

      saveCardGrids();

      first_selected_stage_index = -1;
      first_selected_stage = "";
    },1000);
  }
  else {
    //se la card selezionata è la prima, impostala come tale e falla shakerare
    setAnimation("shake",s);
    first_selected_stage = s;
    first_selected_card_index = get_card_index();
  }
};


/**
 * @param grid
 * Blocca le animazioni per tutte le card nella griglia specificata
 */
function stopAnimation( grid ) {
  $(grid).find(".card").each( function() {
    if ( $(this).css("animation-name") == "swashOut" )
      $(this).remove();
    else
      $(this).attr("style", "");
  });
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


/**
 * Funzione da evolvere poi in una procedura di errore - che magari resetta l'applicazione
 */
function handleError() {
  window.alert( "ERRORE !\nPer evitare rallentamenti del broswer, si consiglia di chiudere o ricaricare la pagina." );
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


  /*
  AJAX CALLS(tutte le seguenti seguono /editor/):
    getStory
    saveStory
    publisher
    getStories
    deleteStory
  
  */
 function getStories() {//errore 500, ma la chiamata in sè è giusta, ma non trova unpublished
  //modal di attesa
  $.get("/editor/getStories", function(data, status){
    
    return {data:data, status: status };

  });
}
function saveStory() { 
  get_all_images_bytes();
    data_array.push({
      name: "sadomaso.json",
      data: CurrentWork,
      story: true
    });
  //alert(JSON.stringify(data_array[0].data));
  story= {//storia ipotetica
    story_data: data_array,    
    story_name: "sadomaso",
    published: true,
    checked: true
  };
  $.post("/editor/saveStory",story, function(data,status){
    alert("Status: " + status);
    data_array = [];
  });
} 
function get_all_images_bytes(){
  i=0;
  while(CurrentWork.quests[i]){
    j=0;
    current_quest = CurrentWork.quests[i];
    while(current_quest.activities[j]){
      current_activity = current_quest.activities[j];
      current_activity.activity_text.forEach(get_images);
      j++;
    }
    i++;
  }
}
function get_images(act_text, index) {
  act_text_element = $($.parseHTML(act_text));
  switch(act_text_element.prop("tagName")){
    case "IMG":
      data_array_element = {
        name:prompt("nome immagine: "),
        data: act_text_element.attr("src")
      };
      data_array.push(data_array_element);
      break;
    case "DIV":
      break;
    
  }
}

function getStory(nome) {//fa crashare l'app anche con published
  value = prompt('bool published: ');
  $.get("/editor/getStory?story_name="+nome+"&published="+value, function(data, status){
    alert("Data: " + data + "\nStatus: " + status);
  });
}
function deleteStory(nome) {
  //value = prompt('bool published: ');
  story = {
    story_name: nome,
    published: true//true per adesso
  };
  $.post("/editor/deleteStory",story, function(data,status){
    alert("Status: " + status);
  });
}
function publisher(name) {//problema con unpublished, funziona se unpub c'è
  story = {
    story_name: name
  };
  $.post("/editor/publisher",story, function(data, status){
    alert("Status: " + status);
  });
}

//bug grafico nella creazione delle gallerie partendo da una gallery r creandone altre consecutive e altri bug

//manca campo per chiedere nome

//piccolo bug grafico tasto home che compare all'inizio e una volta
//cliccato sparisce dalla home(non si dovrebbe vedere in primo luogo)

/*
function saveStory() { 
  
  get_all_images_bytes();
    data_array.push({
      name: "nome.json",
      data: CurrentWork
    });
  story= {//storia ipotetica
    story_data: data_array,    
    story_name: "nome",
    published: true,
    checked: true
    //story: true ritengo sia inutile
  };
  $.post("/editor/saveStory",story, function(data,status){
    alert("Status: " + status);
    data_array = [];
  });
} 
function get_all_images_bytes(){
  i=0;
  while(CurrentWork.quests[i]){
    j=0;
    current_quest = CurrentWork.quests[i];
    while(current_quest.activities[j]){
      current_activity = current_quest.activities[j];
      current_activity.activity_text.forEach(get_images);
      j++;
    }
    i++;
  }
}
function get_images(act_text, index) {
  act_text_element = $($.parseHTML(act_text));
  switch(act_text_element.prop("tagName")){
    case "IMG":
      push_image(act_text_element);
      data_array.push(data_array_element);
      break;
    case "DIV":
      act_text_element.html().html().children().forEach(push_image);
      
      break;
    
  }
}
function push_image(image_element){
  data_array_element = {
    name:prompt("nome immagine: "),
    data: image_element.attr("src")
  };
  data_array.push(data_array_element);
}*/
/**
 * Salva la griglia di cards della sezione corrente
 */
function saveCardGrids() {
  CardClickDisabled = true;

  switch ( CurrentNavStatus.Section ) {
    case "EditStory":
      CurrentWork.QuestGrid = $( $("#QuestsGrid").html() );
      stopAnimation( CurrentWork.QuestGrid );
      CurrentWork.QuestGrid = CurrentWork.QuestGrid.prop("outerHTML");
      break;
    case "EditQuest":
      CurrentWork.ActivityGrids[CurrentNavStatus.QuestN] = $( $("#ActivitiesGrid").html() );
      stopAnimation( CurrentWork.ActivityGrids[CurrentNavStatus.QuestN] );
      CurrentWork.ActivityGrids[CurrentNavStatus.QuestN] = CurrentWork.ActivityGrids[CurrentNavStatus.QuestN].prop("outerHTML");
      break;
    case "EditActivity":
    case "EditText":
      CurrentWork.ParagraphGrids[CurrentNavStatus.QuestN][CurrentNavStatus.ActivityN] = $( $("#ParagraphsGrid").html() );
      stopAnimation( CurrentWork.ParagraphGrids[CurrentNavStatus.QuestN][CurrentNavStatus.ActivityN] );
      CurrentWork.ParagraphGrids[CurrentNavStatus.QuestN][CurrentNavStatus.ActivityN] = CurrentWork.ParagraphGrids[CurrentNavStatus.QuestN][CurrentNavStatus.ActivityN].prop("outerHTML");
  }

  CardClickDisabled = false;
};


/**
 * @param obj --> oggeto simil-json
 * Controlla se la storia è in regola per essere pubblicata.
 * La procedura ritorna un oggetto composto da un booleano che indica se la storia è pubblicabile, e un array di stringhe che indicano gli errori
 */
function isPublishable( obj ) {
  let res = {
    ok: true,
    errors: []
  };

  let final_activity = false;

  /* controlli sulla storia */
  if ( obj.story_title === "" ) {
    res.ok = false;
    res.errors.push( "Storia - Titolo mancante" );
  }

  if ( obj.game_mode === "" ) {
    res.ok = false;
    res.errors.push( "Storia - Modalità di gioco non specificata" );
  }

  if ( CSSdata.valid == false ) {
    res.ok = false;
    res.errors.push( "Storia - CSS stylesheet non valido" );
  }

  if ( obj.quests.length < 1 ) {
    res.ok = false;
    res.errors.push( "Storia - Nessuna quest presente" );
  }

  /* controlli sulle quest */
  $.each( obj.quests, function(q_index, q) {
    if ( q.quest_title === "" ) {
      res.ok = false;
      res.errors.push( "Quest n." + q_index + ": Titolo mancante" );
    }

    if ( q.activities.length < 1 ) {
      res.ok = false;
      res.errors.push( "Quest n." + q_index + ": Nessuna attività presente" );
    }

    /* controlli sulle attività */
    $.each( q.activities, function(a_index, a) {
      
      /* presenza del testo */
      if ( a.activity_text.length < 1 ) {
        res.ok = false;
        res.errors.push( "Quest n." + q_index + ", Activity n." + a_index + ": Testo mancante" );
      }

      /* presenza delle descrizioni delle immagini */
      if ( obj.ACCESSIBILITY ) {
        $.each( a.activity_text, function(p_index, p) {
          if ( p.type == "gallery" ) {
            $.each( p.content, function(image_index, image) {
              if ( $(image).attr("alt") == "" || $(image).attr("alt") === undefined ) {
                res.ok = false;
                res.errors.push( "Quest n." + q_index + ", Activity n." + a_index + ": Mancano alcune descrizioni delle immagini" );
                return false;
              }
            });
          }
        });
      }

      /* presenza del testo della domanda */
      if ( a.answer_field.desription === "" ) {
        res.ok = false;
        res.errors.push( "Quest n." + q_index + ", Activity n." + a_index + ": Testo della domanda mancante" );
      }

      /* presenza e correttezza del campo risposta */
      if ( a.answer_field.type === "" || ( a.answer_field.type == "checklist" && a.answer_field.options.length < 1 ) ) {
        res.ok = false;
        res.errors.push( "Quest n." + q_index + ", Activity n." + a_index + ": Campo risposta creato in modo non corretto" );
      }

      /* presenza e correttezza degli outcomes */
      if ( a.ASK_EVAL < 1 && a.FINAL < 1 ) {
        if ( a.answer_outcome.length < 1 ) {
          res.ok = false;
          res.errors.push( "Quest n." + q_index + ", Activity n." + a_index + ": Outcomes specificati in modo non corretto" );
        }
        else {
          $.each( a.answer_outcome, function(outcome_index, outcome) {
            if ( outcome.nextquest < 1 && outcome.nextactivity === "" ) {
              res.ok = false;
              res.errors.push( "Quest n." + q_index + ", Activity n." + a_index + ": Outcomes specificati in modo non corretto" );
            }
          });
        }
      }

      /* presenza del tempo previsto */
      if ( a.GET_CHRONO && a.expected_time < 60000 ) {
        res.ok = false;
        res.errors.push( "Quest n." + q_index + ", Activity n." + a_index + ": Tempo previsto non specificato" );
      }

      if ( a.FINAL )
        final_activity = true;
      
    });
  });

  if ( final_activity == false ) {
    res.ok = false;
    res.errors.push( "Quest n." + q_index + ": Attività finale mancante" );
  }

  return res;
};


/* --------------------- WIP --------------------------- */
function MainMenu( action ) {
  switch ( action ) {
    case "NEWSTORY":
      mode = "default";
      first_selected_stage = "";
      first_selected_card_index = -1;
      selected_card = "";
      CardClickDisabled = false;
      b = [0, 0, 0, 0, 0, 0, 0];

      $('.masthead').fadeIn();
      initStory();
      goToSection('EditStory');
      break;
  }
};//what is this?



function Navbar( option ) {
  switch ( option ) {
    case "Save":
      /* TODO */
      break;
    case "CSSEditor":
      CSS_Editor_Window = window.open( "../shared/css_editor.html", "tab" );
      break;
    case "Preview":
      /* TODO - interfacciare col json */
      Preview_Window = window.open( "../player/player.html", "tab" );
      break;
    case "Home":
      if ( CSS_Editor_Window )
        CSS_Editor_Window.close();
      $("#ChooseStoryToEdit .container").empty();
      $( "#SavePrompt" ).modal( "toggle" );
  }

  $( "#PromptSave" ).modal("show");

  $( "#PromptSave .button[data-dismiss=modal]" ).click( function() {})
}

function allowDrop(ev) {
  //alert("ev.taget over: "+ev.target.outerHTML);
  border_color(ev,"blue");
  ev.preventDefault();
} 
function border_color(ev,color){
  switch (color) {
  case "white":
    ev.currentTarget.classList.remove("border-primary");
    ev.currentTarget.classList.add("border-white");
    break;
  case "blue":
    ev.currentTarget.classList.remove("border-white");
    ev.currentTarget.classList.add("border-primary");
    break;
  }
}
function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);

}

function drop(ev) {//il target del drop deve essere sempre il container
  //il target del drag deve essere sempre la card
  border_color(ev,"white");
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  original_parent = document.getElementById(data).parentElement;
  while( original_parent.nextElementSibling && original_parent.nextElementSibling.children.length!=0){
      original_parent.appendChild(original_parent.nextElementSibling.firstElementChild);
      original_parent = original_parent.nextElementSibling;
  }
  //alert("ev.currentTarget drop: "+ev.currentTarget.outerHTML);
  if( ev.currentTarget.lastElementChild && ev.currentTarget.lastElementChild.children.length==1 )
    ev.currentTarget.lastElementChild.appendChild(document.getElementById(data));
  else {
    el = $("<div class='card-deck mb-2' ></div>");
    el.append(document.getElementById(data));
    ev.currentTarget.appendChild( el[0]);
  }
}
//butto fuori la parte di drop che agisce sul container d'origine, poi do un id
//"deleteContainer", se sono in esso il deck può contenere fino a 4 card, altrimenti 2

function go_home(from) {
  mode = "default"; //just in case
  $("#"+from).fadeOut( function () {
    CurrentNavStatus.Section = "MainMenu";
    //bisogna impostare anche QuestN e ActivityN?
    $("#"+from+" .container").empty();
    $("#MainMenu").fadeIn();
  });
}

function create_Explorer_grids(a,b){
  /*    <div class="card-deck mb-2">          
    </div> */ 
  if(a){
    for(i=0;i<a.length;i++){//publishable
      if( i%2 ==0 ){
        let deck = $("<div/>",{"class": "card-deck mb-2 "});
        $("#publishableContainer").append(deck);
      }
      let card = $("<div/>",
      {
        "class": "card bg-warning",
        "draggable": "true",
        "ondrop": "event.preventDefault();",
        "ondragstart": "drag(event)",
        "id": "pble"+i
      });
      card.append( $("<div class='card-body text-center'></div>") );
      card.children().append( $("<p class='card-text'>" + a[i] + "</p>") );
      $("#publishableContainer > div").last().append(card);
    }
  } 
  if(b){
    for(j=0;j<b.length;j++){//published
      if( j%2 ==0 ){
        let deck = $("<div/>",{"class": "card-deck mb-2 "});
        $("#publishedContainer").append(deck);
      }
      let card = $("<div/>",
      {
        "class": "card bg-success",
        "draggable": "true",
        "ondrop": "event.preventDefault();",
        "ondragstart": "drag(event)",
        "id": "ped"+j
      });
      card.append( $("<div class='card-body text-center'></div>") );
      card.children().append( $("<p class='card-text'>" + b[j] + "</p>") );
      $("#publishedContainer > div").last().append(card);
    }
  } 
}