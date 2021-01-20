var storia7_10 = {
    ACCESSIBILITY: 1, 
	story_title: "Risveglio della mummia", 
	story_ID: -1, 
	game_mode: "SINGLE", 
	single_device: 1,
	quests: [
        {
            quest_title: "L'avvenimento dell'anno.",
            quest_ID: "",
            activities: [
                {
                    activity_text: [
                        {
                            type:"text",
                            content: `
                                Fate parte di un piccolo gruppo di giornalisti inviati al Museo Egizio di Torino per documentare la celebrazione dei 200 anni dall’apertura. 
                                Per l’occasione, il direttore del museo ha annunciato alcuni festeggiamenti speciali, e molti turisi sono arrivati all’interno dell’edificio. 
                                Inoltre, da quel che avete capito, sarà mostrata per la prima volta al pubblico una mummia ritrovata in tempi recenti.`
                        },
                        {
                            type: "gallery",
                            content: ['<img src="../images/mummia.jpg" alt="La foto mostra una mummia">', '<img src="../images/volto_mummia.jpg" alt="La foto mostra il volto di una mummia">']
                        }
                    ],
					activity_type: 'ANSWER',
					answer_field: {
						description: "Cosa sono le mummie?",
						type: "text",
						options: []
					},
					answer_outcome:
					[{
						response: "cadavere imbalsamato",
						nextquest: 1,
                        nextactivity: 0,
                        score: ""
					},
					{
						response: "",
						nextquest: 1,
                        nextactivity: 0,
                        score: ""
					}],
					ASK_EVAL: 0,
					GET_CHRONO: 0,
					expected_time: 18000,
					FINAL: 0
                },
            ],
        },
        {
            quest_title: "Fatto con il cuore.",
            quest_ID:"",
            activities:[
                {
                    activity_text: [
                        {
                            type: "text",
                            content: `
                                Finalmente entrate in una delle sale più importanti del museo, quella delle mummie e dei sarcofaghi. 
                                I sarcofaghi sono una delle caratteristiche più famose della cultura egizia. 
                                Questi artefatti erano fabbricati in legno, terracotta o pietra ed erano decorati con grandi pitture.`
                        },
                        {
                            type: "gallery",
                            content: ['<img src="../images/legno.jpg" style="margin-bottom: 10px;" alt="La foto mostra un sarcofago in legno">', '<img src="../images/terracotta.jpg" style="margin-bottom: 10px;" alt="La foto mostra un sarcofago in terracotta">', '<img src="../images/pietra.jpg" style="margin-bottom: 10px;" alt="La foto mostra un sarcofago in pietra">']
                        },
                        {
                            type: "text",
                            content: `
                                Il motivo per cui venivano costruiti i sarcofaghi era quello di dare alla salma una sorta di armatura elegante con cui poteva presentarsi nell’aldilà.`
                        }
                    ],
                    activity_type: 'READING',
                    answer_field: {},
					answer_outcome: [{
						response: 'default',
						nextquest: 0,
						nextactivity: 1
					}],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0,            
                },
                {
                    activity_text:[
                        {
                            type:"text",
                            content: `
                                Il processo di mummificazione è molto lungo. Il corpo del defunto viene portato a dei sacerdoti esperti che lo preparano per il funerale. 
                                Una delle cose più complesse della preparazione è la rimozione degli organi interni, che sono poi inseriti in alcuni vasi detti “canopi”. 
                                Tutti quelli più importanti vengono rimossi: polmoni, cervello, fegato, ecc.`
                        }, 
                        {
                            type: "gallery",
                            content: ['<img src="../images/imbalsamazione.jpg" alt="La foto mostra il processo di mummificazione">', '<img src="../images/mummificazione.jpg" alt="La foto mostra il processo di mummificazione">']
                        }],
					activity_type: 'ANSWER',
					answer_field: {
						description: "L’unico organo che viene lasciato è il cuore. Riesci a dire il perché?",
						type: 'text',
						options: []
					},
					answer_outcome:
					[{
						response: 'La anima rappresenta il cuore',
						nextquest: 1,
                        nextactivity: 0,
                        score: ""
                    }],
                    answer_outcome:
					[{
						response: '',
						nextquest: 0,
                        nextactivity: 2,
                        score: ""
					}],
					ASK_EVAL: 0,
					GET_CHRONO: 0,
					expected_time: 15000,
					FINAL: 0
                },
                {
                    activity_text:[
                        {
                            type:"text",
                            content: `
                                Il cuore veniva lasciato all’interno del corpo per un importante motivo. 
                                Al suo arrivo nell’aldilà, il defunto veniva giudicato da Osiride, il dio del regno dei morti. 
                                I giudici valutavano la bontà del defunto controllando il peso dell’anima. 
                                Se l’anima risultava più pesante di una piuma, l’uomo sarebbe stato divorato da un mostro. 
                                Se invece era più leggera, il defunto poteva procedere nel paradiso. 
                                Nell’antichità, come anche oggi, l’anima era rappresentata dal cuore. 
                                Ecco quindi il perché questo organo veniva lasciato all’interno del corpo.`
                        }
                    ], 
                    activity_type:'READING',
                    answer_field: {},
                    answer_outcome: [{
                        response: 'default',
                        nextquest: 1,
                        nextactivity: 0
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0,            
                }, 
            ],
                
        },
        {
            quest_title: "Una strana confusione.",
            quest_ID:"",
            activities:[
                {
                    activity_text:[
                        {
                            type: "text",
                            content: `
                                Molte persone sono radunate in un particolare punto di una delle sale dedicate alle mummie. 
                                Riuscite a trovare un po’ di spazio per poter vedere qual è l’attrazione.`
                        }, 
                        {
                            type: "text",
                            content: `Scoprite che il bersaglio di tutti i curiosi è proprio la teca della nuova mummia. 
                                Accanto alla teca c’è un cartello con una grande foto del ritrovamento. 
                                Il corpo sembra essere stato conservato benissimo, e infatti appare grande come una persona normale. `
                        },
                        {
                            type: "text",
                            content: `
                                Sotto alla foto, c’è scritto che la mummia è stata trovata in una importante ricerca, avvenuta tra le rovine della città che un tempo si chiamava Babilonia. 
                                Il testo dice anche che questa spedizione archeologica fa parte di uno speciale progetto portato avanti in Mesopotamia.
                                Il testo vi lascia perplessi, come se ci fosse qualcosa di impreciso.`
                        }],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "Riesci a dire di cosa si tratta?",
                        type: 'checklist',
                        options: ['Babilonia non si trovava in Mesopotamia', 'I regni degli antichi egizi non si espansero fino in Mesopotamia']
                    },
                    answer_outcome:[{
                            response: 'I regni degli antichi egizi non si espansero fino in Mesopotamia',
                            nextquest: 1,
                            nextactivity: 0,
                            score: ""
                        },
                        {
                            response: 'Babilonia non si trovava in Mesopotami',
                            nextquest: 0,
                            nextactivity: 1,
                            score: ""
                        },
                        {
                            response: 'default',
                            nextquest: 0,
                            nextactivity: 1,
                            score: ""
                        }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 15000,
                    FINAL: 0                      
                },
                {
                    activity_text:[{
                        type: "text",
                        content: `
                            Il testo del cartello era piuttosto strano. 
                            La civiltà egizia, infatti, non ha mai vissuto in Mesopotamia. 
                            Questa regione dell’Asia era stata popolata da altre comunità, come quella dei Sumeri. 
                            Ed è quindi impossibile che una persona, così importante da essere mummificata, abbia avuto la sua tomba a Babilonia. 
                            Inoltre, in quelle regioni non sono mai state trovate le rovine delle tipiche piramidi egiziane. 
                            Decidete quindi, appena possibile, di fare qualche domanda al direttore del museo.`
                    },
                    {
                        type: "gallery",
                        content: ['<img src="../images/mesapotamia.png" alt="La foto mostra la cartina della mesopotamia">', '<img src="../images/mesopotamia_oggi.png" alt="La foto mostra la cartina della mesopotamia ad oggi">']
                    }],
                    activity_type: 'READING',
                    answer_field: {},
                    answer_outcome: [{
                        response: 'default',
                        nextquest: 1,
                        nextactivity: 0
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0,            
                },
            ],
        },
        {
            quest_title: "Tutto è possibile.",
            quest_ID: "",
            activities: [
                {
                    activity_text:[{
                        type:"text",
                        content: `
                            Si sentono dei rumori improvvisi provenire dalla teca della nuova mummia arrivata al museo. 
                            Di sfuggita, riuscite a vedere la mummia che, con strani movimenti, apre la teca e spinge via gli spettatori vicini. 
                            Decidete di inseguirla, anche se siete piuttosto stupiti da ciò che sta accadendo. `
                    }],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "È possibile che una mummia prenda vita?",
                        type: 'checklist',
                        options: ['Assolutamente impossibile', 'È possibile, ma solamente in casi veramente particolari e improbabili']
                    },
                    answer_outcome:[{
                            response: 'Assolutamente impossibile',
                            nextquest: 0,
                            nextactivity: 1,
                            score: ""
                        },
                        {
                            response: 'È possibile, ma solamente in casi veramente particolari e improbabili',
                            nextquest: 0,
                            nextactivity: 1,
                            score: ""
                        },
                       {
                            response: 'default',
                            nextquest: 0,
                            nextactivity: 1
                        }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 15000,
                    FINAL: 0                      
                },
                {
                    activity_text:[{
                        type:"text",
                        content: `
                            Lo strano personaggio è molto veloce a correre e faticate a stargli dietro. 
                            Mentre cercate di farvi strada tra tutte le persone che non capiscono cosa sta succedendo, iniziate a farvi alcune domande.`
                    }],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "Siete certi che nessuno abbia imitato quella che tutti pensavano fosse una mummia? ",
                        type: 'checklist',
                        options: ['SI', 'NO']
                    },
                    answer_outcome:[{
                            response: 'SI',
                            nextquest: 1,
                            nextactivity: 0,
                            score: ""
                        },
                        {
                            response: 'NO',
                            nextquest: 1,
                            nextactivity: 0,
                            score: ""
                    },
                    {
                        response: '',
                        nextquest: 1,
                        nextactivity: 0,
                        score: ""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 15000,
                    FINAL: 0                      
                },
            ],
        },
        {
            quest_title: "Strano destino.",
            quest_ID: "",
            activities:[
                {
                    activity_text:[{
                        type:"text",
                        content: `
                            Arrivati verso l’uscita del museo, la mummia schizza fuori dalle porte e sale sul sedile posteriore di una macchina. 
                            Il veicolo, appena accolto lo strano passeggero, parte a gran velocità, seminandovi. `
                    },
                    {
                        type:"text",
                        content: `
                            Nel frattempo, i membri del personale del museo cercano di calmare la situazione e dicono ai visitatori che possono continuare la loro visita, e che penseranno loro a indagare. 
                            Dopo pochi secondi, vi raggiunge il direttore del museo, che vi chiede cosa stia succedendo. 
                            Appena saputa la notizia, l’uomo rimane incredulo e dice “Avverto i miei colleghi e cercheremo di fare qualcosa.”. `
                    }],
                    activity_type: 'ANSWER',
					answer_field: {
						description: "Avete notato qualcosa di strano nel comportamento del direttore e dei gestori del museo?",
						type: 'text',
						options: []
					},
					answer_outcome:
					[{
						response: '',
						nextquest: 1,
                        nextactivity: 0,
                        score: ""
					}],
					ASK_EVAL: 0,
					GET_CHRONO: 0,
					expected_time: 15000,
					FINAL: 0
                },
            ],
        },
        {
            quest_title:"Altezza è mezza bellezza.",
            quest_ID:"",
            activities:[
                {
                    activity_text:[{
                        type:"text",
                        content: `
                            In una grande sala sono esposte alcune delle attrazioni più famose delle onoranze funebri: i sarcofaghi. 
                            Queste speciali bare erano dipinte e decorate in modo estremamente elegante. 
                            Avevano una forma regale, raffigurante il defunto con due scettri nelle mani. Sulla testa era raffigurato un grosso copricapo. 
                            In alcuni casi particolari, la mummia non era posta dentro un solo sarcofago, ma dentro una serie di due o più sarcofaghi. 
                            Questo veniva fatto per garantire una maggiore protezione al defunto.`
                    }, 
                    {
                            type: "gallery",
                            content: ['<img src="../images/sarcofago_oro.jpg" alt="La foto mostra un sarcofago elegante">', '<img src="../images/strati.jpg" alt="La foto mostra la stratificazione di un sarcofago">']
                        }],
                    activity_type: 'READING',
                    answer_field: {},
                    answer_outcome: [{
                        response: '',
                        nextquest: 0,
                        nextactivity: 1,
                        score: ""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0,            
                },
                {
                    activity_text:[{
                        type:"text",
                        content: `
                            Ciò che notate subito è il fatto che tutti i sarcofaghi sembrano piuttosto bassi rispetto a voi. 
                            Mettendovi nei panni di un qualsiasi defunto, non avreste mai avuto spazio per entrare nella bara.`
                    }],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "Questo quindi vi fa pensare a due motivi:",
                        type: 'checklist',
                        options: ['Gli egizi erano normalmente più bassi rispetto all’uomo moderno', 'La rimozione degli organi faceva sì che il corpo perdesse volume, e quindi diventasse più basso']
                    },
                    answer_outcome:[{
                            response: 'Gli egizi erano normalmente più bassi rispetto all’uomo moderno',
                            nextquest: 0,
                            nextactivity: 2,
                            score: ""
                        },
                        {
                            response: 'La rimozione degli organi faceva sì che il corpo perdesse volume, e quindi diventasse più basso',
                            nextquest: 0,
                            nextactivity: 2,
                            score: ""
                        },
                        {
                            response: '',
                            nextquest: 0,
                            nextactivity: 2,
                            score: ""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 15000,
                    FINAL: 0                      
                },
                {
                    activity_text:[{
                        type:"text",
                        content: `
                            Su un pannello leggete che nella prima fase del periodo dinastico (2925-2575 a.C.), l’altezza media degli egizi era di 161cm. 
                            Erano quindi un po’ più bassi rispetto all’uomo moderno. E questo spiega il perché i sarcofaghi sembrano essere troppo bassi rispetto alla vostra altezza.`
                    }],
                    activity_type: 'READING',
                    answer_field: {},
                    answer_outcome: [{
                        response: 'default',
                        nextquest: 1,
                        nextactivity: 0
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 1,
                    expected_time: 30000,
                },
            ],
        },
        {
            quest_title: "La calma è la vitù dei forti.",
            quest_ID:"",
            activities:[
                {
                    activity_text:
                    [{
                        type:"text",
                        content: `
                            Finalmente riuscite ad incontrare il direttore del museo. Non ha un aspetto tranquillo, ma non sembra neanche preoccupato. 
                            Viete fatti alcune idee sull’accaduto e decidete quindi di dire la vostra su quanto appena successo`
                    }],
                    activity_type: 'ANSWER',
					answer_field: {
						description: "Scrivi qui la tua idea:",
						type: 'text',
						options: []
					},
					answer_outcome:
					[{
						response: '',
						nextquest: 0,
                        nextactivity: 1,
                        score: ""
					}],
					ASK_EVAL: 0,
					GET_CHRONO: 0,
					expected_time: 15000,
					FINAL: 0
                },
                {
                    activity_text:
                    [{
                        type:"text",
                        content: `
                            I vostri dubbi sono piuttosto concreti. Quella mummia non era una vera mummia, ma probabilmente un uomo travestito.`
                    }],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description:"Ma quale di questi è stato il motivo principale che ve lo ha fatto capire?",
                        type: "checklist",
                        options:['E’ impossibile che si siano conservati tutti e quattro gli arti. Una situazione del genere è rara', 
                                'Una vera mummia non conserva polmoni, cervello ed altri organi vitali', 'La mummia sembrava troppo alta',
                                'Il cartello ed i suoi errori potrebbero essere collegati a tutta questa faccenda']
                    },
                    answer_outcome: [{
                        response: '',
                        nextquest: 1,
                        nextactivity: 0,
                        score: ""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000
                },
            ],
        },
		{
			quest_title: "Ecco il segreto.",
			quest_ID: "",
			activities: [
				{
					activity_text: 
					[{
						type: "text",
						content: `
                            Il direttore del museo sorride e si mette a ridere. 
                            Si congratula con voi per essere riusciti a capire che il tutto si trattasse di uno scherzo. 
                            E annuncia: “Per i festeggiamenti avevo promesso delle sorprese speciali. 
                            E quindi ho deciso di organizzare questa sorpresa, facendo credere a tutti per un istante che una mummia prendesse vita. 
                            Ovviamente quella non era una vera mummia, ma un attore travestito. 
                            Questa scena non servirà solo per celebrare il nostro importante anniversario, ma servirà anche a farci pubblicità!”.`
                    },
                    {
                        type:"text",
                        content: `
                            La cosa è piuttosto comoda per voi, e già vi immaginate i titoli da dare ai racconti che scriverete. 
                            Il giorno dopo, in tante edicole sarebbero comparsi giornali che in copertina recheranno la notizia di una mummia che prende vita.`
                    }],
					activity_type: 'READING',
					answer_field: {},
					answer_outcome: {},
					ASK_EVAL: 0,
					GET_CHRONO: 0,
					expected_time: 600000,
					FINAL: 1,
                }
                
			]
		},
	],
};