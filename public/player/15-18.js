var storia15_18 = {
    ACCESSIBILITY: 1, 
	story_title: "Esperimento al museo", 
	story_ID: -1, 
	game_mode: "SINGLE", 
	single_device: 1,
	quests: [
        {
            quest_title:"Milano e i suoi artisti",
            quest_ID: "",
            activities: [
                {
                    activity_text:[
                        {
                            type: "text",
                            content: `Ci troviamo a Milano per visitare la città e le sue bellezze, ma data il corso di studi universitario seguito, ne approfittiamo per visitare il museo della scienza e della tecnologia Leonardo da Vinci. 
                                Siamo un gruppo di quattro studenti universitari di Bologna del corso di studi di Scienze dell’ingegneria informatica. `
                        },
                        {
                            type: "gallery",
                            content: ['<img src="../museo_scienza.jpg" alt="La foto mostra il museo">',
                                     '<img src="../images/duomo.jpg" alt="La foto mostra la bellazza di Milano">']
                        }],
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
                            type: "text",
                            content: `L'interno di questo museo consiste in un percorso guidato dove si possono esplorare svariate tecnologie inventate da Leonardo da Vinci, ma anche non direttamente da lui. 
                                Inoltre, si possono prenotare diversi laboratori da effettuare nel giorno della visita.`
                        }, 
                        {
                            type: "gallery",
                            content: ['<img src="../images/museo_1.png" alt="La foto mostra la bicicletta volante e altre opere">',
                                      '<img src="../images/museo_2.jpg" alt="La foto mostra il sistema del mulino a vento e altre opere">']
                        }],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "Quale è l'opera più famosa di Leonardo da Vinci?",
                        type: "text",
                        options:[]
                    },
                    answer_outcome: [{
                        response: 'Gioconda',
                        nextquest: 1,
                        nextactivity: 0,
                        score:""
                    },
                    {
                        response: '',
                        nextquest: 1,
                        nextactivity: 0,
                        score: ""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0,     
                },
            ]
        },
        {
            quest_title: "Miglioriamo il futuro",
            quest_ID: "",
            activities: [
                {
                    activity_text:[
                        {
                            type: "text",
                            content: `Guardando l’offerta dei progetti educativi decidiamo di scegliere il progetto SySTEM2020. 
                                Il quale mira a costruire una comprensione più profonda delle tipologie di programmi e attività STEAM (Science-Technology-Engineering-Arts-Mathematics) presenti sul territorio europeo, 
                                per rilevarne l’impatto, progettare risorse, fornire occasioni di reciproco apprendimento e collaborazione per affrontare al meglio le sfide del futuro.`
                        }],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "Secondo te, quale potrebbe essere un'evoluzione futura utile al mondo dell'informatica?",
                        type: "text",
                        options: []
                    },
                    answer_outcome: [{
                        response: '',
                        nextquest: 0,
                        nextactivity: 1, 
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0
                },
                {
                    activity_text:[
                        {
                            type: "text",
                            content: `Scegliamo quel progetto perché ci potrebbe aiutare ad affrontare meglio le materie che sono svolte all’interno del nostro corso di studi e perché è un progetto rivolto ai giovani che vogliono fare anche esperienze all’estero. `
                        },
                        {
                            type: "text",
                            content: `Dopo aver visionato tutte le opere esposte all’interno del museo, ci viene chiesto di compilare l’apposito questionario, prima di iniziare con il progetto educativo richiesto. 
                                Il quale espone tutti i rischi e le norme da seguire durante lo svolgimento del progetto scelto.`
                        },
                        {
                            type: "gallery",
                            content: ['<img src="../images/opera_1.jpg" alt="La foto mostra la barca a vento">',
                                      '<img src="../images/opera_2.jpg" alt="La foto mostra la bicicletta">', 
                                      '<img src="../images/opera_3.jpg" alt="La foto mostra la sega idraulica">']
                        }],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "Quante opere pensi abbia fatto Leonardo da Vinci nell'arco della sua vita?",
                        type: "number",
                        options: []
                    },
                    answer_outcome: [{
                        response: '',
                        nextquest: 1,
                        nextactivity: 0,
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0,     
                },
            ]
        },
        {
            quest_title:"Leggi attentamente le istruzioni",
            quest_ID: "",
            activities: [
                {
                    activity_text:[
                        {
                            type: "text",
                            content: `Una volta compitalo il questionario iniziamo a discutere su quale potrebbe essere l’idea da realizzare per poter seguire il tema di cui parla questo progetto. 
                                Decidiamo quindi di chiedere all’assistente che ci segue un consiglio su come potremmo avere idee e iniziare a strutturare l’attività.`
                        }],
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
                            type: "text",
                            content: `Sotto consiglio dell’assistente e dopo aver narrato di cosa ci occupiamo all’interno dell’ateneo, 
                                decidiamo dunque di progettare una ventola esterna da collegare al computer nel momento in cui il nostro pc si surriscalda troppo e la ventola interna non risulta sufficiente al raffreddamento del dispositivo. `
                        }],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "In base alle tue conoscenze, è un progetto attuabile nella realtà?",
                        type: "checklist",
                        options: ['si', 'no']
                    },
                    answer_outcome: [{
                        response: 'si',
                        nextquest: 0,
                        nextactivity: 2, 
                        score:""
                    },
                    {
                        response: 'no',
                        nextquest: 0,
                        nextactivity: 2, 
                        score:""
                    }, 
                    {
                        response: 'default',
                        nextquest: 0,
                        nextactivity: 2, 
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0
                },
                {
                    activity_text: [
                        {
                            type: "text",
                            content: `Iniziamo dunque a mettere a punto tutti i passaggi che si devono fare per arrivare alla soluzione ideale che ci contraddistingue. 
                                La prima cosa da fare è il disegno di quello che vogliamo realizzare, su questo ci aiuta l’assistente, in quanto il nostro corso di studi non prevede un insegamento di grafica. `
                        },
                        {
                            type: "gallery",
                            content: ['<img src="../images/iter.png" alt="La foto mostra le fasi di uno sviluppo">',
                                      '<img src="../images/ventola.jpg" alt="La foto mostra una ventola del computer">']
                        } 
                    ],
                        activity_type: 'READING',
                        answer_field: {},
                        answer_outcome: [{
                            response: 'default',
                            nextquest: 0,
                            nextactivity: 3
                        }],
                        ASK_EVAL: 0,
                        GET_CHRONO: 0,
                        expected_time: 30000,
                        FINAL: 0,  
                    },
                    {
                        activity_text:[ 
                        {
                            type: "text",
                            content: `Nel frattempo, si pensa a come potremmo collegare questo apparecchio esterno al nostro computer: 
                                la scelta ricade sull’utilizzo di un cavetto aux, compatibile con tutti i pc, in modo tale che si possa attaccare e staccare in base alle condizioni in cui si trova il computer senza bisogno di disconnettere il dispositivo o di una installazione specifica di plug-in o servizi ulteriori. `
                        }],
                        activity_type: 'ANSWER',
                        answer_field: {
                            description: "Cosa è un cavo aux?",
                            type: "text",
                            options: []
                        },
                        answer_outcome: [{
                            response: '',
                            nextquest: 1,
                            nextactivity: 0, 
                            score:""
                        }],
                        ASK_EVAL: 0,
                        GET_CHRONO: 0,
                        expected_time: 30000,
                        FINAL: 0
                }
            ]
        },
        {
            quest_title:"Assemblamento dei pezzi",
            quest_ID: "",
            activities: [
                {
                    activity_text: [
                        {
                            type: "text",
                            content: `Il collaboratore, dopo aver terminato il disegno di progettazione, si occupa di trovare i materiali per proseguire questa realizzazione. 
                                Trova una vecchia e dismessa ventola di un computer che ci torna super utile in quanto già pianificata per l’utilizzo che noi andremo a fare. `
                        },
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
                    activity_text: [
                        {
                            type: "text",
                            content: `Una volta radunati tutti gli oggetti che servono per portare a termine il progetto, li assembliamo, 
                                collegando la ventola tramite i fili elettrici che erano stati tagliati per asportarla al filo aux, 
                                il quale da un lato è stato tagliato per appunto unire i vari cavi e far funzionare l’apparecchiatura.`
                        }
                    ],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "L'implementazione come è stata realizzata risulterà sufficiente al funzionamento dell'invezione?",
                        type: "checklist",
                        options: ['si', 'no']
                    },
                    answer_outcome: [{
                        response: 'si',
                        nextquest: 0,
                        nextactivity: 2, 
                        score:""
                    },
                    {
                        response: 'no',
                        nextquest: 0,
                        nextactivity: 2, 
                        score:""
                    },
                    {
                        response: '',
                        nextquest: 0,
                        nextactivity: 2, 
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0
                },
                {
                    activity_text: [
                        {
                            type: "text",
                            content: `Il servizio che deve fare questo dispositivo esterno è quello di raffreddare ulteriormente il computer, 
                                per questo dovremo andare a programmare un modo tale da far comprendere al computer che quando la ventola esterna non risulta sufficiente al raffreddamento può inviare una notifica così che l’utilizzatore del pc comprenda che deve collegare il dispositivo esterno. `
                        }
                    ],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "Come si potrebbe implementare il sistema per invitare l'utente a collegare il dispositivo esterno?",
                        type: "text",
                        options: []
                    },
                    answer_outcome: [{
                        response: '',
                        nextquest: 1,
                        nextactivity: 0, 
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0
                }
            ]
        },
        {
            quest_title:"L'invenzione messa alla prova",
            quest_ID: "",
            activities: [
                {
                    activity_text: [
                        {
                            type: "text",
                            content: `Dunque, realizzato il dispositivo esterno e il programma interno al computer per l’accensione e lo spegnimento della ventola, non ci resta che testare il progetto realizzato. 
                                Di questo decide di occuparsene uno studente che aveva portato con sé il proprio computer personale. `
                        },
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
                    activity_text: [
                        {
                            type: "text",
                            content: `Attaccato il dispositivo esterno al computer, la prima cosa che nota lo studente è il fatto che vede senza alcun problema e senza bisogno di installazione la ventola progettata. 
                                Questo è un buon segno e rappresenta ciò che ci si aspettava dalla discussione del progetto iniziale. `
                        }
                    ],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "Siamo certi che il comportamento riscrontrato sia una buon segno? In entrambi i casi dare una spiegazione alla risposta data.",
                        type: "text",
                        options: []
                    },
                    answer_outcome: [{
                        response: 'default',
                        nextquest: 0,
                        nextactivity: 2, 
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0
                },
                {
                    activity_text: [
                        {
                            type: "text",
                            content: `Ora cerca aggiornamenti o programmi da installare utili per il proseguimento dei suoi studi, in modo che il dispositivo si surriscaldi più del dovuto. 
                                Così si vede se la ventola progettata porta il risultato ottenuto, ma prima ancora se si accende. `
                        },
                    ],
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
                }
            ]
        },
        {
            quest_title:"Il risultato atteso contro il risultato ottenuto",
            quest_ID: "",
            activities: [
                {
                    activity_text: [
                        {
                            type: "text",
                            content: `Si attiva la ventola interna. Quando il computer raggiunge una temperatura tale da portare all’accensione della ventola esterna, si iniziano a vedere scintille che fuoriescono dall’apposito foro di entrata del cavo aux. 
                                Dell’accessione della ventola esterna non si sente traccia. `
                        },
                    ],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "Quali possono essere state le cause di questo comportamento?",
                        type: "checklist",
                        options: ['Mal progettazione del sistema nel complesso', 'Collegamento errato dei fili', 'Problema del computer su cui si sta testando l\'apparecchiatura']
                    },
					answer_outcome: [{
						response: 'Mal progettazione del sistema nel complesso',
						nextquest: 0,
						nextactivity: 1
                    },
                    {
						response: 'Collegamento errato dei fili',
						nextquest: 0,
						nextactivity: 1
                    },
                    {
						response: 'Problema del computer su cui si sta testando l\'apparecchiatura',
						nextquest: 0,
						nextactivity: 1
                    },
                    {
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
                    activity_text: [
                        {
                            type: "text",
                            content: `Lo studente, prima di togliere la ventola esterna, cerca in tutti i modi di interrompere le installazioni che stava eseguendo sul proprio pc, perché impaurito di prendere la scossa. 
                                Ma tutto quello che cerca di fare risulta inutile e senza successo. `
                        },
                    ],
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
                }
            ]
        },
        {
            quest_title:"La preoccupazione prende il sopravvento",
            quest_ID: "",
            activities: [
                {
                    activity_text: [
                        {
                            type: "text",
                            content: `A questo punto, gli altri studenti, spettatori di quanto stava accadendo, 
                                iniziano a preoccuparsi e uno di questi va a chiamare l’assistente del museo con il quale avevano collaborato all’inizio per la progettazione di questo sistema. `
                        },
                    ],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "Il comportamento dell\'assistente è sembrato ambiguo?",
                        type: "text",
                        options: []
                    },
                    answer_outcome: [{
                        response: 'default',
                        nextquest: 0,
                        nextactivity: 1, 
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0, 
                },
                {
                    activity_text:[
                        {
                            type: "text",
                            content: `Al suo ritorno, si trova dinanzi a sé uno scenario surreale. I suoi tre colleghi di corsi sono ridotti in cenere e del computer non c’è traccia. 
                                L’unica cosa sopravvissuta a questo esperimento è la ventola progettata dagli stessi studenti. `
                        },
                    ],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "Quale sarà stata la causa del decesse dei compagni?",
                        type: "text",
                        options: []
                    },
                    answer_outcome: [{
                        response: 'default',
                        nextquest: 0,
                        nextactivity: 2, 
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0, 
                },
                {
                    activity_text:[
                        {
                            type: "text",
                            content: `Il compagno scoppia in lacrime e preso dalla rabbia addossa la colpa al collaboratore del museo e verso la ventola che gli aveva procurato, dato che era l’unica superstite di quell’orrendo scenario. `
                        },
                    ],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "Si è certi che quanto accaduto sia stata colpa della ventola esterna? Motivare la risposta data.",
                        type: "text",
                        options: []
                    },
                    answer_outcome: [{
                        response: '',
                        nextquest: 1,
                        nextactivity: 0, 
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0, 
                }
            ]
        },
        {
            quest_title:"E pensare che era fatto tutto per gioco",
            quest_ID: "",
            activities: [
                {
                    activity_text: [
                        {
                            type: "text",
                            content: `L’assistente, rimasto calmo, cerca di tranquillizzare lo studente universitario e gli fa presente che nel questionario compilato in precedenza, 
                                era riportato il rischio di quanto accaduto. Per questo motivo, la responsabilità non spetta all’assistente. `
                        },
                    ],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "Nel questionario compilato inizialmente c’era veramente il rischio di morte come dice l’assistente?",
                        type: "checklist",
                        options: ['si', 'no']
                    },
                    answer_outcome: [{
                        response: 'si',
                        nextquest: 0,
                        nextactivity: 1, 
                        score:""
                    },
                    {
                        response: 'no',
                        nextquest: 0,
                        nextactivity: 1, 
                        score:""
                    }, 
                    {
                        response: 'default',
                        nextquest: 0,
                        nextactivity: 1, 
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0
                },
                {
                    activity_text: [
                        {
                            type: "text",
                            content: `Infine, lo studente sopravvissuto ha dovuto fare i conti con le responsabilità prese all’inizio di questo percorso, 
                                accettare quanto accaduto nel laboratorio e tornare in solitudine nella dimora in cui risiedeva a Bologna. `
                        },
                    ],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "Il museo avrà effettuato le giuste indagini e ricordato le vittime come doveva?",
                        type: "text",
                        options: []
                    },
                    answer_outcome: [{
                        response: '',
                        nextquest: 0,
                        nextactivity: 2, 
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0
                },
                {
                    activity_text: [
                        {
                            type: "text",
                            content: `Solo in un secondo momento, verrà emessa la sentenza con tutti i particolari di quel giorno. I tre ragazzi rimasti vittima sono deceduti a causa di un cortocircuito, causato dalla presa di alimentazione del computer dello stesso studente. 
                                Questo poi ha collaborato ad emettere delle scintille cariche di energia elettrica e per chi era vicino al dispositivo non aveva via di uscita. `
                        },
                    ],
                    activity_type: 'READING',
					answer_field: {},
					answer_outcome: {},
					ASK_EVAL: 0,
					GET_CHRONO: 0,
					expected_time: 600000,
					FINAL: 1,
                }
            ]
        }
    ]
}