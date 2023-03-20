import { WORDS } from "./words"

export const DATABASE = WORDS.map(item => {
    return {
        word: item.Word.toLowerCase(),
        relations: item.Relations.split(",").map(item => item.toLowerCase())
    }
})
export const USED_WORDS = ['']

export const TRY_WORDS ={
    user: '',
    previous:''
}

export function userTry(word:string,previousWord:string){
    word = word.toLowerCase()
    previousWord = previousWord.toLowerCase()
    if (USED_WORDS.includes(word)){
        return 'You lost'
    }
    USED_WORDS.push(word)
    const dataWord = DATABASE.find(item=>item.word==previousWord)
    
    if(dataWord!.relations.includes(word)){
        return word
    } else{
        return 'You lost'
    }
}

export function returnWord(word: string): any {
    const wordFound = DATABASE.find(item => item.word == word)

    const random = Math.floor(Math.random() * (wordFound!.relations.length))
    const response = wordFound!.relations[random]
    if (USED_WORDS.includes(response)) {
        return returnWord(word)

    }
    USED_WORDS.push(response);
    return response
}

export function computerTry(word: string) {
    word = word.toLowerCase();
    try {
        return returnWord(word)
    }
    catch (e) {
        return 'You win'
    }
}

export function firstWord() {
    const random = Math.floor(Math.random() * DATABASE.length)
    let wordOne = DATABASE[random].word
    return wordOne
}

export const getEntity = (context: SDSContext, entity: string) => {
    // lowercase the utterance and remove tailing "."
    let u = context.recResult[0].utterance.toLowerCase().replace(/\.$/g, "");
    if (u in grammar) {
        if (entity in grammar[u].entities) {
            return grammar[u].entities[entity];
        }
    }
    return false;
};
const grammar: Grammar = {
    "yes": {
        intent: "None",
        entities: { affirm: "yes" },
    },
    "yes, please": {
        intent: "None",
        entities: { affirm: "yes" },
    },
    "of course": {
        intent: "None",
        entities: { affirm: "of course" },
    },
    "no": {
        intent: "None",
        entities: { reject: "no" },
    },
    "no, thanks": {
        intent: "None",
        entities: { reject: "no" },
    },
    "no way": {
        intent: "None",
        entities: { reject: "no" },
    },
};

import { MachineConfig, send, Action, assign, StatesConfig, EventObject, BaseActionObject } from "xstate";

function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }));
}

interface Grammar {
    [index: string]: {
        intent: string;
        entities: {
            [index: string]: string;
        };
    };
}

