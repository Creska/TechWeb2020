var mode = "default";
var first_selected_stage = "";//per lo swap
var first_selected_card_index = -1;
var selected_card = "";//indica l'ultima carta cliccata dall'utente
var CardClickDisabled = false;

  
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
            let id = card.lastElementChild.lastElementChild.innerText.slice(4);
            getStory( id);
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
function create_card(titolo,subtitle) {
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
  card.children().append( $("<p class='card-title'><h4>" + titolo + "</h4></p>") );
  if( subtitle ) 
    card.children().append( $("<p class='card-subtitle mb-2'<h6>" + subtitle + "</h6></p>") );
  // quando il deck attuale non esiste o è vuoto, crea un nuovo deck e lo mette come ultimo figlio della griglia
  if ( $("#"+current_grid+" > div:last-child").children().length == 3 || $("#"+current_grid).children().length == 0 )
    $("#"+current_grid).append('<div class="card-deck mb-2" ></div>');
    
  $("#"+current_grid+" > div:last-child").append(card); // aggiunge la card al deck
  setAnimation("swashIn",document.getElementById(current_grid).lastChild.lastChild);
  if( current_grid != "ChooseStoryToEdit" ) { 
    saveCardGrids();
  }
};


function create_stories_grid(array) {
  //create_card per ogni storia recuperata con la chiamata ajax
  for(i=0;i<array.length;i++){
    if(!array[i].title)
      array[i].title = "senza titolo";
    create_card(array[i].title,"id: "+array[i].id);
  }
};
  
  
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


  function create_Explorer_grids(unpub,pub){
    /*    <div class="card-deck mb-2">          
      </div> */
      console.log("unpub: ",unpub) 
      console.log("pub: ",pub) 
    if(unpub){
      for(i=0;i<unpub.length;i++){//unpublishable
        if( !unpub[i].title )
          unpub[i].title = "senzatitolo";
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
        card.children().append( $("<p class='card-title'><h4>" + unpub[i].title + "</h4></p>") );
        card.children().append( $("<p class='card-subtitle'><h6>id: " + unpub[i].id + "</h6></p>") );
        $("#publishableContainer > div").last().append(card);
      }
    } 
    if(pub){
      for(j=0;j<pub.length;j++){//published
        if( !pub[j].title )
          pub[j].title = "senzatitolo";
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
        card.children().append( $("<p class='card-title'><h4>" + pub[j].title + "</h4></p>") );
        card.children().append( $("<p class='card-subtitle'><h6>id: " + pub[j].id + "</h6></p>") );
        $("#publishedContainer > div").last().append(card);
      }
    } 
  }