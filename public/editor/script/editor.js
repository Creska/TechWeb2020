var colors = [ "primary", "secondary", "warning", "success", "danger", "info" ];

/* indica la sezione dell'editor dove l'utente si trova attualmente e la quest/attività su cui sta lavorando */
var CurrentNavStatus = {
	Section: "MainMenu",
	QuestN: -1,
  ActivityN: -1,
  TextPartN: -1
};

/* variabile usata per i salvataggi temporanei della storia su cui l'utente sta lavorando */
var CurrentWork;
var MediaBuffer = [];
var CSSdata;

/* FINESTRE */
var CSS_Editor_Window;
var Preview_Window;


/* ------------------------------- PROCEDURE ---------------------------------- */

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
function getStories(caller) {
  $.get("/editor/getStories?section="+caller, function(data, status){
    let obj = JSON.parse(data);
    switch (caller) {
      case "ChooseStoryToEdit":     
        create_stories_grid(obj);
        break;
      case "Explorer":
        create_Explorer_grids(obj.publishable,obj.published);
        break;
    } 
  });
}
/* 
TO-DO list:
cazzatine varie
  -see getStory
  -make unpublished stories deletable with navbar button
  -add duplicate button( basically delete id field then saveStory)
  -weird reload issue
    -maybe related to ajax loli
    -show error loli despite the operation going well, also reloads the page for some reason
  -button that triggers popover which shows what is missing to make the story publishable
  -ajax loli appareance handling
  -QR code generation
  -in trash can, publishable and published containers, container class
    should be removed since it's responsiveness sucks, but when we do so,
    the dragging stuff is fucked up for some reason. this may be as well
    an occasion to fix this kinky layout.
  -Make code polite and modular
Media:
Notes:
  here is section the transition dynamic:
  first button -> 
    MainMenu("NEWSTORY")
      initialize story and it's handling variables
      gotoSection("Mainenu") ->
        MainMenu fadout, .masthead fadein, editStory fadein
  home button ->
    navbar("home") ->
      if css window is open, close it
      show modal
    ignora button ->
      close modal
      gotoSection("Mainenu") ->
        reset story handling variables
        .masthead fadeout, editstory fadeout, MainMenu fadein
  */
function start_saving() {
  close_css_window();
  CurrentWork.publishable = isPublishable(CurrentWork); 
  if(CurrentWork.publishable.ok)
    $("#publish_directly").modal("show");
  else {
    CurrentWork.publishable.ok = true;//for testing purposes
    saveStory(false);
  }
}
function saveStory(publish) { 
  let story = prepare_saveStory_object(publish);
  $.ajax({
    url: '/editor/saveStory',
    type: 'POST',
    data: JSON.stringify(story),
    contentType: "application/json",
    success: function(data) {
      $("#story_id_p").text("Id storia: "+data);
      goToSection("final_section");
    }
  });
} 
/* 
story = {
  story_json: CurrentWork,
  story_data: [
    {
      name: string,//extension has to be included probably, storyid+"_css.json", looks like css file is saved as a json
      data: FILE,
      native: boolean, //true if the file has to be saved in utf-8 format
      tostringify: boolean //true if the file is a json, in practice this applies to CSS object
    }
  ],
}
*/
//clone CurrentWork and transform it
//goToSection("AddVideo")
/*let media_array = [{
  name: string,
  file: FILE,
  coordinates: [ 0, 1, 2,3]//the media path has to be written in the json
  // in the position: quest 0, activity 1, activity_text 2 as the third 
  //element of the gallery
}];*/
function prepare_saveStory_object(publish) {
  let story = {
    story_json: CurrentWork,
    story_data: [
      {
        name: "css_file.json",//extension has to be included probably, storyid+"_css.json", looks like css file is saved as a json
        data: CSSdata,
        native: true, //true if the file has to be saved in utf-8 format
        tostringify: true //true if the file is a json, in practice this applies to CSS object
      }
    ],
    published: publish
  };  
  return story;
}
function prepare_saveStory_json(){
  let clean_cw=CurrentWork;
  //push file in an array and save it's position(which must not change) in json, which will be used later to get
  //the file, which name shall be path/name_position to avoid ambiguity
  //for now don't clone the json and replace images with random bullshit
  // OLD CURRENTWORK CLEANING
  let i=0;
  //substitute some stuff
  while(clean_cw.quests[i]){
    let j=0;
    while(clean_cw.quests[i].activities[j]){
      let k=0;
      while(clean_cw.quests[i].activities[j].activity_text[k]){
        if( clean_cw.quests[i].activities[j].activity_text[k].type == "gallery" ) {
          let z=0;
          clean_cw.quests[i].activities[j].activity_text[k].content = "random bullshit";//temporary
          while(clean_cw.quests[i].activities[j].activity_text[k].content[z]) {
            if( clean_cw.quests[i].activities[j].activity_text[k].content[z].server ) {
              //replace position with whatever is needed from player
            }          
            z++;
            }
        }
        k++;
      }
      j++;
    }
    i++;
  } 
  return clean_cw;
}

