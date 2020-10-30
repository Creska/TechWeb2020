var EditStory_graphics =`
<h1 class="cover-heading SectionTitle">TITOLO</h1>
<p class="lead SectionHeader">
  Cambia il nome della storia e gestisci la lista delle quest.
</p>

<div class="input-group mb-3 mt-5 font-weight-bold">
  <div class="input-group-prepend">
    <span class="input-group-text bg-light">Titolo:</span>
  </div>
  <input type="text" id="StoryTitleInput" class="form-control" placeholder="NuovaStoria" onclick="change_savetitle_button('unsaved');">
  <div class="input-group-append">
     <button class="btn btn-success" id="SaveStoryTitle" type="button" onclick="save_title('story')">Salvato!</button>
  </div>
</div>
<div class="col-xs-12 alert alert-info text-justify" role="alert">
  <i class="fas fa-info"></i>
  <p>Di default cliccare su una quest ti permette di impostarne i parametri, tuttavia vi sono le modalità swap e cancel, rispettivamente per scambiare di posizione le quest ed  eliminarle.
  Per uscire da una mode basta cliccare nuovamente il relativo pulsante o selezionare un'altra mode. Infine onde prevenire spiacevoli incidenti, dovrai cliccare su una quest due volte per eliminarla.</p>
</div>

<div id="s_buttons_div" class=" p-3">
  <button class="btn btn-lg btn-secondary mb-3 rounded SwapBtn" onclick="swap_mode()" data-toggle="tooltip" data-placement="left" title="Swap mode">
    <i class="fas fa-people-carry"></i>
  </button>
  <button id="s_new_button" class="btn btn-lg btn-secondary mb-3 mr-2 ml-2 rounded" onclick='$("#NewQuestWidget").removeClass("invisible");' data-toggle="tooltip" data-placement="top" title="Crea una nuova quest" ><i class="fas fa-plus"></i> </button>
  <button class="btn btn-lg btn-secondary mb-3 rounded CancelBtn" onclick="cancel_mode()" data-toggle="tooltip" data-placement="right" title="Cancel mode">
    <i class="fas fa-trash"></i>
  </button>
</div>

<div id="NewQuestWidget" class="input-group input-group-sm mb-3 font-weight-bold invisible">
  <div class="input-group-prepend">
    <span class="input-group-text bg-light">Titolo:</span>
  </div>
  <input type="text" class="form-control col-sm-5 " placeholder="Titolo della quest">
    <div class="input-group-append">
      <button class="btn btn-sm btn-primary" type="button" onclick='create_stuff("quest");create_card( $("#NewQuestWidget input").val() );$("#NewQuestWidget").addClass("invisible");'>Aggiungi</button>
      <button class="btn btn-sm btn-danger" type="button" onclick="$('#NewQuestWidget input').val('');$('#NewQuestWidget').addClass('invisible');">Annulla</button>
    </div>
</div>

<div class="CardGrid" id="QuestsGrid" >
</div>
`;

    var EditQuest_graphics = `
    <h1 class="cover-heading SectionTitle">TITOLO</h1>
    <p class="lead SectionHeader">
      Cambia il nome della quest e gestisci la lista delle attività.
    </p>

    <div class="input-group mb-3 mt-5 font-weight-bold">
      <div class="input-group-prepend">
        <span class="input-group-text bg-light">Titolo:</span>
      </div>
      <input type="text" id="QuestTitleInput" class="form-control" placeholder="NuovaQuest" onclick="change_savetitle_button('unsaved');">
      <div class="input-group-append">
         <button class="btn btn-primary" id="SaveQuestTitle" type="button" onclick="save_title('quest')">Salva</button>
      </div>
    </div>

    <div id="q_buttons_div" class="p-3">
      <button class="btn btn-lg btn-secondary mb-3 rounded SwapBtn" onclick="swap_mode()" data-toggle="tooltip" data-placement="left" title="Swap mode">
        <i class="fas fa-people-carry"></i>
      </button>
      <button id="q_new_button" class="btn btn-lg btn-secondary mb-3 mr-2 ml-2 rounded" onclick='create_stuff("activity");create_card("");' data-toggle="tooltip" data-placement="top" title="Crea una nuova attività">
        <i class="fas fa-plus"></i>
      </button>
      <button class="btn btn-lg btn-secondary mb-3 rounded CancelBtn" onclick="cancel_mode()" data-toggle="tooltip" data-placement="right" title="Cancel mode">
        <i class="fas fa-trash"></i>
      </button>
    </div>

    <div class="CardGrid" id="ActivitiesGrid">
    </div>

    <button type="button" class="btn bg-secondary rounded BackBtn" onclick="back()">
      <i class="fas fa-long-arrow-alt-left fa-2x"></i>
    </button>
    `;
    var EditActivity_graphics = `
    <h1 class="cover-heading SectionTitle">TITOLO</h1>
    <p class="lead SectionHeader">
      In questa sezione potrai creare e modificare il testo e la programmazione dell'attività.
    </p>

    <div class="p-3">
      <button id="FinalStageBtn" class="btn btn-lg btn-secondary mb-3 rounded" onclick="setFinalActivity();" data-toggle="tooltip" data-placement="left" title="Marca attività come finale">
        <i class="fas fa-flag-checkered"></i>
      </button>
      <button class="btn btn-lg btn-secondary mb-3 mr-2 ml-2 rounded" onclick="goToSection('EditAnswerField')" data-toggle="tooltip" data-placement="bottom" title="Modifica il campo di risposta">
        <i class="fas fa-tasks"></i>
      </button>
      <button class="btn btn-lg btn-secondary mb-3 rounded" onclick="goToSection('SetAnswerOutcome')" data-toggle="tooltip" data-placement="right" title="Modifica la progressione dell'attività">
        <i class="fas fa-route"></i>      
      </button>
    </div>
    <div class="col-xs-12 alert alert-info text-justify" role="alert">
      <i class="fas fa-info"></i>
      <p>Se marchi questa attività come finale, segnalerai che essa verrà setttata il punto d'arrivo del gioco. Di conseguenza non vi sarà alcuna tappa successiva.Attenzione però! Spetta all'autore fare in modo che tutti i possibili percorsi di gioco convergano ad essa.<br>
      Cliccando sulla seconda icona potrai modificare il campo risposta, mentre sulla terza andrai a gestire il sistema che attribuirà, ad ogni possibile risposta, la tappa a cui il giocatore verrà condotto.</p>
    </div>

    <div id="q_buttons_div" class="p-3">
      <button class="btn btn-lg btn-secondary mb-3 rounded SwapBtn" onclick="swap_mode()" data-toggle="tooltip" data-placement="left" title="Swap mode">
        <i class="fas fa-people-carry"></i>
      </button>
      <button class="btn btn-lg btn-secondary mb-3 mr-2 ml-2 rounded" onclick='create_stuff("TextParagraph");create_card("[vuoto]");' data-toggle="tooltip" data-placement="top" title="Aggiungi paragrafo di testo">
        <i class="fas fa-paragraph"></i>
      </button>
      <button class="btn btn-lg btn-secondary mb-3 mr-2 ml-2 rounded" onclick='create_stuff("Gallery");create_card("GALLERY");' data-toggle="tooltip" data-placement="top" title="Aggiungi galleria di immagini">
        <i class="far fa-images"></i>
      </button>
      <button class="btn btn-lg btn-secondary mb-3 rounded CancelBtn" onclick="cancel_mode()" data-toggle="tooltip" data-placement="right" title="Cancel mode">
        <i class="fas fa-trash"></i>
      </button>
    </div>

    <div class="CardGrid" id="ParagraphsGrid">
    </div>

    <button type="button" class="btn bg-secondary rounded BackBtn" onclick="back()">
      <i class="fas fa-long-arrow-alt-left fa-2x"></i>
    </button>
    `;

    var EditAnswerField_graphics = `
    <h1>TITOLO SEZIONE</h1>

    <div>
      <h3>Tipologia di input:</h3>
      <div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="QuestionType" id="QuestionType_Checklist">
          <label class="form-check-label" for="QuestionType_Checklist">Checklist</label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="QuestionType" id="QuestionType_Text">
          <label class="form-check-label" for="QuestionType_Text">Testo</label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="QuestionType" id="QuestionType_Number">
          <label class="form-check-label" for="QuestionType_Number">Numero</label>
        </div>

        <script>
          $("#EditAnswerField input[name='QuestionType']").on("change", function () {
            loadEditAnswerFieldSection('CHG_TYPE');
          });
        </script>
      </div>
    </div>

    <div id="AFui">
      <!-- Input della stringa di testo che poi diventerà la "AnswerFieldDescription" -->
      <div class="form-group">
        <label for="InsertAnswerFieldDescription">Indicazione per il giocatore:</label>
        <input type=text id="InsertAnswerFieldDescription">
      </div>
      <!-- Container dell'anteprima dell'Answer Field -->
      <div class="form-group" id="AnswerFieldPreview"></div>
    </div>
    
    <!-- Sezione per il settaggio dell'AnswerField - non è soggetto a reload in caso il creator cambi opzione di input -->
    <div class="input-group" id="AnswerFieldSettings">
      <label for="AnswerScore">Punteggio per il corretto completamento dell'obiettivo</label>
      <input type="number" id="AnswerScore" min="0">
      <input type="checkbox" id="NeedEvaluation">
      <label for="NeedEvaluation">Richiesta valutazione</label>
      <input type="checkbox" id="InsertTimer">
      <label for="InsertTimer">Aggiungi il timer per la domanda</label>
      <label for="AnswerTimer">Limite di tempo (minuti) per il completamento dell'obiettivo</label>
      <input type="number" id="AnswerTimer" placeholder="1" min="1">

      <script>
        $( "#InsertTimer" ).click( function() {
          if ( this.checked )
            $( "#AnswerTimer" ).attr( "disabled", false );
          else
            $( "#AnswerTimer" ).attr( "disabled", true );
        });
      </script>
    </div>

    <button onclick="if($('#AnswerFieldPreview').is(':empty')) back(); else saveAnswerFieldSettings();">Salva</button>
    <button class="" onclick="back();">Annulla</button>
    `;
    var SetAnswerOutcome_graphics = `
    <script>
    $(document).on( "change", "#OutcomeSwitch", function() {
      if ( $(this).prop( "checked" ) )
        loadEditOutcomeSection( "ANSWER" );
      else
      loadEditOutcomeSection( "ONLYREADING" );
    });

    // attiva/disattiva i number input in base alla spunta sulla checkbox di passaggio alla quest successiva
    $(document).on( "click", "#OutcomesTable input[type='checkbox']", function() {
      if ( $(this).prop("checked") )
        $($(this).parent().next().children().first()).attr("disabled", true);
      else
        $($(this).parent().next().children().first()).attr("disabled", false);
    });
  </script>
  
  <h1>TITOLO SEZIONE</h1>

  <div class="custom-control custom-switch">
    <input type="checkbox" class="custom-control-input" id="OutcomeSwitch">
    <label class="custom-control-label" for="OutcomeSwitch">Programma in base al campo di risposta</label>
  </div>

  <div id="AnswerFieldRecap"></div>

  <h3>Programmazione attività</h3>

  <table id="OutcomesTable">
  </table>
    
  <div id="AddOutcomeWidget" class="input-group input-group-sm mb-3 font-weight-bold">
    <div class="input-group-prepend">
      <span class="input-group-text bg-light">Aggiungi conseguenza a risposta specifica:</span>
    </div>
    <input type="text" class="form-control col-sm-5" placeholder="Risposta">
    <div class="input-group-append">
      <button class="btn btn-sm btn-primary" type="button" onclick="if ($('#AddOutcomeWidget input').val().trim() != '') addOutcome($('#AddOutcomeWidget input').val().trim(), ''); $('#AddOutcomeWidget input').val('')">Aggiungi</button>
      <button class="btn btn-sm btn-danger" type="button" onclick="$('#AddOutcomeWidget input').val('');">Annulla</button>
    </div>
  </div>

  <button class="SaveBtn" onclick="saveOutcomes();">Salva</button>
  <button class="" onclick="back();">Annulla</button>
    `;

