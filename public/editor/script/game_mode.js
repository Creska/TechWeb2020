var gm_b = [ false, false, false ]; // se gm_b[0] è true --> #gm0 è selezionato 
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
 * @param i --> indice del pulsante selezionato
 * Deseleziona tutte le opzioni diverse dal pulsante di indice i
 */
function deselect_other_options( i ) {
	for ( y = 0; y < 3; y++ ) {
		if ( y != i ) {
			change_color_option( "#gm" + y, "bg-primary", "bg-secondary" );
			  gm_b[y] = false;
		}
	}
};

  
/**
* @param i --> numero del pulsante
* Seleziona il pulsante con indice i e deseleziona tutti gli altri
*/
function select( i ) {
	gm_b[i] = !gm_b[i];
  
	if( gm_b[i] ) {
	  change_color_option( "#gm" + i, "bg-secondary", "bg-primary" );
	  deselect_other_options( i );

	  switch (i) {
		case 0:
		  $( "#PlayersN" ).fadeOut();
		  $( "#PlayersN input" ).val( "" );
		  break;
		case 1:
		case 2:
		  $( "#PlayersN" ).fadeIn();
		  $( "#PlayersN input" ).val( "" );
	  }
	}
	else {
		change_color_option( "#gm" + i, "bg-primary", "bg-secondary" );
		if ( i < 3 )
			$( "#PlayersN" ).fadeOut();
	}
};


/**
 * Carica, in base ai dati nel json, la sezione di modifica della Game Mode
 */
function loadGameModeSection() {
	gm_b = [ false, false, false ];

	switch ( CurrentWork.game_mode ) {
		case "SINGLE":
			select(0);
			break;
		case "GROUP":
			select(1);
			if ( CurrentWork.players )
				$( "#PlayersN input" ).val( CurrentWork.players );
			break;
		case "CLASS":
			select(2);
			if ( CurrentWork.players )
				$( "#PlayersN input" ).val( CurrentWork.players );
			break;
		default:
			$( "#ChooseGameMode .card-deck .card" ).removeClass( "bg-primary" );
			$( "#ChooseGameMode .card-deck .card" ).addClass( "bg-secondary" );
			$( "#PlayersN input" ).val( "" );
	}

	$( "#show-score-switch" ).prop( "checked", CurrentWork.show_score );

	for ( [key,value] of Object.entries( CurrentWork.accessibility ) ) {
		$( "#" + String( key ) ).prop( "checked", value );
	}
};


/**
 * Salva nel json le modifiche effettuate alla Game Mode
 */
function saveGameModeSettings() {
	if ( gm_b[0] )
		CurrentWork.game_mode = "SINGLE";
	else if ( gm_b[1] ) {
		CurrentWork.game_mode = "GROUP";
		if ( $( "#PlayersN input" ).first().val() )
			CurrentWork.players = $( "#PlayersN input" ).first().val();
	}
	else if ( gm_b[2] ) {
		CurrentWork.game_mode = "CLASS";
		if ( $( "#PlayersN input" ).first().val() )
			CurrentWork.players = $( "#PlayersN input" ).first().val();
	}
	else
		CurrentWork.game_mode = "";

	CurrentWork.show_score = $( "#show-score-switch" ).prop( "checked" );

	$.each( $( "#Access input[type=checkbox]" ), function( i, val ) {
		CurrentWork.accessibility[ $(val).attr("id") ] = $( val ).prop( "checked" );
	});

	back();
};