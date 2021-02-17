/* indica la sezione dell'editor dove l'utente si trova attualmente e la quest/attività su cui sta lavorando */
var CurrentNavStatus = {
	Section: "MainMenu",
	QuestN: -1,
  ActivityN: -1,
  TextPartN: -1
};

function MainMenu( action, is_new ) {
    switch ( action ) {
        case "STORY":
            set_default_story_settings();
            if ( is_new )
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
		case "QRCODE":
			goToSection("Qrcodes");
    }
};
  
  
  
function Navbar( option ) {
    switch ( option ) {
        case "Graph":
            if ( CurrentNavStatus.Section != "Graph" ) {
            create_graph();
            goToSection("Graph");
        }
        break;
        case "Save":
            if ( CSS_Editor_Window != null ) {
                CSS_Editor_Window.postMessage({
                    event_type: "close"
                }, "*" );
            }
            start_saving();
            break;
        case "CSSEditor":
            CSS_Editor_Window = window.open( "../css_editor/css_editor.html", "tab" );
            break;
        case "Preview":
            openPreview();
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
};

  
function change_navbar(how) {
    switch (how) {
        case "show":
            // mostra i buttons relativi ad una storia già esistente
            $("#back_nav").toggle( true );
            $("#delete_nav").toggle( true );
            $("#duplicate_nav").toggle( true );
            //$("#final_button").attr("onclick","goToSection('ChooseStoryToEdit')");
            break;   
        case "hide":
            // nasconde i buttons
            $("#back_nav").toggle( false );
            $("#delete_nav").toggle( false );
            $("#duplicate_nav").toggle( false );
            //$("#final_button").attr("onclick","goToSection('MainMenu')");
            break;
    }
};



function close_css_window() {
    if ( CSS_Editor_Window )
        CSS_Editor_Window.close();
};



function nav_resets() {
    change_color_option(".SwapBtn", "btn-primary", "btn-secondary");
    change_color_option(".CancelBtn", "btn-primary", "btn-secondary");
    
    mode = "default";
    first_selected_stage = "";
    first_selected_card_index = -1;

    if ( CurrentWork != undefined && CurrentWork.story_ID != null && CurrentWork.story_ID != "" )
        change_navbar( "show" );
    else
        change_navbar( "hide" );
};


/**
 * Torna alla sezione precedente
*/
function back() {
	switch ( CurrentNavStatus.Section ) {
		case "Graph":
			goToSection( before_section );
			break;
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
		case "OutcomesSection":
			goToSection( "EditActivity" );
			break;
	  	case "EditText":
	  	case "EditGallery":
		case "VideoSection":
			CurrentNavStatus.TextPartN = -1;
			goToSection( "EditActivity" );
			break;
	}
};

/**
* @param where
* Porta alla sezione specificata, facendo tutti i caricamenti necessari
*/
function goToSection(where) {
    $( "#" + CurrentNavStatus.Section ).fadeOut( function() {
        nav_resets();
	    switch ( where ) {
			case "Qrcodes":
				getStories("Qrcodes");
				break;
		    case "Graph":
		        before_section = CurrentNavStatus.Section;
                break;
        
		    case "MainMenu":
			    $( ".masthead" ).fadeOut();
                $( "#breadcrumbs" ).fadeOut();
                
                CurrentNavStatus.QuestN = -1;
                CurrentNavStatus.ActivityN = -1;
                CurrentNavStatus.TextPartN = -1;
                break;
        
		    case "EditStory":
		        $( ".masthead" ).fadeIn();
		        $( "#breadcrumbs" ).fadeIn();
  
		        $( "#ErrorList" ).empty();
		        $( "#EditStory_div_error" ).toggle( false );
		        $( "#StoryTitleInput" ).val( CurrentWork.story_title );
		        change_color_option( "#SaveStoryTitle", "btn-primary", "btn-success" );
		        $( "#SaveStoryTitle" ).text( "Salvato!" );
  
		        $( "#QuestsGrid" ).html( String(CurrentWork.QuestGrid) );
                break;
          
		    case "ChooseGameMode":
		        loadGameModeSection();
                break;
          
		    case "EditQuest":
		        if ( CurrentNavStatus.Section == "EditStory" ) {
			        CurrentNavStatus.QuestN = get_card_index();
			        if ( CurrentWork.quests[CurrentNavStatus.QuestN] === undefined ) {
				        handleError();
				        return;
			        }
		        }
  
		        $( "#QuestTitleInput" ).val( CurrentWork.quests[CurrentNavStatus.QuestN].quest_title );
		        change_color_option( "#SaveQuestTitle", "btn-primary", "btn-success" );
		        $( "#SaveQuestTitle" ).text( "Salvato!" );
  
		        $( "#ActivitiesGrid" ).html( CurrentWork.ActivityGrids[CurrentNavStatus.QuestN] ); //carica la griglia delle attività
                break;
          
		    case "EditActivity":
		        if ( CurrentNavStatus.Section == "EditQuest" ) {
			        CurrentNavStatus.ActivityN = get_card_index();
			        if ( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN] === undefined ) {
				        handleError();
				        return;
			        }
		        }
  
		        /* sistemazione pulsanti e widgets */
		        $( "#ChooseActivityType" ).css( "display", "none" );
		        $( "#MainOutcomeWidget" ).css( "display", "none" );

		        let activity = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];
		        if ( activity.activity_type == "READING" ) {
			        $( "#EditActivity .p-3" ).first().find( ".btn-secondary:nth-child(2n)" ).attr( "disabled", true );
  
			        if ( activity.FINAL )
			            $( "#EditActivity .p-3" ).first().find( ".btn-secondary:nth-child(3)" ).attr( "disabled", true );
			        else
			            $( "#EditActivity .p-3" ).first().find( ".btn-secondary:nth-child(3)" ).attr( "disabled", false );
		        }
		        else {
			        $( "#EditActivity .p-3" ).first().find( ".btn-secondary" ).attr( "disabled", false );
		        }
	  
		        //carica la griglia dei paragrafi/immagini/gallerie
		        $( "#ParagraphsGrid" ).html( CurrentWork.ParagraphGrids[CurrentNavStatus.QuestN][CurrentNavStatus.ActivityN] );
                break;
          
		    case "EditText":
		        CurrentNavStatus.TextPartN = get_card_index();
		        if ( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN] === undefined ) {
			        handleError();
			        return;
		        }
  
		        $( "#TextParInput" ).val( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN]. content );
                break;
          
		    case "EditGallery":
		        CurrentNavStatus.TextPartN = get_card_index();
		        if ( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN] === undefined ) {
			        handleError();
			        return;
		        }
  
		        loadEditGallerySection();
                break;
          
		    case "VideoSection":
			    CurrentNavStatus.TextPartN = get_card_index();
			    if ( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[CurrentNavStatus.TextPartN] === undefined ) {
				    handleError();
				    return;
			    }

			    loadVideoSection();
                break;
            
		    case "EditAnswerField":
		        loadEditAnswerFieldSection();
                break;
          
		    case "OutcomesSection":
			    loadOutcomesSection();
                break;
            
		    case "ChooseStoryToEdit":
                CurrentNavStatus.QuestN = -1;
                CurrentNavStatus.ActivityN = -1;
                CurrentNavStatus.TextPartN = -1;

			    $( ".masthead" ).fadeOut();
			    $( "#breadcrumbs" ).fadeOut();
		        getStories("ChooseStoryToEdit"); 
                break;
          
		    case "Explorer":
                CurrentNavStatus.QuestN = -1;
                CurrentNavStatus.ActivityN = -1;
                CurrentNavStatus.TextPartN = -1;

			    $( ".masthead" ).fadeOut();
			    $( "#breadcrumbs" ).fadeOut();
				$("#feedback_div").empty();
		        getStories("Explorer");
                break;
            
		    case "final_section":
                $( ".masthead" ).fadeOut();
			    $( "#breadcrumbs" ).fadeOut();
                break;
            
		    default:
		        handleError();
	    }
	  
	    CurrentNavStatus.Section = where;
	    breadcrumbs();
	    $( "#" + where ).fadeIn();
	});
};


