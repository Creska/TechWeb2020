  var b = [ false, false, false, false, false ];//true: i è selezionato
  var bgs = [ "bg-secondary", "bg-secondary", "bg-secondary", "bg-success", "bg-danger"];
  var colors = [ "primary", "warning", "success", "danger", "dark", "info" ];
  var n_quests = 0;//per capire l'indic di una quest al momento della sua creazione
  var n_activities = [];//come per nquests ma per le activity di ogni quest
  var mode = "default";
  var first_selected_quest = "";//per lo swap
  var first_selected_card_index = -1;
  var selected_card = "";//indica l'ultima carta cliccata dall'utente
  var quests_grids = [];//contiene le giglie delle quest
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
      change_color_option("a"+x,"bg-primary",bgs[x]);
      b[x] = false;
    }
}

  function check_select() {
  if( (b[0] ^ b[1] ^ b[2])  & (b[3] ^ b[4]) )
    $("#dis").removeClass("disabled");
  else
    $("#dis").addClass("disabled");
}

  function change_color_option(i,decolor,color) {//colora o decolora i
    $("#"+i).removeClass(decolor);
    $("#"+i).addClass(color);
}

  function select(i) {
  b[i] = !b[i];
  if(b[i]) {
    change_color_option("a"+i,bgs[i],"bg-primary");
    deselect_other_options(i);
  }
  else
    change_color_option("a"+i,"bg-primary",bgs[i]);

  check_select();
}

  function show_saved_button() {
  //mostra bottone saved
    $("#save").removeClass("bg-primary");
    $("#save").addClass("bg-success");
    $("#save").text("salvato!");
    $("#cancelculture").attr("onclick",`
    $('#StoryTitleInput').val('');
    CurrentWork.story_title='';
    $('#save').removeClass('bg-success');
    $('#save').addClass('bg-primary');
    $('#save').text('salva');
    $("#cancelculture").attr("onclick","$('#StoryTitleInput').val('');");
    `);//resetta json e riporta 'salva' e 'cancella' come erano prima
  }

  function save_title( which ) {
    switch (which) {
      case "story":
        if( $( '#StoryTitleInput' ).val() != ""){//// OPTIMIZE: fare in modo che controlli che la stringa non contenga solo spazi vuoti
          let NewStoryTitle = $( "<div/>",
          {
            id: "StoryTitle",
            text: $( '#StoryTitleInput' ).val()
          });
          CurrentWork.story_title = NewStoryTitle.prop( "outerHTML" );
          show_saved_button();
        }
        break;
      case "quest":
        if( $("#invisible_input").val()=="" )
          value = "quest"+n_quests;
        else {
          value = $("#invisible_input").val();
        }
        let NewQuestTitle = $( "<div/>",
        {
          class: "QuestTitle",
          id: assignID( "QuestTitle" ),
          text: value
        });
        len = CurrentWork.quests.length;
        CurrentWork.quests[len-1].quest_title = NewQuestTitle.prop( "outerHTML" );
        break;
        default:
    }
  }

  function set_stop_animation( setting, quest ) {//quest è un this dom, non jquery
    switch( setting ) {
      case "shake":
        quest.style.animationName = setting;
        quest.style.animationIterationCount = "infinite";
        quest.style.animationDuration = "0.5s";
        break;
      case "stop":
        quest.style.animationName = "initial";
        break;
      case "puffOut":
        quest.style.animationName = setting;
        quest.style.animationIterationCount = "initial";
        quest.style.animationDuration = "1s";
        setTimeout(function () {
                    quest.style.animationName = "initial";
                  }, 1500);
        break;
      case "swashOut":
        quest.style.animationName = setting;
        quest.style.animationIterationCount = "initial";
        quest.style.animationDuration = "1.5s";
        break;
      case "swashIn":
        quest.style.animationName = setting;
        quest.style.animationIterationCount = "initial";
        quest.style.animationDuration = "0.75s";
        setTimeout(function () {
                    quest.style.animationName = "initial";
                  }, 1250);
        break;
      default:
        quest.style.animationName = setting;
        quest.style.animationIterationCount = "initial";
        quest.style.animationDuration = "1s";
      /*  setTimeout(function () {
                    quest.style.animationName = "initial";
                  }, 1400);*/
    }
  }
//la griglia è composta da deck di tre card l'uno
  function get_card_index() {//calcola l'indice della card nella griglia corrente
    sel = set_get_grid_prefix();//guarda se siamo nella griglia di una storia o di una quest
    parent_element = selected_card.parentNode;//recupera il card deck dove si trova la card
    parent_index = Array.from(document.getElementById(sel+"grid_div").children).indexOf(parent_element);//calcola l'indice' del card deck rispetto alla griglia
    card_index_inside_parent = Array.from(parent_element.children).indexOf(selected_card);//calcola l'indice della card rispetto al suo deck
    return ((parent_index)*3 )+card_index_inside_parent;
  }

  function set_get_grid_prefix() {
    if(CurrentNavStatus.Section =='EditQuest')
      sel = "q_";
    else
      sel ="s_";
    return sel;
  }