function getStory(id) {
  $.get("/editor/getStory?story_id="+encodeURIComponent(id), function(data, status){
    CurrentWork =JSON.parse(data);
    /*the line above needs to be replaced  by the following three
    code lines, because CSSdata is getting no value, thus making
    saveStory not working(unless CSSdata has already been initialized).
    However this refactoring needs some work in saveStory server-side as well.
    Furthermore chooseStoryToEdit needs to be cleared everytime it is
    faded in or faded out. 
    let parsed_data = JSON.parse(data);
    CurrentWork =parsed_data.story;
    CSSdata = parsed_data.css;*/
    MainMenu("STORY");
    //goToSection("EditStory");
  });
}

function explorer_calls() {
  let ids = gather_ids();
  let delete_promise = new Promise( (resolve, reject) => {
    if( ids.delete_array.length > 0 ) {
      let story = {
        story_ids: ids.delete_array
      };
      $.post("/editor/deleteStory",story, function(data,status){
        resolve(data);
      });
    }
  });

  let publisher_promise = new Promise(( resolve, reject) => {
    if( ids.pub_unpub_array.length > 0 ) {
      let story = {
        story_ids: ids.pub_unpub_array
      };
      $.post("/editor/publisher",story, function(data, status){
        console.log("data dopo la post: ",data)
        resolve(data);
      });
    }
  });

  Promise.all([delete_promise, publisher_promise]).then(data => {
    let msg_array = [];
    if( data[0] )
      msg_array = msg_array.concat(JSON.parse(data[0]).msgs); 
    if( data[1] )
      msg_array = msg_array.concat(JSON.parse(data[1]).msgs);    
    if( msg_array.length > 0 ) {
      msg_array.forEach( message => {
        let color; 
        if(message.successful)
          color = "rgb(85, 255, 6)";
        else
          color = "red";
        let message_div = $("<div/>",
        {
          "style": "color:"+color+";",    
        });
        message_div.text(message.msg)
        $("#feedback_div").append(message_div);
      });
    }
    getStories("Explorer");
  });
}

function gather_ids() {
  let ids_to_delete = [];
  $("#trash_can").children().each( (index,deck) => {
    let cards = deck.children;
    for (let card of cards) {
      ids_to_delete.push( get_id_subtitle(card) );
    }
  })
  let ids_to_pub_unpub = [];
  $("#publishableContainer").children().each( (index,deck) => {
    let cards = deck.children;
    for (let card of cards) {
      if( card.id.slice(0,4) == "shed"  )
        ids_to_pub_unpub.push( get_id_subtitle(card) );
    }
  })
  $("#publishedContainer").children().each( (index,deck) => {
    let cards = deck.children;
    for (let card of cards) {
      if( card.id.slice(0,4) == "able"  )
        ids_to_pub_unpub.push( get_id_subtitle(card) );
    }
  })
  return { delete_array:ids_to_delete, pub_unpub_array: ids_to_pub_unpub };
}

/*
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
              if ( image.alt == "" || image.alt === undefined ) {
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
    res.errors.push( "Storia - Attività finale mancante" );
  }

  return res;
};

function set_default_story_settings() {
  mode = "default";
  first_selected_stage = "";
  first_selected_card_index = -1;
  selected_card = "";
  CardClickDisabled = false;
  b = [0, 0, 0, 0, 0, 0, 0];//this feels outdated
}
/* --------------------- WIP --------------------------- */
function MainMenu( action, is_new ) {
  switch ( action ) {
    case "STORY":
      set_default_story_settings();
      if( is_new )
        initStory();
      goToSection('EditStory');
      break;
    case "CHOOSESTORY":
      /* DA FINIRE */
      goToSection('ChooseStoryToEdit');
      break;
    case "EXPLORER":
      /* DA FINIRE */
      goToSection('Explorer');
      break;
  }
};



function Navbar( option ) {
  switch ( option ) {
    case "Save":
      start_saving();
      break;
    case "CSSEditor":
      CSS_Editor_Window = window.open( "../css_editor/css_editor.html", "tab" );
      break;
    case "Preview":
      /* TODO - interfacciare col json */
      Preview_Window = window.open( "../player/player.html", "tab" );
      break;
    case "Home":
      $( "#SavePrompt" ).modal( "toggle" );
      break;
    case "ChooseStoryToEdit":
      $( "#back_modal" ).modal( "toggle" );
      break;
  }

  $( "#PromptSave" ).modal("show");

  $( "#PromptSave .button[data-dismiss=modal]" ).on( "click",  function() {})
}

function change_navbar(how) {
  switch (how) {
    case "show":
      //edit fields noned
      $("#back_nav").css("display","inherit");
      $("#final_choose").css("display","inherit");
      $("#final_home").css("display","none");
      break;
    
    case "hide":
      //edit fields shown
      $("#back_nav").css("display","none");
      $("#final_choose").css("display","none");
      $("#final_home").css("display","inherit");
      break;
  }
}

function close_css_window() {
  if ( CSS_Editor_Window )
    CSS_Editor_Window.close();
}