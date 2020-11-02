var b = [ false, false, false, false, false, false, false ]; // true: b[i] è selezionato
var bgs = [ "bg-secondary", "bg-secondary", "bg-secondary", "bg-secondary", "bg-secondary", "bg-success", "bg-danger"];

/* -------------------------------- ROBA PER DEBUGGING ----------------------------------------- */

function sayHello() {
	window.alert('hello');
};

function printCurrentJson() {
	console.log( CurrentWork );
}


/* -------------------------- PROCEDURE ---------------- */
/**
 * @param i --> indice del pulsante selezionato
 * Deseleziona tutte le opzioni diverse dal pulsante di indice i
 */
function deselect_other_options( i ) {
	let x;
	switch (i) {
	  case 3:
		x = i+1;
		break;
	  case 4:
		x = i-1;
		break;
	  case 5:
		x = i+1;
		break;
	  case 6:
		x = i-1;
		break;
	  default:
		x = -1;
		for ( y = 0; y < 3; y++ ) {
		  if ( b[y] && (y != i) )
			x = y;
		}
	}
  
	if( b[x] ) {
	  change_color_option( "#a" + x, "bg-primary", bgs[x] );
	  b[x] = false;
	}
};
  
  
/**
* Controlla che siano selezionate le opzioni necessarie per far partire l'editing della storia
*/
function check_select() {
	if( (b[0] ^ b[1] ^ b[2]) && (b[5] ^ b[6]) ) {
	  if ( b[1] ^ b[2] ) {
		if ( b[3] ^ b[4] )
		  $( "#StartEditing" ).removeClass( "disabled" );
		else
		  $( "#StartEditing" ).addClass( "disabled" );
  
		return;
	  }
  
	  $( "#StartEditing" ).removeClass( "disabled" );
	}
	  
	else
	  $( "#StartEditing" ).addClass( "disabled" );
};

  
/**
* @param i --> numero del pulsante
* Seleziona il pulsante con indice i e deseleziona tutti gli altri
*/
function select( i ) {
	b[i] = !b[i];
  
	if( b[i] ) {
	  change_color_option( "#a" + i, bgs[i], "bg-primary" );
	  deselect_other_options( i );
  
	  switch (i) {
		case 0:
		  $( "#NumberOfDevices" ).addClass( "invisible" );
		  break;
		case 1:
		case 2:
		  $( "#NumberOfDevices" ).removeClass( "invisible" );
	  }
	}
	else
	  change_color_option( "#a" + i, "bg-primary", bgs[i] );
  
	check_select();
};


/**
 * Carica la sezione e i parametri in base ai dati salvati nel json
 */
function loadEditAnswerFieldSection() {
	let activity = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];

	$( "#ChecklistPreview ul" ).empty();

	switch ( activity.answer_field.type ) {
		case "checklist":
			$( "#QuestionType_Checklist" ).prop("checked", true);

			$.each( activity.answer_field.options, function( index, value ) {
				addAnswerOption( value );
			});
	
			$( "#ChecklistPreview" ).toggle(true);
			break;
		case "text":
			$( "#QuestionType_Text" ).prop("checked", true);
			$( "#ChecklistPreview" ).toggle(false);
			break;
		case "number":
			$( "#QuestionType_Number" ).prop("checked", true);
			$( "#ChecklistPreview" ).toggle(false);
			break;
		default:
			$( "#AFtype input[name=QuestionType" ).prop("checked", false);
			$( "#ChecklistPreview" ).toggle(false);
	}

	$("InsertAnswerFieldDescription").val( activity.answer_field.description );

	$( "#AnswerTimer" ).val( activity.expected_time / 60000 );
	$( "#AnswerScore" ).val( activity.answer_score );
	$( "#InsertTimer" ).prop( "checked", activity.GET_CHRONO );
	if ( $( "#InsertTimer" ).prop( "checked" ) )
		$( "#AnswerTimer" ).prop( "disabled", false );
	else
		$( "#AnswerTimer" ).prop( "disabled", true );
	$( "#NeedEvaluation" ).prop( "checked", activity.ASK_EVAL );
};


/**
 * @param option
 * Aggiunge option all'elenco delle risposte della checklist
 */
function addAnswerOption( option ) {
	if ( option && option != "default" )
		$("#ChecklistPreview ul").append( $( "<li>" + "<span>" + option + "</span><button class='btn btn-danger btn-sm' onclick='$(this).parent().remove()'><i class='fas fa-minus'></i></button></li>" ) );

	$("#AddAnswerOption input").val("");
};


/**
 * Salva tutte le personalizzazioni che l'utente ha creato per il Campo risposta
 */
