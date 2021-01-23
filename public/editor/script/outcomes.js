var questmap;

function openMainOutcomeWidget() {
    let activity = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];

    $( "#main-outcome-score" ).val( activity.answer_outcome[0].score );

    $( "#main-outcome-questlist" ).empty();
    $( "#main-outcome-activitylist" ).empty();

    let questli;
    $.each( CurrentWork.quests, function( q_i, q ) {
        questli = $( "<li/>" );
        questli.append( $( "<input type='radio' name='main-questlist'>" ).val( q.quest_id ).attr( "id", q.quest_id ) );
        questli.append( $( "<label/>" ).attr( "for", q.quest_id ).text( q.quest_id + " (" + q.quest_title + ")" ) );
        $( "#main-outcome-questlist" ).append( questli );
    });

    /* creazione mappa quest temporanea */
    questmap = new Map();
    $.each( CurrentWork.quests, function( q_i, q ) {
        questmap[q.quest_id] = q_i;
    });

    if ( activity.answer_outcome[0].next_activity_id ) {
        $( "#main-outcome-questlist input[value=" + activity.answer_outcome[0].next_activity_id.substring(0,4) + "]" ).prop( "checked", true );
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
        newli = $( "<li/>" );
        newli.append( $( "<input type='radio' name='activitylist'>" ).val( a.activity_id ).attr( "id", a.activity_id ) );
        newli.append( $( "<label/>" ).attr( "for", a.activity_id ).text( a.activity_id ) );
        alist.append( newli );
    });  
};


function saveMainOutcome() {
    if ( $( "#main-outcome-activitylist input:checked" ).length > 0 ) {
        CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome[0].next_activity_id = $( "#main-outcome-activitylist input:checked" ).val();

        $( "#MainOutcomeWidget" ).fadeOut();
    }
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
    $.each( activity.activity_outcome, function(i, obj) {
        if ( i > 0 ) {
            outcome_entry = $( "<tr/>" );
            outcome_entry.append( $( "<td/>" ).text( obj.condition ) );
            outcome_entry.append( $( "<td/>" ).text( obj.score ) );
            outcome_entry.append( $( "<td/>" ).text( obj.next_activity_id.substring(0,4) + " (" + questmap[obj.next_activity_id.substring(0,4)].quest_title + ")" ) );
            outcome_entry.append( $( "<td/>" ).text( obj.next_activity_id ) );
            outcome_entry.append( $( "<td/>" ).html( $( "<button class='btn btn-sm btn-danger' onclick='$(this).parent().parent().remove();'/>" ).html( "<i class='fas fa-minus'></i>" ) ) );
            $( "#OutcomesTable" ).append( outcome_entry );
        }
    });

    loadOutcomeWidget();
};


function loadOutcomeWidget() {
    /* costruisce campo risposta */

    /* costruisce lista quest */

    /* costruisce lista attività */
};


function addOutcome( obj ) {
    /* ricava risposta */

    /* aggiunge dati alla tabella */

    /* resetta widget */
};


function saveOutcomesSection() {
    /* toglie tutti gli elementi dall'array di outcome - a parte il primo */

    /* pusha gli elementi */

    /* meglio fare una pulizia */

    back();
};