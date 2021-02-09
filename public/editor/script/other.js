/* WINDOW */
var CSS_Editor_Window;
var Preview_Window;

/**
 * @param name
 * returns file extension
 */
function getFileExtension( name ) {
  let i = name.lastIndexOf(".");
  if (i > -1)
    return name.slice((i - 1 >>> 0) + 2);
  else
    return "null";
};


/**
 * Error alert
 */
function handleError() {
  window.alert( "ERRORE !\nPer evitare eventuali rallentamenti del broswer, si consiglia di chiudere o ricaricare la pagina." );
};

function get_media_path(name) {
  return "/player/stories/" +(CurrentWork.published?"published":"unpublished")+"/"+CurrentWork.story_ID+"/"+name;
}

function show_evaluation() {
  let obj=isPublishable(CurrentWork);
  $("#ErrorList").empty();
  if(obj.ok){
    $("#ErrorList").css("color","rgb(153, 230, 171)");
    $("#ErrorList").css("background-color","rgb(26, 62, 41)");
    $("#ErrorList").css("border-color","rgb(37, 90, 50)");
    $("#ErrorList").text("La storia è pubblicabile!");
  }
  else{
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

/**
* Show or hide the guide
*/
function showHelp() {
	if ( $( "#Help" ).css( "display" ) == "none" ) {
	  stopAnimation();
	  $( "#" + CurrentNavStatus.Section ).fadeOut();
	  $( "#Help" ).fadeIn( function() {
		$( "#HelpBtn" ).html( '<i class="fas fa-times"></i>' );
	  });
	}
	else {
	  $( "#Help" ).fadeOut();
	  $( "#" + CurrentNavStatus.Section ).fadeIn( function() {
		$( "#HelpBtn" ).html( '<i class="fas fa-question"></i>' );
	  });
	}
};