var EditText_graphics = `
<h1 class="cover-heading SectionTitle">TITOLO</h1>
<p class="lead SectionHeader">
  Aggiungi un nuovo paragrafo al testo dell'attività.
</p>

<textarea id="TextParInput" rows="15" cols="50" placeholder="Inserisci un testo..."></textarea>

<div class="p-3 Save-Cancel">
  <button class="btn btn-success mb-3 mr-2 ml-2 rounded" onclick="saveTextParagraph();">Salva</button>
  <button class="btn btn-secondary mb-3 mr-2 ml-2 rounded" onclick="back();">Annulla</button>
</div>
`;

var EditGallery_graphics = `
<h1 class="cover-heading SectionTitle">TITOLO</h1>
<p class="lead SectionHeader">
  Aggiungi una sezione contenente una o più immagini.<br>
  Nel caso sia stata scelta l'opzione di accessibilità, è obbligatorio inserire una descrizione per ogni immagine. Anche in caso contrario, tuttavia, inserire una didascalia è <em>caldamente consigliato</em>.
</p>

<div class="col-xs-12 alert alert-warning text-justify" role="alert">
  <i class="fas fa-exclamation-triangle"></i>
  <p>Formati accettati: JPG, PNG.<br>Files di tipo differente non saranno caricati.</p>
</div>

<div class="container" id="GalleryPreview"></div>

<div class="p-3 Save-Cancel">
  <button class="btn btn-secondary mb-3 mr-2 ml-2 rounded" onclick="$('#UploadImg').trigger('click');" data-toggle="tooltip" data-placement="left" title="Aggiungi immagini">
    <i class="fas fa-plus"></i>
  </button>
  <input type="file" id="UploadImg" style="display:none;" multiple>
  <button class="btn btn-success mb-3 mr-2 ml-2 rounded" onclick="saveImageGallery();">Salva</button>
  <button class="btn btn-secondary mb-3 mr-2 ml-2 rounded" onclick="back();">Annulla</button>
</div>

<script>
  const fileSelector = document.getElementById("UploadImg");
  fileSelector.addEventListener("change", function(event) {
    for ( pic of event.target.files ) {
      switch ( getFileExtension(pic.name) ) {
        case "jpg":
        case "JPG":
        case "jpeg":
        case "JPEG":
        case "png":
        case "PNG":
          if (pic) addImage(pic, true);
      }
    }
  });
</script>
`;

