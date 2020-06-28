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

TODO:
* Aggiungere gli elementi necessari per chat e script vari
* Migliorare il posizionamento dei miniscript associati ai campi di risposta


*/

// Struttura del JSON

game_example = {
	"game_html": "",
	"settings": {},
	/* La storia è un array di quests. Le quests possono essere in un unico ordine.
	Di conseguenza, ad ogni elemento corrisponde uno e un solo elemento successivo. */
	"quests": [
		{	
			"quest_html": "",
			/* Ogni quest è un array di attività. Ad ognuna di esse può succedere una sola attività.
			Tuttavia, una particolare attività può avere esiti diversi. La scena successiva sarà quindi
			decisa dal codice JS "action_on_activity_answer". */
			"activities": [
				{
					"activity_html": "", // testo HTML dell'attività
					"right_answer": "", // contiene la risposta giusta
					"need_human_evaluation": false, // booleano che indica se c'è necessità di valutazione umana per la risposta
					"next_activities": [], // probabilmente inutile
					"action_on_activity_answer": "" // calcola il punteggio, richiama la valutazione umana, decide l'attività successiva
				}
			]
		}
	],
	"stylesheet": "", // CSS della storia. eventuali stili particolari di quests o attività verranno sovrascritti ad esso
	"score": [] // array che il player trasformerà in matrice. contiene tutti i punteggi delle attività - sarà il player ad aggiornarlo volta per volta
};