//i bottoni swap e cancel sono in comune tra EditStory ed EditQuest, e vnegono spostati a ogni cambio di section
  function move_buttons(where) {
    switch (where) {
      case "EditStory":
      $("#s_new_button").before( $("#swap") );
      $("#s_new_button").after( $("#cancel") );
        break;
      case "EditQuest":
      $("#q_new_button").before( $("#swap") );
      $("#q_new_button").after( $("#cancel") );
      break;
    }
  }
//va da EditQuest a EditStory svuotando la griglia e caricandovi la nuova griglia opportuna
  function back() {
    stop_shaking();
    first_selected_quest="";
    quests_grids[CurrentNavStatus.QuestN] = $("#q_grid_div").html();
    CurrentNavStatus.QuestN = -1;
    CurrentNavStatus.Section = "EditStory";
    set_get_grid_prefix();
    stop_ffs();
    $("#q_grid_div").empty();
    $("#EditQuest").fadeOut(
      function() {
        move_buttons("EditStory");
        $("#EditStory").fadeIn();

      }
    );
  }
//sostituisce goToSection quando ci si sposta in EditStory o EditQuest
  function new_go_to_section(where) {
    $("#"+CurrentNavStatus.Section).fadeOut(
      function() {
          move_buttons(where);
          if( where == "EditQuest" ) {
              //// BUG: click multiplo fa partire più volte l'onclick e perciò
              //get_card_index, nelle istanze successive alla prima
              //fa riferimento a q_grid_div invece che a s_grid_div
              CurrentNavStatus.QuestN = get_card_index();
              node = $(CurrentWork.quests[CurrentNavStatus.QuestN].quest_title);
              $("#EditQuest h1").text(node.text());//inserisci il titolo della quest in EditQuest
              $("#q_grid_div").html(quests_grids[CurrentNavStatus.QuestN]);//carica la griglia della quest
          }
          CurrentNavStatus.Section = where;
          set_get_grid_prefix();
          $("#"+where).fadeIn();
      }
    );
  }
