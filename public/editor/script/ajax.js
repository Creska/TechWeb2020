  function duplicate_story() {
    $.ajax({
      url: '/editor/duplicate',
      type: 'POST',
      data: {story_id: CurrentWork.story_ID},
      success: function (data) {
        $('#dup_text').text(JSON.parse(data));
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
        $("#story_id_p").text("La storia '"+(CurrentWork.story_title?CurrentWork.story_title:"senza nome")+"' è stata salvata con l'id: "+data.story_id);//data? { story_id: string, file_errors: array }
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
        goToSection("final_section");
      }
    });
    }
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