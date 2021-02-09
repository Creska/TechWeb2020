/* json and css variables respectively */
var CurrentWork;
var CSSdata;

/**
 * @param which
 * Story or quest title
 */
function save_title( which ) {
	let title;
	switch ( which ) {
	  case "story":
		title = $( '#StoryTitleInput' ).val().trim().replace(/(<([^>]+)>)/gi, "");
		CurrentWork.story_title = title;
  
		breadcrumbs();
  
		change_color_option( "#SaveStoryTitle", "btn-primary", "btn-success" );
		$( "#SaveStoryTitle" ).text( "Salvato!" );
		break;
	  case "quest":
		if (CurrentNavStatus.QuestN < 0) {
		  title = $("#NewQuestWidget input").val().trim().replace(/(<([^>]+)>)/gi, "");
		  CurrentWork.quests[CurrentWork.quests.length - 1].quest_title = title;
		}
		else {
		  title = $( '#QuestTitleInput' ).val().trim().replace(/(<([^>]+)>)/gi, "");

		  CurrentWork.quests[CurrentNavStatus.QuestN].quest_title = title;
		  breadcrumbs();
  
		  // aggiorna il nome della card
		  if ( title )
			$( "#QuestsGrid .card-title strong" ).eq( CurrentNavStatus.QuestN ).html( title );
		  else
			$( "#QuestsGrid .card-title strong" ).eq( CurrentNavStatus.QuestN ).html( "<em>QuestSenzaNome</em>" );
  
		  CurrentWork.QuestGrid = $( "#QuestsGrid" ).html();
  
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
		case "Video":
			CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text.push({
			  type: "video",
			  content: ""
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
	  accessibility: {
		  WA_visual: false,
		  WA_motor: false,
		  WA_hearing: false,
		  WA_convulsions: false,
		  WA_cognitive: false
	  },
	  story_title: "",
	  game_mode: "",
	  players: 0,
	  show_score: true,
	  publishable: false,
	  published: false,
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
		  quest_id: get_new_id("quest"),
		  activities: []
	};
  
	  return EmptyQuest;
  };
  
  function get_new_id(which) {
	let id;
	let not_unique = false;
	switch (which) {
		case "quest":
			do {
				id = "Q"+ Math.floor(Math.random() * 1000).toString();//generate number from 0 to 999 
				for(i=0;i <CurrentWork.quests.length;i++ ){
					if(CurrentWork.quests[i].quest_id == id) {
						not_unique = true;
						break;
					}
				}
			}while(not_unique);
			break;
		case "activity":
			do {
				id = CurrentWork.quests[CurrentNavStatus.QuestN].quest_id+"A"+Math.floor(Math.random() * 1000).toString();//generate number from 0 to 999 
				for(i=0;i <CurrentWork.quests[CurrentNavStatus.QuestN].activities.length;i++ ){
					if(CurrentWork.quests[CurrentNavStatus.QuestN].activities[i].activity_id == id) {
						not_unique = true;
						break;
					}
				}
			}while(not_unique);
			break;
	}
	return id;
}
  /**
   * Inizializza un oggetto attività vuoto per il JSON
   */
  function initActivity() {
	  let EmptyActivity = {
	  activity_id: get_new_id("activity"),
	  activity_text: [],
	  activity_type: "ANSWER",
		  answer_field: {
		description: "",
		type: "",
		options: []
	  },
		  answer_outcome: [{
			  condition: null,
			  next_quest_id: "",
			  next_activity_id: "",
			  score: null
		  }],
		  ASK_EVAL: 0,
		  GET_CHRONO: 0,
	  expected_time: "",
	  FINAL: 0
	  };
  
	  return EmptyActivity;
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