//le card non hanno id e sono associate alle rispettive griglie e quest/activity tramite il loro indice nella giglia in cui si trovano
  function create_card(titolo) {//insertNewstage versione Mao
    sel = set_get_grid_prefix();
    if(sel =="q_") {
      titolo = "Attività"+n_activities[CurrentNavStatus.QuestN];
      value = n_activities[CurrentNavStatus.QuestN];
      n_activities[CurrentNavStatus.QuestN] += 1;
    }
    else {
      $("#invisible_div").addClass("invisible");
      $("#invisible_input").val("");
      value = n_quests;
      n_quests += 1;
      if(titolo =="")// TODO: AGGIUNGERE CONTROLLO SU TUTTE LE STRINGHE CON SOLO CARATTERI VUOTI
        titolo ="quest"+(n_quests-1);
    }
    card = `<div class=" card bg-`+colors[ (value%6) ]+`  " onclick='
    selected_card = this;
    switch(mode) {
      case "swap":
        swap_em(this);
        break;
      case "cancel":
        if( this.style.animationName == "shake" ) {
          cancel_em(this);
          }
        else
          set_stop_animation("shake", this);
        break;
      default:
          set_stop_animation("puffOut", this);
          setTimeout(function () {
                      if(CurrentNavStatus.Section =="EditQuest")
                        alert("work in progress");
                      else
                        new_go_to_section("EditQuest");
                    }, 750);
     }' >
      <div class="card-body text-center">
        <p class="card-text">`+titolo+`</p>
      </div></div>`;
    if( $("#"+sel+"grid_div > div:last-child").children().length == 3 || $("#"+sel+"grid_div").children().length == 0 ){
      $("#"+sel+"grid_div").append('<div class="card-deck mb-2" ></div>');//quando il deck attuale non esiste o è vuoto crea  un nuovo deck e mettilo come ultimo figlio della griglia
}
    $("#"+sel+"grid_div"+" > div:last-child").append(card);//aggiungo la card al deck
    set_stop_animation("swashIn",document.getElementById(sel+"grid_div").lastChild.lastChild);
  }

  function cancel_mode() {//c è this
    //esci dalla cancel mode
    if(mode == "cancel" ) {
      change_color_option("cancel", "btn-primary", "btn-secondary");
      mode = "default";
      stop_shaking();
    }
    else {//entra in cancel mode
      stop_shaking();
      change_color_option("cancel","btn-secondary","btn-primary");
      if( mode == "swap" ) {//se swap è attivo disattivalo
        change_color_option("swap","btn-primary","btn-secondary");
        first_selected_quest="";
      }
      mode = "cancel";
    }
  }

  function cancel_em(q) {//q è la quest in questione
    //alert("io mangiare nocelai ");
    set_stop_animation("swashOut",q);
    setTimeout(function(){
    if (CurrentNavStatus.Section =="EditStory") {
      quests_grids.splice(get_card_index(),1);//cancella la griglia associata a q
      CurrentWork.quests.splice( get_card_index(), 1 )//cancella la quest associata a q
    }
    else {
      //CurrentWork.quests[CurrentNavStatus.QuestN].activities.splice(get_card_index(), 1);
      //analogo alle quest ma per le activity
    }
      iter = q.parentElement;// iter deck padre di q
      if( iter.children.length == 1 )// se iter ha solo la card selezionata, elimina iter
        iter.remove();
      else {
        q.remove();
        //il resto di questo else fa in modo che sopo la rimozione di q, il resto della griglia "slitti" in modo appropriato
        while( !( iter == iter.parentElement.lastChild ) ) {
          set_stop_animation("stop",iter.nextElementSibling.firstChild);
          iter.appendChild( iter.nextElementSibling.firstChild );
          iter = iter.nextElementSibling;
        }
        if( iter.children.length == 0 )
          iter.remove();
      }
    }, 1500);
  }

  function swap_mode() {//s è il tasto swap
    //esci dalla swap mode
    if(mode == "swap" ) {
      change_color_option("swap", "btn-primary", "btn-secondary");
      mode = "default";
      first_selected_quest ="";
      stop_shaking();//dovrà prendere un parametro per capire su quale set agire
    }
    else {//entra in swap mode
      stop_shaking();
      change_color_option("swap","btn-secondary", "btn-primary");
      if( mode == "cancel" )
        change_color_option("cancel","btn-primary","btn-secondary");
      mode = "swap";
    }
  }

  function swap_em(s) {//s this quest
    if(first_selected_quest) {
    //fai lo swap tra s e first_selected_quest, poi imposta first_selected_quest=""
      set_stop_animation("tinLeftOut",first_selected_quest);
      set_stop_animation("tinRightOut",s);
      setTimeout(function () {
        set_stop_animation("tinRightIn",first_selected_quest);
        set_stop_animation("tinLeftIn",s);
        if (CurrentNavStatus.Section =="EditStory") {//swappa anche le quest e le griglie associate
          [CurrentWork.quests[get_card_index()], CurrentWork.quests[first_selected_card_index]] =[CurrentWork.quests[first_selected_card_index],CurrentWork.quests[get_card_index()]];
          [quests_grids[get_card_index()], quests_grids[first_selected_card_index]] =[quests_grids[first_selected_card_index],quests_grids[get_card_index()]];
        }
        else {
          //[CurrentWork.quests[CurrentNavStatus.QuestN].activities[get_card_index()], CurrentWork.quests[CurrentNavStatus.QuestN].activities[first_selected_card_index]] =[CurrentWork.quests[CurrentNavStatus.QuestN].activities[first_selected_card_index],CurrentWork.quests[CurrentNavStatus.QuestN].activities[get_card_index()]];
          ////analogo alle quest ma per le activity
        }
        //scambia le card
        tmp = s;
        s.outerHTML = first_selected_quest.outerHTML;
        first_selected_quest.outerHTML = tmp.outerHTML;
        first_selected_quest_index = -1;
        first_selected_quest = "";

      },1000);
    }
    else {//se la quest selezionata è la prima, impostala come tale e falla shakkerare
      set_stop_animation("shake",s);
      first_selected_quest = s;
      first_selected_card_index = get_card_index();
    }
  }

  function stop_shaking() {//per tutte le card della section corrente
    if(CurrentNavStatus.Section =="EditQuest")
      sel = "q_";//sel serve per stabilire quale griglia targettare(tra storia e quest)
    else
      sel = "s_";
    //alert(sel);
    for (card of $("#"+sel+"grid_div .card")) {
      if( card.style.animationName == "shake" )
        set_stop_animation("stop",card);
    }
  }
  function stop_ffs() {//blocca le animazioni di swap
    if(CurrentNavStatus.Section =="EditQuest")
      sel = "q_";
    else
      sel = "s_";
    //alert(sel);
    for (card of $("#"+sel+"grid_div .card")) {
      if( card.style.animationName == "tinLeftIn" || card.style.animationName == "tinRightIn" )
        set_stop_animation("stop",card);
    }
  }
  function create_stuff(what) {
    if ( what=="quest") {
      //creo quest vuota,la aggiungo e vi inserisco il titolo
      new_quest = initQuest();
      CurrentWork.quests.push(new_quest);
      //quests_grids contiene le griglie delle quest
      quests_grids.push("");
      n_activities.push(0);
      save_title("quest");
    } else {//caso Activity
      //creo Activity vuota e la aggiungo
      new_activity = initActivity();

      CurrentWork.quests[CurrentNavStatus.QuestN].activities.push(new_activity);
    }
  }
/*
Ci sono alcuni cambiamenti strutturali:
  -le modalità ChooseAccessibility e ChooseGameMode sono unite in una sola e la prima è scomparsa
  -i modal sono spariti del tutto
  -il titolo delle quest viene chiesto in EditStory
  -Esistono i pulsanti swap e cancel con relative mode e funzioni
  -back al momento permette solo di passare da una quest alla storia
*/