function saveAnswerFieldSettings() {
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field.description = $( "#InsertAnswerFieldDescription" ).val().trim();
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field.options = [];

	$( "#AFtype input[name=QuestionType]" ).each( function() {
		if ( $(this).prop("checked") ) {
			switch ( $(this).attr("id") ) {
				case "QuestionType_Checklist":
					CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field.type = "checklist";
					break;
				case "QuestionType_Text":
					CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field.type = "text";
					break;
				case "QuestionType_Number":
					CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field.type = "number";
					break;
			}
		}
	});

	if ( $("#QuestionType_Checklist").prop("checked") ) {
		$("#ChecklistPreview ul li").each( function() {
			CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_field.options.push( $(this).find("span").first().text() );
		});
	}

	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].expected_time = $( "#AnswerTimer" ).val() * 60000;
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].GET_CHRONO = $( "#InsertTimer" ).prop( "checked" );
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].ASK_EVAL = $( "#NeedEvaluation" ).prop( "checked" );

	back();
};


/**
 * Carica la sezione ed i parametri in base ai dati salvati nel json. Aggiunge eventuali alert nel caso sia scelta l'opzione di attività interattiva ma mancano i requisiti per farlo funzionare (ovvero: spuntata l'opzione di richeista valutazione, oppure answer field incompleto)
 */
function loadEditOutcomeSection() {
	let CurrentStage = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];

  	/* costruzione del recap dell'Answer Field */
  	$( "#AnswerFieldRecap" ).empty();

	let OutcomeAlert = $( `<div class="col-xs-12 alert alert-danger text-justify" role="alert"><i class="fas fa-exclamation-circle"></i></div>` );

  	if ( CurrentStage.ASK_EVAL ) {
    	OutcomeAlert.append( $("<p>Per questa attività è stata richiesta la valutazione in tempo reale.</p>") );
    	$( "#AnswerFieldRecap" ).append( OutcomeAlert );
  	}
  	else {
    	if ( $.isEmptyObject( CurrentStage.answer_field ) || CurrentStage.answer_field.type == "" || ( CurrentStage.answer_field.type == "checklist" && CurrentStage.answer_field.options.length < 2 ) ) {
			OutcomeAlert.append( $("<p>Campo risposta incompleto.</p>") );
			$( "#AnswerFieldRecap" ).append( OutcomeAlert );
    	}
    	else {
      		$( "#AnswerFieldRecap" ).append( $( "<h4>Anteprima del campo risposta</h4>" ) );
    	}
  	}

	/* reset delle tabelle degli outcomes */
	$( "#AnswerActivity .OutcomesTable tr:nth-child(n+3)" ).remove();
	$( ".OutcomesTable input[type=checkbox]" ).prop( "checked", false );
	$( ".OutcomesTable input[type=number]" ).attr( "disabled", false );
	$( ".OutcomesTable input[type=number]" ).val( "" );

	/* caricamento dei dati presenti nel JSON */
	if ( CurrentStage.activity_type == 'ANSWER' ) {
		$( "#ActivityType_Answer" ).prop( "checked", true );
		$( "#SetAnswerOutcome .Save-Cancel button:first-child" ).attr( "disabled", $( "#AnswerFieldRecap .alert-danger" ).length );

		let tr;

		$.each( CurrentStage.answer_outcome, function(index, value) {
			if ( value.response == "default" ) {
				tr = $( "#AnswerActivity .OutcomesTable tr:nth-child(2)" )
			}
			else {
				addOutcome( value.response );
				tr = $( "#AnswerActivity .OutcomesTable tr:last-child" );
			}

			tr.find("input[type=checkbox]").prop( "checked", value.nextquest );
			tr.find("input[type=number]").attr( "disabled", value.nextquest );
			tr.find("input[type=number]").val( value.nextactivity );
		}); 
	}
	else if ( CurrentStage.activity_type == 'READING' ) {
		$( "#ActivityType_Reading" ).prop( "checked", true );
		$( "#SetAnswerOutcome .Save-Cancel button:first-child" ).attr( "disabled", false );
		
		$( "#ReadingActivity .OutcomesTable tr:nth-child(2) :input[type='checkbox']" ).prop( "checked", CurrentStage.answer_outcome[0].nextquest );
		$( "#ReadingActivity .OutcomesTable tr:nth-child(2) :input[type='number']" ).attr( "disabled", CurrentStage.answer_outcome[0].nextquest );
		$( "#ReadingActivity .OutcomesTable tr:nth-child(2) :input[type='number']" ).val( CurrentStage.answer_outcome[0].nextactivity );
	}
	else {
		$( "#ChooseActivityType input[type=radio]" ).prop( "checked", false );
		$( "#SetAnswerOutcome .Save-Cancel button:first-child" ).attr( "disabled", false );

		$( "#AnswerActivity" ).toggle(false);
		$( "#ReadingActivity" ).toggle(false);
	}
};


/**
 * @param label
 * Aggiunge alla tabella un nuovo outcome con la label specificata
 */
function addOutcome( label ) {
	if ( label && label != "default" ) {
		let newtr = $( "<tr/>" );
  		newtr.append( $.parseHTML( "<td>" + label + "</td>" ) );
  		newtr.append( $.parseHTML( '<td><input type="checkbox"></td>' ) );
  		newtr.append( ( $( "<input/>",
  		{
    		type: "number",
    		placeholder: 0,
    		min: 0
  		})).wrap( "<td></td>" ).parent());
  		newtr.append( $.parseHTML( `<td><button class="btn btn-danger" onclick="$(this).parent().parent().remove()"><i class='fas fa-minus'></i></button></td>` ) );
  		$( "#AnswerActivity .OutcomesTable" ).append( newtr );
	}
};


