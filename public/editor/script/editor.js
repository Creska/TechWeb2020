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
var MediaBuffer;
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
 * Alert di errore
 */
function handleError() {
  window.alert( "ERRORE !\nPer evitare eventuali rallentamenti del broswer, si consiglia di chiudere o ricaricare la pagina." );
};

function duplicate_story() {
  $.ajax({
    url: '/editor/duplicate',
    type: 'POST',
    data: {story_id: CurrentWork.story_ID},
    success: function (data) {
      $('#dup_text').text(data);
      $('#duplicate_modal').modal('show');
    },
    error: function (err) {
      $('#fail_modal').modal('show');
    }
  });
}

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
      case "Qrcodes":
        create_Qrcodes_grid(obj.stories);
    }
    if( obj && obj.error_msg ){
      $("#"+caller +"_div_error p").empty();
      $("#"+caller+ "_div_error p").text(obj.error_msg); 
      $("#"+caller+"_div_error").css("display", "inherit");
    }  
  });
}

function create_Qrcodes_grid(stories) {
  $("#qrcodes_grid").empty();
  $("#qrcodes_grid").append('<div class="row mb-4"></div>');
  stories.forEach( story => {
    let header = $("<div>"+story.title+"<br>"+story.id+"</div>");
    let canvas = $('<canvas id="qr_canvas'+story.id+'"></canvas>');
    let button = $('<a href="#" class="btn btn-lg btn-success mt-2 mb-2" id="btn-download'+story.id+'" download="'+story.title+'.png"><i class="fa fa-download"></i></a>');
    button.on("click",function (e) {
        var dataURL = document.getElementById('qr_canvas'+story.id).toDataURL('image/png');
        document.getElementById('btn-download'+story.id).href = dataURL;
    });
    let qr_success = $('<div id="qr_success'+story.id+'"></div>');
    qr_success.append(canvas);
    qr_success.append("<br>");
    qr_success.append(button);
    let cell = $('<div class="col mr-3"></div>');
    cell.append(header);
    cell.append(qr_success);
    if( $("#qrcodes_grid > div:nth-last-child(1)").children().length >= 3 )
      $("#qrcodes_grid").append('<div class="row mb-4"></div>');
    $("#qrcodes_grid > div:nth-last-child(1)").append(cell);
    qr(story.id);
  });
  if( $("#qrcodes_grid").children().length >1) {
    while( $("#qrcodes_grid > div:nth-last-child(1)").children().length < 3) {
      let col = $('<div class="col mr-3"></div>');
      $("#qrcodes_grid > div:nth-last-child(1)").append(col);
    }
  }
}