function set_EditStory(){
    $("#EditStory").html(EditStory_graphics);
    $("#EditQuest").html(EditQuest_graphics);
    $("#EditActivity").html(EditActivity_graphics);
    $("#EditAnswerField").html(EditAnswerField_graphics);
    $("#SetAnswerOutcome").html(SetAnswerOutcome_graphics);
    $("#EditText").html(EditText_graphics);
    $("#EditGallery").html(EditGallery_graphics);
}
//swag


var EditStory_graphics = `
<h1 class="cover-heading SectionTitle">TITOLO</h1>
<p class="lead SectionHeader">
  Cambia il nome della storia e gestisci la lista delle quest.
</p>

<div class="input-group mb-3 mt-5 font-weight-bold">
  <div class="input-group-prepend">
    <span class="input-group-text bg-light">Titolo:</span>
  </div>
  <input type="text" id="StoryTitleInput" class="form-control" placeholder="NuovaStoria" onclick="change_savetitle_button('unsaved');">
  <div class="input-group-append">
     <button class="btn btn-success" id="SaveStoryTitle" type="button" onclick="save_title('story')">Salvato!</button>
  </div>
</div>
<div class="col-xs-12 alert alert-info text-justify" role="alert">
  <i class="fas fa-info"></i>
  <p>Di default cliccare su una quest ti permette di impostarne i parametri, tuttavia vi sono le modalità swap e cancel, rispettivamente per scambiare di posizione le quest ed  eliminarle.
  Per uscire da una mode basta cliccare nuovamente il relativo pulsante o selezionare un'altra mode. Infine onde prevenire spiacevoli incidenti, dovrai cliccare su una quest due volte per eliminarla.</p>
</div>

<div id="s_buttons_div" class=" p-3">
  <button class="btn btn-lg btn-secondary mb-3 rounded SwapBtn" onclick="swap_mode()" data-toggle="tooltip" data-placement="left" title="Swap mode">
    <i class="fas fa-people-carry"></i>
  </button>
  <button id="s_new_button" class="btn btn-lg btn-secondary mb-3 mr-2 ml-2 rounded" onclick='$("#NewQuestWidget").removeClass("invisible");' data-toggle="tooltip" data-placement="top" title="Crea una nuova quest" ><i class="fas fa-plus"></i> </button>
  <button class="btn btn-lg btn-secondary mb-3 rounded CancelBtn" onclick="cancel_mode()" data-toggle="tooltip" data-placement="right" title="Cancel mode">
    <i class="fas fa-trash"></i>
  </button>
</div>

<div id="NewQuestWidget" class="input-group input-group-sm mb-3 font-weight-bold invisible">
  <div class="input-group-prepend">
    <span class="input-group-text bg-light">Titolo:</span>
  </div>
  <input type="text" class="form-control col-sm-5 " placeholder="Titolo della quest">
    <div class="input-group-append">
      <button class="btn btn-sm btn-primary" type="button" onclick='create_stuff("quest");create_card( $("#NewQuestWidget input").val() );$("#NewQuestWidget").addClass("invisible");'>Aggiungi</button>
      <button class="btn btn-sm btn-danger" type="button" onclick="$('#NewQuestWidget input').val('');$('#NewQuestWidget').addClass('invisible');">Annulla</button>
    </div>
</div>

<div class="CardGrid" id="QuestsGrid" >
</div>
`;

    var EditQuest_graphics = `
    <h1 class="cover-heading SectionTitle">TITOLO</h1>
    <p class="lead SectionHeader">
      Cambia il nome della quest e gestisci la lista delle attività.
    </p>

    <div class="input-group mb-3 mt-5 font-weight-bold">
      <div class="input-group-prepend">
        <span class="input-group-text bg-light">Titolo:</span>
      </div>
      <input type="text" id="QuestTitleInput" class="form-control" placeholder="NuovaQuest" onclick="change_savetitle_button('unsaved');">
      <div class="input-group-append">
         <button class="btn btn-primary" id="SaveQuestTitle" type="button" onclick="save_title('quest')">Salva</button>
      </div>
    </div>

    <div id="q_buttons_div" class="p-3">
      <button class="btn btn-lg btn-secondary mb-3 rounded SwapBtn" onclick="swap_mode()" data-toggle="tooltip" data-placement="left" title="Swap mode">
        <i class="fas fa-people-carry"></i>
      </button>
      <button id="q_new_button" class="btn btn-lg btn-secondary mb-3 mr-2 ml-2 rounded" onclick='create_stuff("activity");create_card("");' data-toggle="tooltip" data-placement="top" title="Crea una nuova attività">
        <i class="fas fa-plus"></i>
      </button>
      <button class="btn btn-lg btn-secondary mb-3 rounded CancelBtn" onclick="cancel_mode()" data-toggle="tooltip" data-placement="right" title="Cancel mode">
        <i class="fas fa-trash"></i>
      </button>
    </div>

    <div class="CardGrid" id="ActivitiesGrid">
    </div>

    <button type="button" class="btn bg-secondary rounded BackBtn" onclick="back()">
      <i class="fas fa-long-arrow-alt-left fa-2x"></i>
    </button>
    `;
    var EditActivity_graphics = `
    <h1 class="cover-heading SectionTitle">TITOLO</h1>
    <p class="lead SectionHeader">
      In questa sezione potrai creare e modificare il testo e la programmazione dell'attività.
    </p>

    <div class="p-3">
      <button id="FinalStageBtn" class="btn btn-lg btn-secondary mb-3 rounded" onclick="setFinalActivity();" data-toggle="tooltip" data-placement="left" title="Marca attività come finale">
        <i class="fas fa-flag-checkered"></i>
      </button>
      <button class="btn btn-lg btn-secondary mb-3 mr-2 ml-2 rounded" onclick="goToSection('EditAnswerField')" data-toggle="tooltip" data-placement="bottom" title="Modifica il campo di risposta">
        <i class="fas fa-tasks"></i>
      </button>
      <button class="btn btn-lg btn-secondary mb-3 rounded" onclick="goToSection('SetAnswerOutcome')" data-toggle="tooltip" data-placement="right" title="Modifica la progressione dell'attività">
        <i class="fas fa-route"></i>      
      </button>
    </div>
    <div class="col-xs-12 alert alert-info text-justify" role="alert">
      <i class="fas fa-info"></i>
      <p>Se marchi questa attività come finale, segnalerai che essa verrà setttata il punto d'arrivo del gioco. Di conseguenza non vi sarà alcuna tappa successiva.Attenzione però! Spetta all'autore fare in modo che tutti i possibili percorsi di gioco convergano ad essa.<br>
      Cliccando sulla seconda icona potrai modificare il campo risposta, mentre sulla terza andrai a gestire il sistema che attribuirà, ad ogni possibile risposta, la tappa a cui il giocatore verrà condotto.</p>
    </div>

    <div id="q_buttons_div" class="p-3">
      <button class="btn btn-lg btn-secondary mb-3 rounded SwapBtn" onclick="swap_mode()" data-toggle="tooltip" data-placement="left" title="Swap mode">
        <i class="fas fa-people-carry"></i>
      </button>
      <button class="btn btn-lg btn-secondary mb-3 mr-2 ml-2 rounded" onclick='create_stuff("TextParagraph");create_card("[vuoto]");' data-toggle="tooltip" data-placement="top" title="Aggiungi paragrafo di testo">
        <i class="fas fa-paragraph"></i>
      </button>
      <button class="btn btn-lg btn-secondary mb-3 mr-2 ml-2 rounded" onclick='create_stuff("Gallery");create_card("GALLERY");' data-toggle="tooltip" data-placement="top" title="Aggiungi galleria di immagini">
        <i class="far fa-images"></i>
      </button>
      <button class="btn btn-lg btn-secondary mb-3 rounded CancelBtn" onclick="cancel_mode()" data-toggle="tooltip" data-placement="right" title="Cancel mode">
        <i class="fas fa-trash"></i>
      </button>
    </div>

    <div class="CardGrid" id="ParagraphsGrid">
    </div>

    <button type="button" class="btn bg-secondary rounded BackBtn" onclick="back()">
      <i class="fas fa-long-arrow-alt-left fa-2x"></i>
    </button>
    `;

    var EditAnswerField_graphics = `
    <h1>TITOLO SEZIONE</h1>

    <div>
      <h3>Tipologia di input:</h3>
      <div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="QuestionType" id="QuestionType_Checklist">
          <label class="form-check-label" for="QuestionType_Checklist">Checklist</label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="QuestionType" id="QuestionType_Text">
          <label class="form-check-label" for="QuestionType_Text">Testo</label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="QuestionType" id="QuestionType_Number">
          <label class="form-check-label" for="QuestionType_Number">Numero</label>
        </div>

        <script>
          $("#EditAnswerField input[name='QuestionType']").on("change", function () {
            loadEditAnswerFieldSection('CHG_TYPE');
          });
        </script>
      </div>
    </div>

    <div id="AFui">
      <!-- Input della stringa di testo che poi diventerà la "AnswerFieldDescription" -->
      <div class="form-group">
        <label for="InsertAnswerFieldDescription">Indicazione per il giocatore:</label>
        <input type=text id="InsertAnswerFieldDescription">
      </div>
      <!-- Container dell'anteprima dell'Answer Field -->
      <div class="form-group" id="AnswerFieldPreview"></div>
    </div>
    
    <!-- Sezione per il settaggio dell'AnswerField - non è soggetto a reload in caso il creator cambi opzione di input -->
    <div class="input-group" id="AnswerFieldSettings">
      <label for="AnswerScore">Punteggio per il corretto completamento dell'obiettivo</label>
      <input type="number" id="AnswerScore" min="0">
      <input type="checkbox" id="NeedEvaluation">
      <label for="NeedEvaluation">Richiesta valutazione</label>
      <input type="checkbox" id="InsertTimer">
      <label for="InsertTimer">Aggiungi il timer per la domanda</label>
      <label for="AnswerTimer">Limite di tempo (minuti) per il completamento dell'obiettivo</label>
      <input type="number" id="AnswerTimer" placeholder="1" min="1">

      <script>
        $( "#InsertTimer" ).click( function() {
          if ( this.checked )
            $( "#AnswerTimer" ).attr( "disabled", false );
          else
            $( "#AnswerTimer" ).attr( "disabled", true );
        });
      </script>
    </div>

    <button onclick="if($('#AnswerFieldPreview').is(':empty')) back(); else saveAnswerFieldSettings();">Salva</button>
    <button class="" onclick="back();">Annulla</button>
    `;
    var SetAnswerOutcome_graphics = `
    <script>
    $(document).on( "change", "#OutcomeSwitch", function() {
      if ( $(this).prop( "checked" ) )
        loadEditOutcomeSection( "ANSWER" );
      else
      loadEditOutcomeSection( "ONLYREADING" );
    });

    // attiva/disattiva i number input in base alla spunta sulla checkbox di passaggio alla quest successiva
    $(document).on( "click", "#OutcomesTable input[type='checkbox']", function() {
      if ( $(this).prop("checked") )
        $($(this).parent().next().children().first()).attr("disabled", true);
      else
        $($(this).parent().next().children().first()).attr("disabled", false);
    });
  </script>
  
  <h1>TITOLO SEZIONE</h1>

  <div class="custom-control custom-switch">
    <input type="checkbox" class="custom-control-input" id="OutcomeSwitch">
    <label class="custom-control-label" for="OutcomeSwitch">Programma in base al campo di risposta</label>
  </div>

  <div id="AnswerFieldRecap"></div>

  <h3>Programmazione attività</h3>

  <table id="OutcomesTable">
  </table>
    
  <div id="AddOutcomeWidget" class="input-group input-group-sm mb-3 font-weight-bold">
    <div class="input-group-prepend">
      <span class="input-group-text bg-light">Aggiungi conseguenza a risposta specifica:</span>
    </div>
    <input type="text" class="form-control col-sm-5" placeholder="Risposta">
    <div class="input-group-append">
      <button class="btn btn-sm btn-primary" type="button" onclick="if ($('#AddOutcomeWidget input').val().trim() != '') addOutcome($('#AddOutcomeWidget input').val().trim(), ''); $('#AddOutcomeWidget input').val('')">Aggiungi</button>
      <button class="btn btn-sm btn-danger" type="button" onclick="$('#AddOutcomeWidget input').val('');">Annulla</button>
    </div>
  </div>

  <button class="SaveBtn" onclick="saveOutcomes();">Salva</button>
  <button class="" onclick="back();">Annulla</button>
    `;