/**
 * Salva nel JSON tutti gli outcomes settati dall'autore e la tipologia di attività
*/
function saveOutcomes() {
	CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome = [];

	if ( $( "#ActivityType_Reading" ).prop("checked") ) {
		CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_type = 'READING';

		CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome.push({
			response: "default",
			nextquest: $("#ReadingActivity .OutcomesTable input[type=checkbox]").eq(0).prop( "checked" ),
			nextactivity: $("#ReadingActivity .OutcomesTable input[type=number]").eq(0).val()
		})
	}
	else if ( $( "#ActivityType_Answer" ).prop("checked") ) {
		CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_type = 'ANSWER';

		let response_name;

		$( "#AnswerActivity .OutcomesTable tr:nth-child(n+2)" ).each( function() {
			if ( $(this).children().first().attr("id") )
				response_name = "default";
			else
				response_name = $(this).children().first().text();

			CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome.push({
				response: response_name,
				nextquest: $(this).find("input[type=checkbox]").first().prop( "checked" ),
				nextactivity: $(this).find("input[type=number]").first().val()
			})
		})
	}	
  
  	// console.log(CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome); // debugging
  	back();
};


/**
 * Salva il paragrafo di testo inserito ed inserisce, nella rispettiva card, una sottostringa come anteprima
 */
function saveTextParagraph() {
  let text = $('#TextParInput').val().trim();

  CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[get_card_index()] = "<p class='TextParagraph'>" + text + "</p>";
  if (text)
    $("#ParagraphsGrid").find(".card-text").eq( get_card_index() ).html( text.substring(0, 25) + "..." );
  else
    $("#ParagraphsGrid").find(".card-text").eq( get_card_index() ).html( "[vuoto]" );
  GridsOfParagraphs[CurrentNavStatus.QuestN][CurrentNavStatus.ActivityN] = $("#ParagraphsGrid").html();

  back()
};


/**
 * @param image
 * @param newload --> segnala se l'oggetto è al suo primo caricamento o se era già presente nel json
 * Carica una nuova immagine nella gallery di anteprima
 */
function addImage( image, newload ) {
  let newrow = $( "<div class='row'></div>" );

  let newpreview;

  if (newload) {
    newpreview = $( "<img class='SingleImage'>" );

    const reader = new FileReader();
    reader.readAsDataURL(image);
      
    reader.addEventListener("load", function() {
      newpreview.attr( "src", this.result );
    });
  }
  else {
    newpreview = $(image).clone(); // usata clone() perché senza sarebbe stato modificato direttamente l'oggetto passato come parametro ad addImage()
    newpreview.attr("class", "SingleImage");
  }
      
  newrow.append( newpreview );
  newrow.append( $( "<input type='text' placeholder='Descrizione'></input>"));
  newrow.append( $( '<button class="btn btn-danger" onclick="$(this).parent().parent().remove()"><i class="fas fa-minus"></i></button>' ));

  newrow.children().wrap("<div class='col-sm'></div>");
  $("#GalleryPreview").append(newrow);
}


/**
 * Carica la galleria di anteprima
 */
function loadEditGallerySection() {
  $("#GalleryPreview").empty();

  gallery = $( $.parseHTML( CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[get_card_index()] ));

  if ( gallery.prop("tagName") == "IMG" ) {
    addImage(gallery, false);
    $( "#GalleryPreview input" ).first().val( gallery.attr("alt") );
  }
  else {
    gallery.find("img").each( function() {
      addImage(this, false);
    });
    /* inserisce in ogni input la descrizione abbinata a ciascuna immagine */
    $("#GalleryPreview").find("input").each( function(index) {
      $(this).val( gallery.find("img").eq(index).attr("alt") );
    });
  }
};


/**
 * Salva la galleria di immagini nel json.
 * A seconda del numero di immagini, crea una img singola o un carousel di Bootstrap
 */
function saveImageGallery() {
  if ( $("#GalleryPreview .row").length == 1 ) {
	$("#GalleryPreview .row img").first().attr( "alt", $("#GalleryPreview .row input").first().val() );
	$("#GalleryPreview .row img").first().attr( "class", "SingleImage" );
	//alert("swag: "+$("#GalleryPreview .row img").first().prop("outerHTML"));
    CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[get_card_index()] = $("#GalleryPreview .row img").first().prop("outerHTML");
  }
  else {
	  /* l'id "ActiveGallery" serve a far funzionare le frecce per scorrere le immagini */
    let newgallery = $(`
    <div class="carousel slide ImageGallery" data-ride="carousel" data-interval="false">
      <div class="carousel-inner">
      </div>
      <a class="carousel-control-prev" role="button" data-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="sr-only">Previous</span>
      </a>
      <a class="carousel-control-next" role="button" data-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="sr-only">Next</span>
      </a>
    </div>`);

    $("#GalleryPreview .row").each( function(index) {
      let row = $(this);
      let newpic = $("<div class='carousel-item'></div>");

      if (index == 0) newpic.addClass("active");

      newpic.append( $("<img/>",
      {
        "class": "d-block w-100",
        src: row.find("img").eq(0).attr("src"),
        alt: row.find("input").eq(0).val()
      }));

      newgallery.children().first().append(newpic);
	});
	
	newgallery.attr( "id", "gallery-index" + CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text.length );
	newgallery.find( "a" ).attr( "href", "#" + newgallery.attr("id") );

    CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].activity_text[get_card_index()] = newgallery.prop("outerHTML");
  }

  back();
};