function breadcrumbs() {
	switch ( CurrentNavStatus.Section ) {
		case "EditStory":
		case "ChooseGameMode":
			$( "#breadcrumbs ol li:not(:first-child)" ).remove();

			if ( CurrentWork.story_title )
				$( "#breadcrumbs ol li" ).first().html( CurrentWork.story_title + "&nbsp;" + "(" + CurrentWork.story_ID + ")" );
			else
				$( "#breadcrumbs ol li" ).first().html( "<em>StoriaSenzaNome</em>" + "&nbsp;" + "(" + CurrentWork.story_ID + ")" );
			break;
		case "EditQuest":
			let quest = CurrentWork.quests[CurrentNavStatus.QuestN]
			$( "#breadcrumbs ol li:not(:first-child)" ).remove();

			if ( quest.quest_title )
				$( "#breadcrumbs ol" ).append( $( "<li class='breadcrumb-item'/>" ).html( quest.quest_title + "&nbsp;" + "(" + quest.quest_id + ")" ) );
			else
				$( "#breadcrumbs ol" ).append( $( "<li class='breadcrumb-item'/>" ).html( "<em>QuestSenzaNome</em>" + "&nbsp;" + "(" + quest.quest_id + ")" ) );
			break;
		case "EditActivity":
		case "EditAnswerField":
		case "OutcomesSection":
			let activity = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];
			$( "#breadcrumbs ol li:nth-child(n+3)" ).remove();
			$( "#breadcrumbs ol" ).append( $( "<li class='breadcrumb-item'/>" ).text( "Attività " + activity.activity_id ) );
			break;
		case "EditText":
		case "EditGallery":
		case "VideoSection":
			$( "#breadcrumbs ol" ).append( $( "<li class='breadcrumb-item'/>" ).text( "parte " + CurrentNavStatus.TextPartN ) );
	}
};


function openPreview() {
	let target_url = "http://localhost:8000/player?story=" + CurrentWork.story_ID + "&testing=true";

	Preview_Window = window.open( target_url, "tab" );
};