var outcome_in_editing;
var questmap;

function loadOutcomesSection() {
    outcome_in_editing = -1;

    let activity = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];

    $( "#OutcomesTable tr:not(:first-child)" ).remove();

    /* pulisce lista alert */
    /* controlla se aggiungere gli alert, nel caso li aggiunge e fa return */

    questmap = new Map();
    $.each( CurrentWork.quests, function( q_i, q ) {
        questmap[q.quest_id] = q_i;
    });

    $.each( activity.answer_outcome, function( i, v ) {
        addOutcome( v );
    });

    loadOutcomeWidget();
};


function loadOutcomeWidget() {
    CurrentStage = CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN];

    $( "#outcome-answerfield" ).remove();
    
    if ( CurrentStage.activity_type == "ANSWER" ) {
	    if ( CurrentStage.answer_field.type == "checklist" ) {
            $( "#AddOutcomeWidget" ).prepend( $( "<ul id='outcome-answerfield'/ul>" ) );
            
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
		    $( "#AddOutcomeWidget" ).prepend( $( "<input/>", 
		    {
			    id: "outcome-answerfield",
			    type: CurrentStage.answer_field.type
		    }));
	    }

        $( "#outcome-answerfield" ).toggle(true);
    }
    
    let questli;
    $( "#outcome-questlist" ).empty();
    $.each( CurrentWork.quests, function( q_i, q ) {
        questli = $( "<li/>" );
        questli.append( $( "<input type='radio' name='questlist'>" ).val( q.quest_id ).attr( "id", q.quest_id ) );
        questli.append( $( "<label/>" ).attr( "for", q.quest_id ).text( q.quest_id + " (" + q.quest_title + ")" ) );
        $( "#outcome-questlist" ).append( questli );
    });
    
        
    $( "#outcome-activitylist" ).empty();
};


function loadActivityList() {
    if ( $( "#outcome-questlist input:checked" ).length < 1 )
        return;
    
    $( "#outcome-activitylist" ).empty();

    let newli;
    $.each( CurrentWork.quests[questmap[$( "#outcome-questlist input:checked" ).val()]].activities, function( a_i, a) {
        newli = $( "<li/>" );
        newli.append( $( "<input type='radio' name='activitylist'>" ).val( a.activity_id ).attr( "id", a.activity_id ) );
        newli.append( $( "<label/>" ).attr( "for", a.activity_id ).text( a.activity_id ) );
        $( "#outcome-activitylist" ).append( newli );
    });  
};


function loadOutcomeData( entry ) {
    outcome_in_editing = getOutcomeIndex( entry );
    $( "#outcome-answerfield" ).fadeOut();

    if ( entry.children().first().text == "default" )
        $( "#outcome-answerfield input" ).attr( "disabled", true );
    else
        $( "#outcome-answerfield input" ).attr( "disabled", false );

    /* colora la entry */

    $( "#outcome-score" ).val( entry.children().eq(1) )
    $( "#outcome-questlist input" ).eq( entry.children().eq(2) ).prop( "checked", true );

    loadActivityList();

    $( "#outcome-activitylist input" ).eq( entry.children().eq(3) ).prop( "checked", true );
};


function getOutcomeIndex( node ) {
    let iter = node.prev();
    let count = 0;

    while ( iter.length ) {
        count += 1;
        iter = iter.prev();
    }

    return count;
}


function addOutcome( obj ) {
    console.log( "aggiungo nuovo outcome"); // debugging
    let entry = $( "<tr/>" );
    entry.append( $( "<td/>" ).text( obj.response ) );
    entry.append( $( "<td/>" ).text( obj.score ) );
    entry.append( $( "<td/>" ).text( obj.nextquest ) );
    entry.append( $( "<td/>" ).text( obj.nextactivity ) );
    entry.append( $( "<td/>" ).text( "edit" ) );
    if ( obj.response == "default" )
        entry.append( $( "<td/>" ) );
    else
        entry.append( $( "<td/>" ).text( "canc" ) );
    $( "#OutcomesTable" ).append( entry );
};


function updateOutcome() {
    console.log( "updateoutcome"); // debugging
    let label;

    if ( $( "#outcome-answerfield input" ).first().attr( "type" ) == "radio" ) {
        if ( $( "#outcome-answerfield input:checked" ).length )
            label = $( "#outcome-answerfield input:checked" ).val().toLowerCase();
        else
            return;
    }
    else {
        if ( $( "#outcome-answerfield" ).val() && $( "#outcome-answerfield" ).val().toLowerCase() !== "default" )
            label = $( "#outcome-answerfield" ).val().toLowerCase();
        else
            return;
    }

    let nextquest;

    if ( $( "#outcome-questlist input:checked" ).length )
        nextquest = $( "#outcome-questlist input:checked" ).val();
    else
        nextquest = null;
    
    let nextactivity;

    if ( $( "#outcome-activitylist input:checked" ).length )
        nextactivity = $( "#outcome-activitylist input:checked" ).val()
    else   
        nextactivity = null;
    

    if ( outcome_in_editing < 0 ) {
        addOutcome({
            response: label,
            nextquest: nextquest,
            nextactivity: nextactivity,
            score: $( "#outcome-score" ).val()
        });
        return;
    }

    let entry = $( "#OutcomesTable tr" ).eq( outcome_in_editing );
    entry.children().eq(0).text( label );
    entry.children().eq(1).text( $( "#outcome-score" ).val() );
    entry.children().eq(2).text( nextquest );
    entry.children().eq(3).text( nextactivity );

    outcome_in_editing = - 1;
};



function saveOutcomesSection() {
    CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome = [];

    $.each( $( "#OutcomesTable tr:not(:first-child)" ), function(index, node) {
        CurrentWork.quests[CurrentNavStatus.QuestN].activities[CurrentNavStatus.ActivityN].answer_outcome.push({
            response: $(node).children().eq(0).text(),
            score: $(node).children().eq(1).text(),
            nextquest: $(node).children().eq(2).text(),
            nextactivity: $(node).children().eq(3).text()
        });
    });

    back();
};




/* casi possibili:
1-caricamento del widget con i dati di un outcome
2-salvataggio dei dati del widget a un indice specifico
2-aggiunta di un campo da widget
3-aggiunta di un outcome dall'array
*/