/**
 * @param Container
 * Aggiunge un elemento lista con un relativo radio input al Container specificato
 */
function addRadio( Container ) {
	let newButton = $( "<input/>",
	{
		type: "radio"
	});

	let newli = $( "<li/>", {});

	switch ( Container ) {
		case "AnswerInput":
			newButton.attr( "name", "AnswerInputGroup" );
			newButton.attr( "id", "AnswerOption" + String( $( "#AnswerInput li" ).length ) );
			newli.append( newButton );
			newli.append( $( "<input/>",
			{
				type: "text",
				val: "Opzione" + String( $( "#AnswerInput li" ).length )
			}));
			$( "#AnswerInput" ).append( newli );
			break;
		default:
			break;
	}
};

/* per ogni quest e per ogni attività scorro l'array activyity_text alla ricerca
di tag img, i cui src contengono i byte stream che ci interessano
{
"ACCESSIBILITY":0,
"story_title":"<div id='StoryTitle' class='StoryTitle'></div>",
"story_ID":-1,
"game_mode":"",
"single_device":1,
"quests":[
	{
	"quest_title":"<h2 class='QuestTitle'></h2>",
	"activities":[
		{
		"activity_text":[
			"<p class='TextParagraph'>deleterio</p>",
			"<img class=\"SingleImage\" src=\"data:image/png;base64,iVBORw0KGgoAAA
			ANSUhEUgAAASwAAACoCAMAAABt9SM9AAACplBMVEUTDzL9vBj///8jHF/tEY8AADIAADH3
			f0L4gkD4fET8fEa2WkD5hD8AAjD9iT+mWzizT0b6a1P1ZlT0YFgABjD1Y1axRUv8kTfjgj
			f7oin6niz6mTH5lTL7nC77pijXRl/1TGf7qiTyR2uwMlsACy79txv8ryH9sx8AHVySIFf3
			L37vK33sAJLwJYL/whb9uQD+xAAbDzTiEozsF4oAAFX6EJPEFIQAAFIAHVgAAGLUE4hEG2
			VzGW/rAJdfGmuIGHSYF3i3FYAqHGAAEV7///NOG2f4j0jwshr9y1//7L3Vnx5vUyvyWW7/
			//U0KDD/9ctrAG4AF1v//+D/3ogADyrEkiCSAHx5GXD+36LxS3b0aGWbdCaPayeBYSkkGz
			GpfiRaRC39xDpTAG32elmrFn7/tlQoEmT9zF72gVX+8tkvJDDtAIH2fFdGNC91VysbFTFE
			KhSvfQAcBxqkhkrOupLu3rv/yElvTQ3pyYf+tmfLaz+URFN7L1NrIlVlOEpvUEHvxm84NF
			Dntkf5oFZsGl88AGr/wnCmAIaNbkLclAX/lXL/5tf7t92Eahr7kbb/e2380/L6uJf4rqf2
			i5H0cn/zZIncYlH7ztb0U5L/6/L/wYTYXWO1WIUSHiw3NyT7pNdQRCGrDGLCjGrAQm1gMy
			5cHjnbYJNHAEbTZ6vjnK/Niq6fapp7PID8m4b/y6TZ2ubZtNDNeomqSJJmLGOYl6/XusKF
			WkVgX4fFebRLAErknmyqh7OLg4x+FVbYx99kY4o2KlurnJJFKkRgU1+FQE2hZGG9loy4l6
			SEaZOHZkjMvKTPrFmHVpT6f7b1iqL8y4HqTKPXlJhERHn+xcHHJHO8ekXRgZundIr/lYn5
			p3W7bDbyQUKTUThbMjaTQEPhfmKFg6AhMVdUBYqgAAAgAElEQVR4nO2di38b1bXvPZoZO0
			AdyNOxpDhRYkkTabRnkDSjaPR+2nLkWLJiW6M4cfSILWEHyqVxCQRiThBpAhcnBAJJ6C0h
			bSkc4tCWFvqgNzzKOdCWUHDuBQ4tl//k7j3yQ7IdqGOBx+b8PvlYsiTPR/PN2muvtfarpu
			a/9d9aJqonK1S/2N9HnipRuuvAjjv39O7u6+vbvbt3z537DtRIL69d7G8nIyEeB/b0dbVg
			YJawtq6+PTvRJxb7W8pAtSS5986+NoQJu44kZH077vqOt0poL/v6Wr6CUzkxCGwfSdYu9n
			deHEEvtaOr5V8BNQ2sBfH6rnkwsr551/fvxtLDA60DaQZqPrx2fof8F1nb/D9+eM8PDnZ2
			dnZEIslIpCOSTA5j8+DVtuO7gQve5Q/77u3o7EgeCt932/2HH3jggQeP/Gh310hi4F9vjh
			ho6V32uOrJ+h92JTo6k4fuu99tt2e6jx3jBUHgc90Z+0O9/zYP74UBbHfNcsYFY6m7hyOd
			yaO3PWwvdvvMJnE0vEq0EFDcupTQbT/SNk9cy9a6YNfXNtDZ8ch9D9szx8xiVoWxIGuiac
			SKoAkWqMVj9h/NhxZsjHcuy8iLJO88DlEdXV8sHiOiDYCFsVV2ghRBmFI6+AKrMsW+bJkf
			rrYDy8+4yOeOn3i04+hWe0wwhDEptNIbJ1Ehy3IZ8/DWmS3HAvNqivBv+pZZWyTv6Mo/1n
			Foa7HbZVCzJRignBWSK8piGLuOnzetln3LiRb5P1WPt19dD1EZJ1FhmNo1ZVWlB8togxZg
			7BBPtcwLlmRcy8VzkbvaRk8mhzIemgtPocJAmOZNp56AOv2kkTZBYjRUFNnWsYfmZ1rIuH
			YuD+Min2t8PHhoW8ZMpyoKCzraHDsNQ/dIR/vBE51PPXn6KZOFoI0YaKRj8+sTJVx7lgMt
			sq/usciZYo42NbKsJhueNq0onYs1sCgtbAWRzvZIMNj+9DO0yKppwt42X1jLoSnW13Y9ef
			bctqKZHmXZsEgT2mmb0ROc03P+i3x+g46FaSGzsm448SxNgzxN8PNuiCiIWOIBPfnj4493
			nsg4aUsjm4fxpyWcTemn7k5Fc854IGC1Z1YnRjTZbH7j+hhHsyma4DJdN0BraTsu8n+t+E
			nHJnuOjoK8hS6FU1kYe7Ks5LvARgtt5n25kP0LALohtViMI0xsFH5SuAHTglrCASr53LqT
			YxcCPJcPWybCAzrPYnlRFFN5mOzA5G5INFm42POJRnAxJPBe+AlRgnVDpgXxL9mIq/a56M
			lTnrhgSZkmw086jEysJCLaBE0MyxJET4fBZ14DrUr6SBbBInJHbsi0wI6lSat2n+HsJzG/
			mbBMRep0NEpMh+00bRRRfEX49q8ZHY/GhMmXpYfAfCPTpUxr7U9NZ08X/ZUZDT0jw5n4dY
			vvoni6yJe/w2X6bsi0liSt5p9Zzj5ldRCEmfh68Xz0fIaq/GT3jbXDpei3ml8wnf05ZGX2
			TtESZiKCPsoMhR4d8bhf4Diu7F3flzfGCltyfWLzC8b2X0BWvJvz8ZwZ8fJCWJy5RIyDT3
			Iedz+MFqBiPsHs8wm8x+32+KatzXpjTguqZe9SiuUhq8IvrDjhc3AeH5fzEhwfQsA8KDbg
			zL4ef8Ce8Wxdf/706Sf+/uJLr//7yxmbLUDhOEV5Jq1LuIGUZ1JtS8i0YBssvA5Zef2EM8
			c5vRznwWFry1E5SMLnjtsyF85fGuvoVCgUZy9fvtwOHxUnX/l3ty0AcZVarZcT7DcUaUkC
			XUuGVvPtg5Gf2CizByfcHsIP79tBmdEPniO88UBx2+kxyOnkS69De7K6+7cWkn957/l70U
			uvZ+K4X2qplJm33jgsDPQuFVrNwtgrNor3UGa3m8B7OB9FCZwX/cjh1od/+XG74tG/P+u0
			WgNxvBhNtKYHbrXbbNbeBLKvX1lxiiM4D+Xz2btumNXS6RJ3+T49W6Ry3u2C2yH4Q/DGKZ
			5wU7jAO2y/frFdcfD5d/qtcRwpsGlgfyKxwo5fVrxq7SqcrhsJvm6lfAL8E09uAT4LaUnA
			2uUdbXfHPbntObdf8OOEk6JyPATjc9qu/EbRee9vbfYAPiG7MrFxrOCzvno5oHjNMXLujL
			Mt8rqNoqCrd3tuMISfNK2l4Laaf7el868BN7/d46Z4nOKhSYV64M2HrHGI6vc/s06RQrA0
			HSvT+7utr/6JvPyqdUMiEY31RZyS1flDN1Z3mKa1BEqnawcjf7A5eMrtprx+3Bma5GL7o6
			Lz0hv2OF4u+3FFoqDPxV9TXFa8Zr0fJFM5+3uPl3AG5l9aniHZR1u7+HN/suE53O/AHX5o
			HxNUrFcuK05dmIEKx+MPJpPJo3S/9aNX/7eVEtTJvEBZf14CvECXtQQaYvMbKYU17vHPgA
			LNqrApE3fPZBXIbGQYVer8kbf8xWLRZ2nY6KLiz3qkN68s1LBkn1LvNXR+FHA7KpkEbNCs
			vAHK5yjnFLDHcufPJZKRRHpgIDGQ0G78dLVICxTl9VSnFcK0R9awdo2f+oPNP8OurA+1d9
			5mj1PChP+i4pCT5+Lo0f1pcG5/XVi9Wn+TXrMq26oaGGj9IhP3SEztC+oLJ0yrT8a0mg9H
			n7bOaGq49Y+Kgw9aKT/vdPtR8hfyXngyfI5p1ayLRveHk61XI4mR5Egy2TrwiAZTn2jMoR
			wRD9xogaaS1l2LjeT62mUce3mmD7e9qfiBP0B5hJwHknLkzB8+kUys3oKdSA8k063/9vtr
			1/582B363VsPvf3HN+89mPxUDD8To6pjWLL28c3bTr8007Bs7yt+YIvjvMDDfMcrDD4+lt
			CsezKR6Bg4eu2djPvhd/787rvvvv/mm//xh/982Wqz/eP58Kohzo1b36uGYUFaO+UaPuwa
			fKI4m9XzVsqNylNUj9mU7zh1KDzQmfxL74PO3C+fGOsMosKDpEJnp+LsK3+12rc1hF39V6
			qCCkquptX8wAfe+FysvKhEJdDcqf1PDpyKJH7wW2fumScebVec/MnfnkqduW/D3V1dx49r
			tXpGf7Xj7CvuYirlq0ojRAIH5GlazRee6Z/h23+AWPkQqw9O7ddeTV0tPH/Ywz/zcRCC+l
			DIHX7wSxhCoGqp3W7vf+udW8+sWTcW/I1VuKk6jRCTr9fa9UyOqmBlf0/xdysqYhEfnlUU
			sHRi+F1PzvQiNKm/Cd5MgKLicb871o0Ui2WKdqs10N8tGJ5o/2i8Wqyg9i42l7nU/DPDjG
			D0reBjVqlM/KFCkRxI6C71+AwfKx79wOztj1NQ7pxAiKN1DSplo1LVEB46czEXs8bdwodn
			P0pVz7R2y9G0mrcJlYZlPXg2RDkInh58WhEZblrT3S2OBT8WfZk4+lwPT3CEaV0+3FSasi
			UtlmN1dev7rR7uT92qasGSZxi/a9xTAStwRPFy3G/2WtZ8rFAkVtKZ7tHIi6Zcf+lDfp8Z
			TVHODw3lG6dvjGnt6Hz0TZub/2gI01ZJ4E4Z0momKluh9f1XbLjDPdjaAVGto/0ezjiY80
			/yLA16maJDDU36MjMYThQUistXivbdVYMly6GeF8yVrdBWeDnuDpnHxs51nonF4h6O8zmm
			PkFRTgjLtCW6JTqk1k2uWIWwWpMw9Gp/yH6karC0mPxynuYX+MpW+PbTsCf0fFx4ODniFy
			wEZ3ZPv+/PcRxnNgsCz6+/dm337nvQkuiurkOPXE0kIzBODT70IFs9WPIb6Wl+wFcBy/bm
			f9i8/OuKzq2J9/gTrZy37F2/24FTEyoNSltLsRZU5uFtz/6fF1+0/6h6piW/dtj8s8ooy/
			r+X+Occ2tHe/YQbIqWUGUb/SrFAzarFbe/3aKvkrR3yG7h6x25ilzH+q6jh8hl3rx3gyl4
			iq94i5pwW1/NLHClarBk2A63VhCxP2+HkZTHahUUpyBGGK7398fjMBgN9fhQI3TnfDOrzF
			ILdeCTEO1d1aIlv5Rn7Ts95bYSeD6A5g0FBMWYJ467adpkEEXR4oJP+O3ubrNJ4JzTiKaL
			qw5nbuIXe5teVxXpdYvNZraaL5Q7psB7/WjOwuDZwhvQrrziiUQCrZFj9Ewq5jINrfL0IM
			OaNEZzWYxG5dAvAfuPtNVhBWntk9/uBrt4Zxmth+KQleVjxeEA5fNcZFHlKnJ1JDGcolMb
			2VSGCoTcEKJkXW5KmIw7JKsS/AH7211VsiskOeaHzbyvfxoXZSboTxT/1wqfmAysNK8IhV
			A3a1k2Gtt24akiRcUapabr6BE4X8lXeXC8n/LGjsAmqNFI/6rwQ3dchrBqfrzCdCwz2c1R
			PGEq/MaGh2IuTMdMwkomCsOrxUaY1nyQO2bMdvMhaE48DX3ZhFkGogH3Ya2mulpsMHOI3K
			HXN0TNxzKBOHRGlI+4pLgSj/vCgoYZUEypwDCJYDDZmtACE01wsDE66RSGhQ0xCZbnE5v7
			fn11WelkWC8le9EX06mz0XFvrBjwmTpftfa7aG0qzHRMw1IksQJ6iKTBOqPFTFE90hJWZu
			ApabSD6neExCrD0siw8kDerWmCQsQ2rlyVSl1SWO1RnTELNBFFhYITDx0D4FrGbKoDDMYk
			FO3boD32CBaD+6KuqarSyNDDk8fLvh8k1nruls+whF5kZrAqMzLGZ9CzgEliSfjb0zacEr
			h12qPVhtUkv7C0htQ0lkmDalPBgiJ4TpOcC1ThYHKEjVq0kSCTTCakl/4z4PaYaQMh6hur
			K6X8YN3RVP4Fk4qxE59KNlUYnsu02hOMmlgDPX96eOo1K0eYojQd1lUZVtNio5ml+iPlsJ
			o6nyREw+BRybUX5myErTcjm0szwalXXjLTeVarBTpllWHdsdhwZoq8s1E5Lb2aNrHA4lqR
			Ts6NqjDQikCOaEHZizDqF/UYpldWV41H5BY7kLeWw8LCdKo9qV6TEhvS7XPSKiHTDJXDOm
			mhwxiGaasNS3axA/nZxjJBWB+g6CBtdF0fFewPN0fLYSmeTq1BIxcbqyvlrXKGpVLBkPwc
			uvsT3se+CtZ+WtmKHoPJRERxMA17hAG0QZtKVV1a12QHa4NqWmq9MgW9d1LXnTn7Fawimw
			kYhQWf/uCMqFETFguhDSoiDIJVVW38TN6wGsEQ9Ej66LjpK2AFVTShA1/cErMGrOK4gDt8
			G6DTH2EwdZVpyRCWulxakIBGYtDpD17frrSDtHqdoRhASWEPGta33hRBqTamrrI2yByWMs
			lE2hmmMMDMHToooHdqqlvdeSI2XYx3mBkMmlZa27D8YTVUSFdgFAltIaj7ZG5WSQbTrutQ
			nEPFBkepDO/nU4BpVyT0DVWW7GGpk8lHYOweHHl0gs4MCxvGMJgTKSL9OB73en4Vx90hnC
			o2MZFgRLPsYdV+tqFSyuDRE7BRtUcmEukZoTyGMeiNzsNxnPK5fxWnzB43bg0DJlJo3FBl
			yc7B15AztPYvikv/pQEMox2R0r/IQAWsNCPVGgo9aMwCFyhKwJ14Uc0wI8EfzrzUgrXYbL
			5Wtd9PTLS/hFR2CGorTGukVJh/tH9yYAe5rR4swaSD35dbKld91c/6/7x7ogEGS9khVmFa
			I6Xfxibmg0vjFYH7WRg4dOystmHJbrZD/ee3ztLKRxCmYFMhgh5bK6KIgRLJQznKHXLjXi
			+Oh6jAGaaApZOfzb7SwvRTudGqvXXlLKmjykQyAUwHk0kpWEiXO/gCqgCyGwWBM/M5v4ei
			3F4+ClphujP7QgvU53JzWrWfr/zeTK1QWwyrhsYzT0QQpgjDTFeY21HYwCq3mHPu/mLsWK
			4Yi9njns2ACaaZ2RdamFZ+LjcnWP/T762YpTp1/lgmbv2kA2bIKEWuGBSLNJh8mWL3eGql
			UnVUqderLxa7w0whycxxoQXpe/+QWzNc+48VdbPVwF4M4PGtEWRTBbQP4pTbCiZBytU9vq
			qxNVJoV0SUKj1gVdvooY52Zq4LLUQr5Ld04K4573F4hRD3eJMMA1segymxktsqtGIMw1rE
			jUwSuf6DP7fQLgvatdwUTiuGq8yqrk5uhgWd1k1z6OakhhZMlhOAaYUZDruFlUwrWTqzIs
			y2ot8KWoO09ZgIMNAoguTVm+e60gKUl9+co9r7bp5DEFaqQWcCGBNRJIHYhOL2wsRxFYAZ
			kUKtwYmtJusAw4p6rGmu6yxE98kPVv3nt8yhg60ihqWf2ohoFUBKZDGFIjF5tkdB8mCXvo
			c2RaSNGoC1MhodOD7XdRYi2YVZNWi/29lqvjfRiDGJsUE1pNXKqF0aZiA4YVklu0Lp0FBK
			NKXY4UQQ1ZTBjjmusyDJkNWcqr8HmhH0V1GXGtLBgMUIM2sYHWCYVoNhU1FEcCIjGkEYZT
			ck+m2p9h6pzSmuEiLbAB14Hk0wkgxLLwImMR10FZKtw2n0DpDlRL1vRbX3oLEtpqNzTVQT
			VkFaoivLIlZs1gKw6Yg+MXmoE8jfJj93/C2J7B2W1nspWge1wIBWM5lco1oWsGGaTkEbS4
			9Egu3t7bBdAr2+Ebp4lpajO/4mVD9bO9KSL08GV4psXmwEmJ6giVRWpH08HYVRKNoQXlqZ
			GXbRtEvNqugf185xmYVosalcR7fN1oaJni+Y3JJlTa4GFjS40BEMhI/y0pZsk1bL6LLGaF
			TaVZg2jJrEOS6yMMnTUmvPrJqps8EkVvJGihFLg9JFpzDWKEi7IAp+JzG5K/XERsIcfDLr
			EguVTH3g2n+uWl2pS8h5d7RCXExacY5oGoVUwlHaWULj7TFzhM/H876cx5PjeY/baV6zus
			pa9Y48LavmrZnfdDKMSkDzGm6/RGhSkhWZ/dJ+pJy5p4fnBK/T6cnlvD1Oj4+oOqvVqxcb
			yvVUe2ZdhbLT5atImkkHT1nUo1KDy03s582ZPSGPT0CbLJuFnLNnzep11dZ5uTr4tf9ct6
			ZcQyv2T+MqDDCRscHUEKLF9TimtlEWPP7tpXWtjs2Vf14VybUV1tTsrfieq4w0bTgxjSs4
			MpDYYhqSTMo9TYvgBGnF0zfCao1sWUHTWl+mPDq7kDZ9Mj3Ftj2ZVg9GTWj7bjcuTO9pzi
			FWW9d/A/qnfGHVrJ1W7c7GiaMEBh8vr7ynbzaYhBzsC0sbIBFoh33Ojfdf3LX2m9BiE/nX
			RPaxyknLsTxdhquj9SaTyytwPB4yS7gEh9sf2LRvidzXN6H6A7owOssKLf81c5a/lc9ZLo
			w0GH05DhmX1Ag9VPyiDNeMfHsi20Rx1FQyrJyXyAnlxgUjrwbDMR9H9OCwQXIOyquX4Tq3
			b0+7Bi1Tp6FwPDqD6INyWtDXqzd15wjC43c68GKD/Paq+BZFtg2WHxxjdvQIsfEZk3GTRz
			d1e+FblP0MK+dNRb9JSV1hFwgTFcfsuEN8j2fmpPjI/k0xTyiwiQV3138ne8LbN0GdYfUN
			bLicFtfD5zyhXyhm4ypmNOzKR77YVH0tNoqvV/PWzZu3rGZBU7TyjFouR/BO669mzYuPhH
			P6hs2dpzZXXVubF5vF1+v2LZub8mITi6HjHwlCRKRMpeDT7I47T86kpXhkPBpRHKw6qy1L
			gFVN7S1aAPLHNulY6fw9QkoGS6VQFLcXX5kJK7hSV1AU/mtLdbX5sPxh1ZPSmWhAlevOsq
			wIwweLGoKi60qNkvOF3H+YSevPscZCcFWVYW2SPytyZ0sjJtHCLmbGNawB4rIoTZBWA2yU
			aCsHXy722gxY9wfwFkW+yrDekjuserIXAN1guHSO6NCvY3WMXgVpNYmI1qjLVAdx+QjPl5
			Xx6cV44B+RT6vLSvbendzZhjYzwkSTEmD6Jj34s/08ll4JQeWhgdFDDbRFB7GZOa/tcrnP
			2hbH7X+5d2tVtdgsvkb15G62KZs6f/7+i2YTOjFamQXX7NvOJddAWtmUiaajGpNFi7pILm
			f70zQstG9U4PBI89rmKmqxaXy1yDtawgZXd38sZ6ajbFiPWmJUu8HuPNUJowc6pTPStEkn
			EoxEi7e9OQXr4O9wHC/qvjvpIfRWWpF3b+8h0KGONJHH6qDjYrP6oYz1ifZnpIl9qGvURi
			2lgEKw/XES1hhaGWb/PSvDbVC+EUFvpRGNF7yxfodHOl2VNucsDSwGUipDj/VFBaJl1I7S
			tJEVTayUNgrWSVqnECzrm8mlch7awrSW7EW9Hwu0yqGL3UW/F1VAhf7ulI4FppTJY3tR8S
			Eyt6Yw7QqzJpENZ1FAb327VJ1/XoL17rlhWW4bXWWRe9umNiWHkUNWiFForNnsD3RHlcBo
			4py2VxRSfogKzZiWSLEgjEbtixKt9vNo4a/1fTEt69NfqqJ6ck/ltuIA1JljlIfgiBAFcQ
			Hoohy2pxEtWmR10K50dB4AIgpfLz5YgJ1hA1rsZH31E5GV7xEd1RF5R9usve4BWCU4KB/H
			OSkq0HN8FS1QobNnCYvJBcNVEdIimtiUug46rgyk1Z54K+52Uj2nusNyPUehSqrvLe24XY
			6KxdTqJoN3uxOdxAr7uSMbTLn4w+0nCYNohD1kNMrqozAia3BBY8schrb1UJw3U7FTVwR0
			Qii5fOOrvTt29Pa1YWXA1FHDkB7LZjkex3lO8ON4IH4/5ww82/4YUWcUMYxNjbLqRu0om0
			W03A+0K67EOYP34pi1OApAS++2hegNWdOqlZY/HuhtwyZ5gaYoLeo0RtrsQIdYoM1e4yGz
			w/pLxeMWDYFsS1QDFciCUik19Osxf//oo2llLB7v1sE/1w4ZTIYblezT55rSMtYdE86rUc
			tqo64UmzVZMp
*/