export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = {
    initial: "idle",
    states: {
        idle: {
            on: {
                CLICK: "init",
            },
        },
        init: {
            on: {
                TTS_READY: "whoareyou",
                CLICK: "whoareyou",
            },
        },
        whoareyou: {
            id: "whoareyou",
            initial: "prompt",
            on: {
                RECOGNISED: [
                    {
                        target: "Introduction",
                        actions: assign({
                            name: (context) => context.recResult[0].utterance.replace(/\.$/g, "")
                        }),
                    },
                    {
                        target: ".noinput",
                    },
                ],
                TIMEOUT: ".prompt",
            },
            states: {
                prompt: {
                    entry: say("Hi! My name is Minerva and I will be your co-player today! What would you like to have as your nickname for this game?"),
                    on: { ENDSPEECH: "ask" },
                },
                ask: {
                    entry: send("LISTEN"),
                },
                noinput: {
                    entry: say(
                        "Sorry, I don't know what it is. Tell me something I know!"
                    ),
                    on: { ENDSPEECH: "ask" },
                },
            },
        },
        Introduction: {
            id: "Introduction",
            initial: "prompt",
            on: {
                RECOGNISED: [
                    {
                        target: "denyInstructions",
                        cond: (context) => !!getEntity(context, "reject"),
                        actions: assign({
                            reject: (context) => getEntity(context, "reject"),
                        }),
                    },
                    {
                        target: "acceptInstructions",
                        cond: (context) => !!getEntity(context, "affirm"),
                        actions: assign({
                            affirm: (context) => getEntity(context, "affirm"),
                        }),
                    },
                    {
                        target: ".nomatch",
                    },
                ],
                TIMEOUT: ".prompt",
            },
            states: {
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `Hi ${context.name}!I have some instructions for you! If this is your first time this playing this game, I would advise you to listen to them. Do you want to hear the instructions?`,
                    })),
                    on: { ENDSPEECH: "ask" },
                },
                ask: {
                    entry: send("LISTEN"),
                },
                nomatch: {
                    entry: say(
                        "Sorry, I don't know what it is. Tell me something I know.!"
                    ),
                    on: { ENDSPEECH: "prompt" },
                },
            },
        },
        denyInstructions: {
            entry: say("Ok!Let's play!"),
            on: { ENDSPEECH: "gamestart" },
        },
        acceptInstructions: {
            entry: [
                say("Ok!Here we go!"),
                //assign((context) => ({title: `meeting with ${context.famous}`}))
            ],
            on: { ENDSPEECH: "Instructions" },
        },

        Instructions: {
            id: "Instructions",
            initial: "prompt",
            on: {
                RECOGNISED: [
                    {
                        target: "playlater",
                        cond: (context) => !!getEntity(context, "reject"),
                        actions: assign({
                            reject: (context) => getEntity(context, "reject"),
                            word: (context) => firstWord(),
                        }),
                    },
                    {
                        target: "playnow",
                        cond: (context) => !!getEntity(context, "affirm"),
                        actions: assign({
                            affirm: (context) => getEntity(context, "affirm"),
                            word: (context) => {
                                let first = firstWord()
                                TRY_WORDS.previous = first
                                return first
                            },
                        }),
                    },

                    {
                        target: ".nomatch",
                    },
                ],
                TIMEOUT: ".prompt",
            },
            states: {
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `GIVE INSTRUCTIONS LATER! Do you want to start playing? I just need a yes or no ${context.name}`,
                    })),
                    on: { ENDSPEECH: "ask" },
                },
                ask: {
                    entry: send("LISTEN"),
                },
                nomatch: {
                    entry: say(
                        "Sorry, I don't know what it is. Tell me something I know.!"
                    ),
                    on: { ENDSPEECH: "prompt" },
                },
            },
        },
        playlater: {
            entry: say(`Ok!See you another time!`),
            on: { ENDSPEECH: "init" },
        },
        playnow: {
            entry: [
                say("Ok!Here we go!"),
                //assign((context) => ({title: `meeting with ${context.famous}`}))
            ],
            on: { ENDSPEECH: "gamestart" },
        },
        
        gamestart: {
            id: "gamestart",
            initial: "prompt",
            on: {
                RECOGNISED: [
                    {
                        target: "accept",
                        actions: assign({
                            userword: (context) => {
                                TRY_WORDS.user = context.recResult[0].utterance
                                TRY_WORDS.previous = computerTry(TRY_WORDS.user)
                                return TRY_WORDS.user
                            },
                            
                        }),
                        //cond: (context) => userTry(TRY_WORDS.user.toLowerCase(),TRY_WORDS.previous.toLowerCase()) ==='You lost',
                        
                    },
                    // {
                    //     target: "Userlost",
                    //     actions: assign({
                    //         userword: (context) => {
                    //             TRY_WORDS.user = context.recResult[0].utterance
                    //             console.log(TRY_WORDS)
                    //             return context.recResult[0].utterance
                    //         },
                            
                    //     }),
                    //     cond: (context) => userTry(TRY_WORDS.user.toLowerCase(),TRY_WORDS.previous.toLowerCase()) === 'You lost',
                        
                    // },

                    // {
                    //     target: "Computerlost",
                    //     actions: assign({
                    //         userword: (context) => {
                    //             TRY_WORDS.user = context.recResult[0].utterance
                    //             return context.recResult[0].utterance
                    //         },
                            
                    //     }),
                    //     cond: (context) => userTry(TRY_WORDS.user.toLowerCase(),TRY_WORDS.previous.toLowerCase()) === 'You win',
                        
                    // },

                   
                    {
                        target: ".noinput",
                    },
                ],
                TIMEOUT: ".prompt",
            },
            states: {
                prompt: {
                    entry:send((context) => ({
                        type: "SPEAK",
                        value: `The first word is ${TRY_WORDS.previous}`
                    })),
                    on: { ENDSPEECH: "ask" },
                },
                ask: {
                    entry: send("LISTEN"),
                },
                noinput: {
                    entry: say(
                        "Sorry, I don't know what it is. Tell me something I know!"
                    ),
                    on: { ENDSPEECH: "ask" },
                },
            },


        },
        accept: {
            id: "accept",
            entry: send((context) => ({
                type: "SPEAK",
                value: `ok`
            })),
            on: { ENDSPEECH: "gamestart" },
        },

        Userlost: {
            id: "Userlost",
            entry: send((context) => ({
                type: "SPEAK",
                value: `You lost! Let's see how many points you got!`
            })),
            on: { ENDSPEECH: "init" },
        },
        Computerlost: {
            id: "Computerlost",
            entry: send((context) => ({
                type: "SPEAK",
                value: `You win! Let's see how many points you got`
            })),
            on: { ENDSPEECH: "init" },
        },
    },

};