var EditText_graphics = `
<h1 class="cover-heading SectionTitle">TITOLO</h1>
<p class="lead SectionHeader">
  Aggiungi un nuovo paragrafo al testo dell'attività.
</p>

<textarea id="TextParInput" rows="15" cols="50" placeholder="Inserisci un testo..."></textarea>

<div class="p-3 Save-Cancel">
  <button class="btn btn-success mb-3 mr-2 ml-2 rounded" onclick="saveTextParagraph();">Salva</button>
  <button class="btn btn-secondary mb-3 mr-2 ml-2 rounded" onclick="back();">Annulla</button>
</div>
`;

var EditGallery_graphics = `
<h1 class="cover-heading SectionTitle">TITOLO</h1>
<p class="lead SectionHeader">
  Aggiungi una sezione contenente una o più immagini.<br>
  Nel caso sia stata scelta l'opzione di accessibilità, è obbligatorio inserire una descrizione per ogni immagine. Anche in caso contrario, tuttavia, inserire una didascalia è <em>caldamente consigliato</em>.
</p>

<div class="col-xs-12 alert alert-warning text-justify" role="alert">
  <i class="fas fa-exclamation-triangle"></i>
  <p>Formati accettati: JPG, PNG.<br>Files di tipo differente non saranno caricati.</p>
</div>

<div class="container" id="GalleryPreview"></div>

<div class="p-3 Save-Cancel">
  <button class="btn btn-secondary mb-3 mr-2 ml-2 rounded" onclick="$('#UploadImg').trigger('click');" data-toggle="tooltip" data-placement="left" title="Aggiungi immagini">
    <i class="fas fa-plus"></i>
  </button>
  <input type="file" id="UploadImg" style="display:none;" multiple>
  <button class="btn btn-success mb-3 mr-2 ml-2 rounded" onclick="saveImageGallery();">Salva</button>
  <button class="btn btn-secondary mb-3 mr-2 ml-2 rounded" onclick="back();">Annulla</button>
</div>

<script>
  const fileSelector = document.getElementById("UploadImg");
  fileSelector.addEventListener("change", function(event) {
    for ( pic of event.target.files ) {
      switch ( getFileExtension(pic.name) ) {
        case "jpg":
        case "JPG":
        case "jpeg":
        case "JPEG":
        case "png":
        case "PNG":
          if (pic) addImage(pic, true);
      }
    }
  });
</script>
`;

function set_EditStory(){
    $("#EditStory").html(EditStory_graphics);
    $("#EditQuest").html(EditQuest_graphics);
    $("#EditActivity").html(EditActivity_graphics);
    $("#EditAnswerField").html(EditAnswerField_graphics);
    $("#SetAnswerOutcome").html(SetAnswerOutcome_graphics);
    $("#EditText").html(EditText_graphics);
    $("#EditGallery").html(EditGallery_graphics);
}