function start_saving() {
  // close_css_window(); --> l'ho spostato nel chiamante navbar()
  CurrentWork.publishable = isPublishable(CurrentWork); 
  if(CurrentWork.publishable.ok)
    $("#publish_directly").modal("show");
  else {
    //CurrentWork.publishable.ok = true;//for testing purposes
    saveStory();
  }
}
function prepare_saveStory_stuff() { 
  let clean_cw = jQuery.extend(true, {}, CurrentWork);//deep copy CurrentWork
  let coordinates= {};
  let media = {};
  let q=0;
  while(clean_cw.quests[q]){
    let a=0;
    while(clean_cw.quests[q].activities[a]){
      let at=0;
      while(clean_cw.quests[q].activities[a].activity_text[at]){
        if( clean_cw.quests[q].activities[a].activity_text[at].type == "gallery" /*||clean_cw.quests[q].activities[a].activity_text[at].type == "video" */ ) {
          let c=0;
          while(clean_cw.quests[q].activities[a].activity_text[at].content[c]) {
            if( clean_cw.quests[q].activities[a].activity_text[at].content[c].isFile ) {
              let key = "key"+q+a+at+c;
              console.log("key: ", key)
              media[key] = clean_cw.quests[q].activities[a].activity_text[at].content[c].src;
              coordinates[key] = [q,a,at,c];
              delete clean_cw.quests[q].activities[a].activity_text[at].content[c].src;             
              clean_cw.quests[q].activities[a].activity_text[at].content[c].isFile = false;
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
  return { clean_cw: clean_cw, coordinates: coordinates, media: media }; 
} 

function get_media_path(name) {
  return "/player/stories/" +(CurrentWork.published?"published":"unpublished")+"/"+CurrentWork.story_ID+"/"+name;
}

function saveStory() {
  let stuff = prepare_saveStory_stuff();
  var formData = new FormData();
  formData.append("story_json", JSON.stringify(stuff.clean_cw) );//CurrentWork is expected to be stringified
  formData.append("story_css", JSON.stringify(CSSdata));
  formData.append("coordinates", JSON.stringify(stuff.coordinates));
  let dim=0;
  for( key in stuff.media ) {
    dim += stuff.media[key].size;
    formData.append(key,stuff.media[key] );
  }
  if( dim >= (100 * 1024 * 1024) ){
    $("#too_much_modal").modal("show");
  }
  else {
  $.ajax({
    url: '/editor/saveStory',
    type: 'POST',
    contentType: false ,
    processData: false,
    data: formData,
    success: function (data) {
      $("#story_id_p").text("Id storia: "+data.story_id);//data? { story_id: string, file_errors: array }
      if( data.file_errors && data.file_errors.length > 0 ) {
        let list = $("<ul/>");
        $("#story_id_p").append(", ma i seguenti file non sono stati salvati:");
        if(data.css_error)
          list.append("<li>Il file css.</li>");
        data.file_errors.forEach( element => {
          list.append("<li>"+element.name+"</li>");
        });
        $("#story_id_p").append(list);
        $("#story_id_p").append("Se vuoi puoi provare ad aggiungerli in un secondo momento.");
      }
      CurrentWork.story_ID = data.story_id;//for eventual retries
      qr(data.story_id);
      goToSection("final_section");
      $('#success_modal').modal('show');
    }
  });
  }
}

function qr(id){
  QRCode.toCanvas(document.getElementById('qr_canvas'+id), 'http://site192041.tw.cs.unibo.it/player?story='+id, function (error) {
  if (error) {
    $("#qr_success"+id).append("C'è stato un errore, in ogni caso l'url è: http://site192041.tw.cs.unibo.it/player?story="+id); 
    $('#qr_canvas'+id).remove();
    $('#btn-download'+id).remove();
  //in qr_error the url has to be written
  }
})
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
        ids_to_pub_unpub.push( { id: get_id_subtitle(card), published: true } );
    }
  })
  $("#publishedContainer").children().each( (index,deck) => {
    let cards = deck.children;
    for (let card of cards) {
      if( card.id.slice(0,4) == "able"  )
        ids_to_pub_unpub.push( { id: get_id_subtitle(card) } );
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

  if ( obj.players < 2 ) {
    if ( obj.game_mode == "GROUP" || obj.game_mode == "CLASS" ) {
      res.ok = false;
      res.errors.push( "Storia - Numero di giocatori non specificato" );
    }
  }

  if ( CSSdata.valid == false ) {
    res.ok = false;
    res.errors.push( "Storia - CSS stylesheet non valido" );
  }

  if ( obj.quests.length < 2 ) {
    res.ok = false;
    res.errors.push( "Storia - Numero di quest insufficiente" );
  }

  /* controlli sulle quest */
  $.each( obj.quests, function(q_index, q) {
    if ( q.quest_title === "" ) {
      res.ok = false;
      res.errors.push( "Quest " + q.quest_id + " - Titolo mancante" );
    }

    if ( q.activities.length < 1 ) {
      res.ok = false;
      res.errors.push( "Quest " + q.quest_id + " - Numero di attività insufficiente" );
    }

    /* controlli sulle attività */
    $.each( q.activities, function(a_index, a) {
      
      /* presenza del testo */
      if ( a.activity_text.length < 1 ) {
        res.ok = false;
        res.errors.push( "Quest " + q.quest_id + " - Attività " + a.activity_id + " - Testo mancante" );
      }

      /* presenza delle descrizioni delle immagini */
      if ( obj.accessibility.WA_visual || obj.accessibility.WA_convulsions || obj.accessibility.WA_cognitive ) {
        $.each( a.activity_text, function(p_index, p) {
          if ( p.type == "gallery" ) {
            $.each( p.content, function(image_index, image) {
              if ( image.alt == "" || image.alt === undefined ) {
                res.ok = false;
                res.errors.push( "Quest " + q.quest_id + " - Attività " + a.activity_id + " - Mancano alcune descrizioni delle immagini" );
                return false;
              }
            });
          }
        });
      }


      if ( a.activity_type == "ANSWER" ) {
        /* presenza del testo della domanda */
        if ( a.answer_field.description === "" ) {
          res.ok = false;
          res.errors.push( "Quest " + q.quest_id + " - Attività " + a.activity_id + " - Testo della domanda mancante" );
        }

        /* presenza e correttezza del campo risposta */
        if ( a.answer_field.type === "" || ( a.answer_field.type == "checklist" && a.answer_field.options.length < 1 ) ) {
          res.ok = false;
          res.errors.push( "Quest " + q.quest_id + " - Attività " + a.activity_id + " - Campo risposta incompleto o assente" );
        }

        /* presenza del tempo previsto */
        if ( a.GET_CHRONO && a.expected_time < 60000 ) {
          res.ok = false;
          res.errors.push( "Quest " + q.quest_id + " - Attività " + a.activity_id + " - Tempo previsto non specificato" );
        }
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
  $("#ErrorList").empty();
  if(obj.ok){
    $("#ErrorList").css("color","rgb(153, 230, 171)");
    $("#ErrorList").css("background-color","rgb(26, 62, 41)");
    $("#ErrorList").css("border-color","rgb(37, 90, 50)");
    $("#ErrorList").text("La storia è pubblicabile!");
  }else{
    $("#ErrorList").css("color","rgb(225, 134, 143)");
    $("#ErrorList").css("background-color","rgb(67, 12, 17)");
    $("#ErrorList").css("border-color","rgb(104, 18, 27)");
    obj.errors.forEach( error => {
      $("#ErrorList").append(error+"<br>");
    });
  }
}

function set_default_story_settings() {
  mode = "default";
  first_selected_stage = "";
  first_selected_card_index = -1;
  selected_card = "";
  CardClickDisabled = false;
};
