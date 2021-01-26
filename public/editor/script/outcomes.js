var questmap;

function openMainOutcomeWidget() {
    if ( $( "#MainOutcomeWidget" ).css( "display" ) != "none" ) {
        $( "#MainOutcomeWidget" ).fadeOut();
        return;
    }
    
    let activity = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];

    $( "#main-outcome-score" ).val( activity.answer_outcome[0].score );

    $( "#main-outcome-questlist" ).empty();
    $( "#main-outcome-activitylist" ).empty();

    let questli;
    $.each( CurrentWork.quests, function( q_i, q ) {
        questli = $( "<li class='form-check'/>" );
        questli.append( $( "<input type='radio' class='form-check-input' name='main-questlist'>" ).val( q.quest_id ).attr( "id", q.quest_id ) );
        questli.append( $( "<label class='form-check-label'/>" ).attr( "for", q.quest_id ).text( q.quest_id + " (" + q.quest_title + ")" ) );
        $( "#main-outcome-questlist" ).append( questli );
    });

    /* creazione mappa quest temporanea */
    questmap = new Map();
    $.each( CurrentWork.quests, function( q_i, q ) {
        questmap[q.quest_id] = q_i;
    });

    if ( activity.answer_outcome[0].next_quest_id ) {
        $( "#main-outcome-questlist input[value=" + activity.answer_outcome[0].next_quest_id + "]" ).prop( "checked", true );
    }

    loadActivityList();

    if ( activity.answer_outcome[0].next_activity_id ) {
        $( "#main-outcome-activitylist input[value=" + activity.answer_outcome[0].next_activity_id + "]" ).prop( "checked", true );
    }

    $( "#MainOutcomeWidget" ).fadeIn();
};


function loadActivityList() {
    let alist;
    if ( CurrentNavStatus.Section == "EditActivity" )
        alist = $( "#main-outcome-activitylist" );
    else if ( CurrentNavStatus.Section == "OutcomesSection" )
        alist = $( "#outcome-activitylist" );
    else
        handleError();

    if ( alist.prev().find( "input:checked" ).length < 1 )
        return;
    
    alist.empty();

    let newli;
    $.each( CurrentWork.quests[questmap[alist.prev().find( "input:checked" ).val()]].activities, function( a_i, a) {
        newli = $( "<li class='form-check'/>" );
        newli.append( $( "<input type='radio' class='form-check-input' name='activitylist'>" ).val( a.activity_id ).attr( "id", a.activity_id ) );
        newli.append( $( "<label class='form-check-label'/>" ).attr( "for", a.activity_id ).text( a.activity_id ) );
        alist.append( newli );
    });  
};


function saveMainOutcome() {
    if ( $( "#main-outcome-activitylist input:checked" ).length > 0 ) {
        CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome[0].score = $( "#main-outcome-score" ).val();

        CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome[0].next_quest_id = $( "#main-outcome-questlist input:checked" ).val();

        CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome[0].next_activity_id = $( "#main-outcome-activitylist input:checked" ).val();

        $( "#MainOutcomeWidget" ).fadeOut();
    }
};


function deleteMainOutcome() {
    CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome[0] = {
        condition: null,
        next_quest_id: "",
        next_activity_id: "",
        score: null
    };

    $( "#MainOutcomeWidget" ).fadeOut();
};


function loadOutcomesSection() {
    let activity = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];

    $( "#OutcomesTable tr:not(:first-child)" ).remove();

    /* sistemazione alerts */
    if ( activity.ASK_EVAL ) {
        $( "#OutcomesSection .alertlist" ).append( $( "<div class='alert alert-danger text-justify'/>" ).html( "<i class='fas fa-exclamation'></i><p>Per questa attività è stata impostata la valutazione live.</p>"))
        $( "#OutcomesSection .Save-Cancel .btn-success" ).attr( "disabled", true );

        return;
    }
    else {
        if ( activity.activity_type == "ANSWER" && ( activity.answer_field.type == "" || ( activity.answer_field.type == "checklist" && activity.answer_field.options.length < 2 ))) {
            $( "#OutcomesSection .alertlist" ).append( $( "<div class='alert alert-danger text-justify'/>" ).html( "<i class='fas fa-exclamation'></i><p>Campo risposta incompleto.</p>"))
            $( "#OutcomesSection .Save-Cancel .btn-success" ).attr( "disabled", true );

            return;
        }
        else {
            $( "#OutcomesSection .alertlist" ).empty();
            $( "#OutcomesSection .Save-Cancel .btn-success" ).attr( "disabled", false );
        }
    }

    /* creazione mappa quest temporanea */
    questmap = new Map();
    $.each( CurrentWork.quests, function( q_i, q ) {
        questmap[q.quest_id] = q_i;
    });

    let outcome_entry;
    $.each( activity.answer_outcome, function(i, obj) {
        if ( obj.condition != null ) {
            outcome_entry = $( "<tr/>" );
            outcome_entry.append( $( "<td/>" ).text( obj.condition ) );
            outcome_entry.append( $( "<td/>" ).text( obj.score ) );
            outcome_entry.append( $( "<td/>" ).text( obj.next_quest_id + " (" + ( questmap[obj.next_quest_id].quest_title || "" ) + ")" ) );
            outcome_entry.append( $( "<td/>" ).text( obj.next_activity_id ) );
            outcome_entry.append( $( "<td/>" ).html( $( "<button class='btn btn-sm btn-danger' onclick='$(this).parent().parent().remove();'/>" ).html( "<i class='fas fa-minus'></i>" ) ) );
            $( "#OutcomesTable" ).append( outcome_entry );
        }
    });

    loadOutcomeWidget();
    resetOutcomeWidget();
};


