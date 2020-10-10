/*
ORGANIZZAZIONE:
* La storia è un array di quests, che a loro volta sono un array di attività (spiegazioni o sfide)
* Ogni quest avrà un numero che indica la quest successiva
* Ogni attività avrà un array i cui numeri indicano le possibili attività successive. Un campo javascript avrà gli IF-ELSE appositi per determinare quale attività attribuire in base alla risposta data. Se un'attività avrà una sola transizione possibile, l'array avrà un numero unico
* La primissima quest sarà quella che chiederà al giocatore di inserire alcuni parametri. Su questi si basano alcune varianze come la presenza di campi risposta aggiuntivi, le successioni di alcune quest, ecc. Queste varianze sono stabilite a priori dall'autore.
* Il CSS viene abbinato ad ogni elemento tramite apposito id, che viene settato automaticamente dall'ambiente editor
* Per il processing dei valori di input client-side ci si può riferire a questo esempio --> https://www.w3schools.com/Js/tryit.asp?filename=tryjs_form_elements
*/

// Struttura dell'oggetto JSON

// NOTA IMPORTANTE - i campi relativi ai settings forse è meglio toglierli

game_example = {
	ACCESSIBILITY: 0, // flag che indica se la storia è accessibile
	story_title: "", // probabilmente servirà un div per contenerlo
	story_ID: -1, // ID di identificazione univoca. Inizializzato a -1
	game_mode: "", // indica la modalità di gioco (singolo, gruppo o classe)
	single_device: 1, // indica se vi è un solo dispositivo per gruppo. di default è settato a true
	quests: [
		{	
			quest_title: "", // probabilmente servirà un div per contenerlo
			/* Ogni quest è un array di attività. Ad ognuna di esse può succedere una sola attività.
			Tuttavia, una particolare attività può avere esiti diversi. La scena successiva sarà quindi
			decisa dal codice JS "action_on_activity_answer". */
			activities: [
				{
					activity_text: [], // testo HTML dell'attività. è un array in cui ogni elemento è un testo/immagine/galleria
					answer_field: "", // HTML del campo risposta
					right_answer: "", // contiene la risposta giusta
					answer_score: "", // punteggio per la risposta giusta
					answer_outcome: {}, // oggetto nel quale ad ogni entry corrisponde uno dei possibilit outcomes, ed il valore equivale all'attività a cui spostarsi
					ASK_EVAL: 0, // flag che indica se c'è necessità di valutazione umana per la risposta
					GET_CHRONO: 0, // flag che indica se bisogna calcolare il tempo di risposta alla domanda
					expected_time: 0, // tempo in ms previsto per il completamento dell'attività
					FINAL: 0 // indica se l'attività è quella finale. In tal caso non vi sarà alcun campo risposta
				}
			]
		}
	],
	stylesheet: "", // CSS della storia. eventuali stili particolari di quests o attività verranno sovrascritti ad esso
	score: [] // array che il player trasformerà in matrice. contiene tutti i punteggi delle attività - sarà il player ad aggiornarlo volta per volta
};


/*
SETTINGS
Inizialmente era prevista anche questa feature - relativa alle impostazioni personalizzate del giocatore che poi andranno ad influire sulla storia.
Aggiungerla solo se strettamente necessario.

settings: [
	{
		setting_name: "", // nome dell'opzione
		setting_value: "" // valore - vuoto finché il giocatore non sceglie la sua preferenza
	}
],
settings_form: ""

*/