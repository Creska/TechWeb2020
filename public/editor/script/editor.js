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
    console.log("obj: ",obj)
    $(".error_div").css("display", "none");
    switch (caller) {
      case "ChooseStoryToEdit": 
        create_stories_grid(obj.stories);
        break;
      case "Explorer":

        create_Explorer_grids(obj.publishable,obj.published);
        break;
    }
    if( obj && obj.error_msg ){
      $("#"+caller +"_div_error p").empty();
      $("#"+caller+ "_div_error p").text(obj.error_msg); 
      $("#"+caller+"_div_error").css("display", "inherit");
    }  
  });
}
/* 
TO-DO list:
cazzatine varie
  -Make code polite and modular
  */
function start_saving() {
  close_css_window();
  CurrentWork.publishable = isPublishable(CurrentWork); 
  if(CurrentWork.publishable.ok)
    $("#publish_directly").modal("show");
  else {
    //CurrentWork.publishable.ok = true;//for testing purposes
    saveStory(false);
  }
}
async function saveStory(publish) { 
  let clean_cw = jQuery.extend(true, {}, CurrentWork);//deep copy CurrentWork
  let q=0;
  let story_data = [
      {
        name: "css.json",
        data: CSSdata,
        native: true, 
        tostringify: true 
      }
  ];
  let coordinates = [];
  let reader = new FileReader();
  /*reader.addEventListener( "load", function() {
    story_data[index].data =this.result;
  });*/
  while(clean_cw.quests[q]){
    let a=0;
    while(clean_cw.quests[q].activities[a]){
      let at=0;
      while(clean_cw.quests[q].activities[a].activity_text[at]){
        if( clean_cw.quests[q].activities[a].activity_text[at].type == "gallery" ||clean_cw.quests[q].activities[a].activity_text[at].type == "video" ) {
          let c=0;
          while(clean_cw.quests[q].activities[a].activity_text[at].content[c]) {
            if( clean_cw.quests[q].activities[a].activity_text[at].content[c].isFile ) {
              //push media in story_data
              //files.push( clean_cw.quests[q].activities[a].activity_text[at].content[c].src );
              let promise= new Promise( (resolve,reject) => {
                reader.readAsBinaryString(clean_cw.quests[q].activities[a].activity_text[at].content[c].src);
                reader.onload= function() {resolve(this.result)};
              });
              let buf = await promise;
              story_data.push({
                name: clean_cw.quests[q].activities[a].activity_text[at].content[c].src.name,
                data: buf,
                coordinates: [q,a,at,c]//new field added for server-side path writing
              });
              clean_cw.quests[q].activities[a].activity_text[at].content[c].src= "";
            }          
            c++;
            }
        }
        at++;
      }
      a++;
    }
    q++;
  } 

  let story = {
    story_json: JSON.stringify(clean_cw),
    story_data: story_data,
    published: publish,
  };  
  $.ajax({
    url: '/editor/saveStory',
    type: 'POST',
    data: story,
    //contentType: "application/json",
    success: function(data) {
      $("#story_id_p").text("Id storia: "+data.story_id);//data? { story_id: string, file_errors: array }
      if( data.file_errors && data.file_errors.length > 0 ) {
        let list = $("<ul/>");
        $("#story_id_p").append(", ma i seguenti file non sono stati salvati:");
        data.file_errors.forEach( element => {
          list.append("<li>"+element.name+"</li>");
        });
        $("#story_id_p").append(list);
        $("#story_id_p").append("Se vuoi puoi provare ad aggiungerli in un secondo momento.");
      }
      goToSection("final_section");
      $('#success_modal').modal('show');
    },
    error: function(err) {
      console.log(err)
      //$('#fail_modal').modal('show');
    }
  });
} 

function getStory(id) {
  $.get("/editor/getStory?story_id="+encodeURIComponent(id), function(data, status){
    //CurrentWork =JSON.parse(data);
    console.log("data: ",data)
    //console.log("parsed data: ",JSON.parse(data))
    //let parsed_data = JSON.parse(data);
    CurrentWork = JSON.parse(data.story);
    MainMenu("STORY");
    if(data.css)
      CSSdata = JSON.parse(data.css);
    else {
      CSSdata = {
        sheet: "",
        valid: true
      };
      $("#EditStory_div_error").css("display", "inherit");
      $("#EditStory_div_error p").text("Il css non è stato recuperato correttamente, perciò adesso è vuoto e salvando andrai a scrivere il css sul server(se c'è).");
    }
    //goToSection("EditStory");
  });
}

function delete_current_story() {
  $.post("/editor/deleteStory",{story_ids:[CurrentWork.story_ID]}, function(data,status){
    $("#story_id_p").text(JSON.parse(data).msgs[0].msg);
    goToSection("final_section");
    $('#success_modal').modal('show');
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
        console.log("data dopo deletestory: ",data)
        resolve(data);
      });
    }
    else
      resolve();
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
    else
      resolve();
  });

  Promise.all([delete_promise, publisher_promise]).then(data => {
    console.log("i'm inside promise all")
    let msg_array = [];
    if( data[0] )
      msg_array = msg_array.concat(JSON.parse(data[0]).msgs); 
    if( data[1] )
      msg_array = msg_array.concat(JSON.parse(data[1]).msgs);    
    if( msg_array.length > 0 ) {
      //console.log("msg array: ",msg_array)
      $("#feedback_div").empty();
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
      getStories("Explorer");
    }
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

function show_evaluation() {
  let obj=isPublishable(CurrentWork);
  $("#collapseExample").empty();
  if(obj.ok){
    $("#collapseExample").css("color","rgb(153, 230, 171)");
    $("#collapseExample").css("background-color","rgb(26, 62, 41)");
    $("#collapseExample").css("border-color","rgb(37, 90, 50)");
    $("#collapseExample").text("La storia è pubblicabile!");
  }else{
    $("#collapseExample").css("color","rgb(225, 134, 143)");
    $("#collapseExample").css("background-color","rgb(67, 12, 17)");
    $("#collapseExample").css("border-color","rgb(104, 18, 27)");
    obj.errors.forEach( error => {
      $("#collapseExample").append(error+"<br>");
    });
  }
}

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

  //$( "#PromptSave" ).modal("show");

  //$( "#PromptSave .button[data-dismiss=modal]" ).on( "click",  function() {})
}

function change_navbar(how) {
  switch (how) {
    case "show":
      //edit fields noned
      $("#back_nav").css("display","inherit");
      $("#delete_nav").css("display","inherit");
      $("#duplicate_nav").css("display","inherit");
      $("#final_button").attr("onclick","goToSection('ChooseStoryToEdit')");
      break;   
    case "hide":
      //edit fields shown
      $("#back_nav").css("display","none");
      $("#delete_nav").css("display","none");
      $("#duplicate_nav").css("display","none");
      $("#final_button").attr("onclick","goToSection('MainMenu')");
      break;
  }
}

function close_css_window() {
  if ( CSS_Editor_Window )
    CSS_Editor_Window.close();
}