function loadOutcomeWidget() {
    CurrentStage = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];

    /* loading dell'answer field */
    $( "#outcome-answerfield" ).remove();
    
    if ( CurrentStage.answer_field.type == "checklist" ) {
        $( "#AddOutcomeWidget p" ).after( $( "<ul id='outcome-answerfield' class='border border-light rounded p-3'/ul>" ) );
        
        let newli;
        $.each( CurrentStage.answer_field.options, function(index, value) {
            newli = $( "<li class='form-check'></li>" );
            newli.append( $( "<input/>",
                {
                    class: "form-check-input",
                    type: "radio",
                    name: "radio-checklist",
                    id: "opt" + index,
                    value: value
                }));
            newli.append( $( "<label/>",
                {
                    class: "form-check-label",
                    for: "opt" + index,
                    text: value
                }));
            $( "#outcome-answerfield" ).append( newli );
        });
    }
    else {
        $( "#AddOutcomeWidget p" ).after( $( "<input/>", 
        {
            id: "outcome-answerfield",
            class: "m-3",
            type: CurrentStage.answer_field.type
        }));
    }
    
    /* loading delle liste di quest e attività */
    let questli;
    $( "#outcome-questlist" ).empty();
    $.each( CurrentWork.quests, function( q_i, q ) {
        questli = $( "<li class='form-check'/>" );
        questli.append( $( "<input type='radio' class='form-check-input' name='questlist'>" ).val( q.quest_id ).attr( "id", q.quest_id ) );
        questli.append( $( "<label class='form-check-label'/>" ).attr( "for", q.quest_id ).text( q.quest_id + " (" + q.quest_title + ")" ) );
        $( "#outcome-questlist" ).append( questli );
    });
    
        
    $( "#outcome-activitylist" ).empty();
};


function addOutcome() {
    /* ricava i dati dal widget */
    let response;

    if ( $( "#outcome-answerfield" ).prop( "tagName" ) == "UL" ) {
        if ( $( "#outcome-answerfield input:checked" ).length > 0 )
            response = $( "#outcome-answerfield input:checked" ).val().trim().replace(/(<([^>]+)>)/gi, "");
        else
            return;
    }
    else if ( $( "#outcome-answerfield" ).prop( "tagName" ) == "INPUT" ) {
        response = $( "#outcome-answerfield" ).val().trim().replace(/(<([^>]+)>)/gi, "");

        if ( response == null )
            return;
    }
    else {
        handleError();
        return;
    }

    if ( response === "" )
        return;

    let nextquest, nextactivity;
    if ( $( "#outcome-questlist input:checked" ).length > 0 )
        nextquest = $( "#outcome-questlist input:checked" ).val();
    else
        return;

    if ( $( "#outcome-activitylist input:checked" ).length > 0 )
        nextactivity = $( "#outcome-activitylist input:checked" ).val();
    else
        return;

    /* aggiunge dati alla tabella */
    newentry = $( "<tr/>" );
    newentry.append( $( "<td/>" ).text( response.toLowerCase() ) );
    newentry.append( $( "<td/>" ).text( $( "#outcome-score" ).val() ) );
    newentry.append( $( "<td/>" ).text( nextquest ) );
    newentry.append( $( "<td/>" ).text( nextactivity ) );
    newentry.append( $( "<td/>" ).html( $( "<button class='btn btn-sm btn-danger' onclick='$(this).parent().parent().remove();'/>" ).html( "<i class='fas fa-minus'></i>" ) ) );
    $( "#OutcomesTable" ).append( newentry );

    resetOutcomeWidget();
};


function resetOutcomeWidget() {
    if ( $( "#outcome-answerfield" ).prop( "tagName" ) == "UL" )
        $( "#outcome-answerfield input" ).prop( "checked", false );
    else if ( $( "#outcome-answerfield" ).prop( "tagName" ) == "INPUT" )
        $( "#outcome-answerfield" ).val( null );
    else {
        handleError();
        return;
    }

    $( "#outcome-score" ).val( null );
    $( "#outcome-questlist input" ).prop( "checked", false );
    $( "#outcome-activitylist" ).empty();
};


function saveOutcomesSection() {
    let activity = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];

    activity.answer_outcome = [activity.answer_outcome[0]];

    $.each( $( "#OutcomesTable tr:not(:first-child)" ), function( i, row ) {
        activity.answer_outcome.push({
            condition: $(row).children().eq(0).text(),
            next_quest_id: $(row).children().eq(2).text().substring(0,4),
            next_activity_id: $(row).children().eq(3).text(),
            score: $(row).children().eq(1).text()
        })
    })

    /* meglio fare una pulizia */

    console.log( activity.answer_outcome); // debugging
    back();
};