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
/*  getStories ora funziona come vuole mao
  => GET /editor/getStories, la query vuole il parametro section che 
  deve essere ChooseStoryToEdit oppure Explorer
  => NOTA: nel caso di ChooseStoryToEdit viene ritornato un array di
  storia, con Explorer un oggetto contenente due array come campi
  .publishable e .published*/
function getStories(caller) {//errore 500, ma la chiamata in sè è giusta, ma non trova unpublished
  $.get("/editor/getStories?section="+caller, function(data, status){
    let obj = JSON.parse(data);
    switch (caller) {
      case "ChooseStoryToEdit":     
        create_stories_grid(obj);
        break;
      case "Explorer":
        create_Explorer_grids(obj.unpublished,obj.published);
        break;
    } 
  });
}
/* 
TO-DO list:
  -add button to start calls
  -Implement multiple publish/unpublish/delete story
  -Feedback area handling
  -fix trash can layout
  -add duplicate button( basically delete id field then saveStory)
  -navbar/Go home handling
  -informative paragraph in explorer
  -button that triggers popover which shows what is missing to make the story publishable
  -media handling
  -QR code generation
  -Make code polite and modular
Notes:
  */
function start_saving() {
  CurrentWork.publishable = isPublishable(CurrentWork); 
  if(CurrentWork.publishable.ok)
    $("#publish_directly").modal("show");
  else 
    saveStory(false);
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
  }  
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

function getStory(id) {//fa crashare l'app anche con published
  $.get("/editor/getStory?story_id="+encodeURIComponent(id), function(data, status){
    CurrentWork =JSON.parse(data);
    goToSection("EditStory");
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

function explorer_calls() {
  //delete, publish, unpublish
}
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
      if ( CSS_Editor_Window )
        CSS_Editor_Window.close();
      $("#ChooseStoryToEdit .container").empty();
      $( "#SavePrompt" ).modal( "toggle" );
  }

  $( "#PromptSave" ).modal("show");

  $( "#PromptSave .button[data-dismiss=modal]" ).on( "click",  function() {})
}



function go_home(from) {
  mode = "default"; //just in case
  $("#"+from).fadeOut( function () {
    CurrentNavStatus.Section = "MainMenu";
    //bisogna impostare anche QuestN e ActivityN?
    $("#"+from+" .container").empty();
    $("#MainMenu").fadeIn();
  });
}

