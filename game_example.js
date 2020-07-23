/*

Idea per il procedimento:

COSA DOVREBBE VEDERE IL GIOCATORE:

____________________________________
|                                   |
|            NOME STORIA            |
|___________________________________|
|                                   |
|            NOME QUEST             |
|___________________________________|
|                                   |
|        testo, immagini, ecc.      |
|                                   |
.                                   .
.                                   .
.                                   .
|                                   |
| CAMPO RISPOSTA DI FINE ATTIVITA'  |
|___________________________________|



ORGANIZZAZIONE:
* La storia è un array di quests, che a loro volta sono un array di attività (spiegazioni o sfide)
* Ogni quest avrà un numero che indica la quest successiva
* Ogni attività avrà un array i cui numeri indicano le possibili attività successive. Un campo javascript avrà gli IF-ELSE appositi per determinare quale attività attribuire in base alla risposta data. Se un'attività avrà una sola transizione possibile, l'array avrà un numero unico
* La primissima quest sarà quella che chiederà al giocatore di inserire alcuni parametri. Su questi si basano alcune varianze come la presenza di campi risposta aggiuntivi, le successioni di alcune quest, ecc. Queste varianze sono stabilite a priori dall'autore.
* Il CSS viene abbinato ad ogni elemento tramite apposito id, che viene settato automaticamente dall'ambiente editor
* Per il processing dei valori di input client-side ci si può riferire a questo esempio --> https://www.w3schools.com/Js/tryit.asp?filename=tryjs_form_elements

TODO:
* Aggiungere gli elementi necessari per chat e script vari
* Migliorare il posizionamento dei miniscript associati ai campi di risposta


*/

// Struttura del JSON

game_example = {
	"ACCESSIBILITY": 0, // flag che indica se la storia è accessibile
	"story_title": "", // probabilmente servirà un div per contenerlo
	"story_ID": -1, // ID di identificazione univoca. Inizializzato a -1
	"settings": {}, // oggetto con parametri vuoti inizializzati dall'autore
	"settings_form": "", // form che il player usa per compilare i settings
	/* La storia è un array di quests. Le quests possono essere in un unico ordine.
	Di conseguenza, ad ogni elemento corrisponde uno e un solo elemento successivo. */
	"quests": [
		{	
			"quest_title": "", // probabilmente servirà un div per contenerlo
			/* Ogni quest è un array di attività. Ad ognuna di esse può succedere una sola attività.
			Tuttavia, una particolare attività può avere esiti diversi. La scena successiva sarà quindi
			decisa dal codice JS "action_on_activity_answer". */
			"activities": [
				{
					"activity_html": "", // testo HTML dell'attività e del campo risposta
					"right_answer": "", // contiene la risposta giusta
					"answer_score": "", // punteggio per la risposta giusta
					"ASK_EVAL": 0, // flag che indica se c'è necessità di valutazione umana per la risposta
					"expected_time": 0 // tempo in ms previsto per il completamento dell'attività
				}
			]
		}
	],
	"stylesheet": "", // CSS della storia. eventuali stili particolari di quests o attività verranno sovrascritti ad esso
	"score": [] // array che il player trasformerà in matrice. contiene tutti i punteggi delle attività - sarà il player ad aggiornarlo volta per volta
};
