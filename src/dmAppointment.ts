import { MachineConfig, send, Action, assign } from "xstate";

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

// const grammar: Grammar = {
//   lecture: {
//     intent: "None",
//     entities: { title: "Dialogue systems lecture" },
//   },
//   lunch: {
//     intent: "None",
//     entities: { title: "Lunch at the canteen" },
//   },
//   doctor: {
//     intent: "None",
//     entities: { title: "Doctor appointment" },
//   },
//   Meeting: {
//     intent: "None",
//     entities: { title: "Work meeting" },
//   },
//   Birthday: {
//     intent: "None",
//     entities: { title: "Jane's birthday" },
//   },
//   Dentist: {
//     intent: "None",
//     entities: { title: "Dentist at downtown" },
//   },
//   Coffe : {
//     intent: "None",
//     entities: { title: "Coffee Break" },
//   },
//   Tutoring: {
//     intent: "None",
//     entities: { title: "Tutoring session" },
//   },
//   Dinner: {
//     intent: "None",
//     entities: { title: "Dinner with family" },
//   },
//   Dance: {
//     intent: "None",
//     entities: { title: "Dance class" },
//   },
//   Gym: {
//     intent: "None",
//     entities: { title: "Work out session" },
//   },
 
//   "on friday": {
//     intent: "None",
//     entities: { day: "Friday" },
//   },
//   "on saturday": {
//     intent: "None",
//     entities: { day: "Saturday" },
//   },
//   "on monday": {
//     intent: "None",
//     entities: { day: "Monday" },
//   },
//   "on Tuesday": {
//     intent: "None",
//     entities: { day: "Tuesday" },
//   },
//   "on Thursday": {
//     intent: "None",
//     entities: { day: "Thursday" },
//   },
//   "on Wednesday": {
//     intent: "None",
//     entities: { day: "Wednesday" },
//   },
//   "on sunday": {
//     intent: "None",
//     entities: { day: "Sundat" },
//   },
//   "on weekend": {
//     intent: "None",
//     entities: { day: "Weekend" },
//   },
//   "at 10": {
//     intent: "None",
//     entities: { time: "10:00" },
//   },
//   "at 9": {
//     intent: "None",
//     entities: { time: "09:00" },
//   },
//   "at 7": {
//     intent: "None",
//     entities: { time: "07:00" },
//   },
//   "at 11": {
//     intent: "None",
//     entities: { time: "11:00" },
//   },
//   "at 8": {
//     intent: "None",
//     entities: { time: "08:00" },
//   },
//   "at 12": {
//     intent: "None",
//     entities: { time: "12:00" },
//   },
//   "yes": {
//     intent: "None",
//     entities: { affirm: "yes" },
//   },
//   "yes, please": {
//     intent: "None",
//     entities: { affirm: "yes" },
//   },
//   "of course": {
//     intent: "None",
//     entities: { affirm: "of course" },
//   },
//   "no": {
//     intent: "None",
//     entities: { reject: "no" },
//   },
//   "no, thanks": {
//     intent: "None",
//     entities: { reject: "no" },
//   },
//   "no way": {
//     intent: "None",
//     entities: { reject: "no" },
//   },
//   "Beyonce": {
//     intent: "None",
//   entities: { famous: "Beyonce"},
//   },
//   "create a meeting": {
//     intent: "None",
//     entities: { request: "Create a meeting" },
//   },
//   "who is beyoncé?": {
//     intent: "None",
//     entities: { request: "Who is x?", name: "beyonce" },
//   },
//   "who is taylor swift?": {
//     intent: "None",
//     entities: { request: "Who is x?", name: "taylor swift" },
//   },

// };

const getEntity = (context:SDSContext, category:string)=>{
  const result =[]
  const entities = context.nluResult.prediction.entities
  for (let i =0; i< entities.length; i++){
    if (entities[i].category ===category){
      result.push(entities[i].text);
      return result
    }
  }
  return false;
};

const getIntent = (context:SDSContext)=>{
  let u = context.nluResult.prediction.topIntent.toLowerCase().replace(/\.$/g, "");
  return u;
};


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
      id:"whoareyou",
    initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "hello",
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
          entry: say("Hi! I am here to help you! What's your name?"),
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
    hello: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "greeting",
            cond: (context) => getIntent(context) === "create a meeting",
            actions: assign({
              request: (context) => {return context.nluResult.query} //context.recResult[0].utterance
            }),
          },
          { target: ".information",
            cond: (context) => getIntent(context) === "who is x",   //context.recResult[0].utterance.replace(/\.$/g, "").replace("Who is ", "").replace("What do you know about ","").replace("Tell me about ","").replace("What is a ","").replace("What's a ", "").replace("?","").replace(/\.$/g, "")
            actions: assign({famous:  
              (context) => {return context.nluResult.prediction.entities[0].text.replace("é","e").replace(/\.$/g, "")}
            }),          
            },
          {
            target: ".nomatch",
          },
        ],
        TIMEOUT: ".prompt",
      },
      states: {
        information: {
          invoke: {
            id: 'getInfo',
            // src: context => nluRequest(context.recResult[0].utterance),
            src: (context, event) => kbRequest(context.famous),
            onDone: [{
              target: 'success',
              cond: (context, event) => event.data.Abstract !== "",
              actions: assign({ information: (context, event) => event.data })
            },
            {
              target: 'failure',
            },
          ],
            onError: {
              target: 'failure',
            }
          }
        },
        success: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `Here is what I found on the web about ${context.famous}. ${context.information.Abstract}`
          })),
          on: {ENDSPEECH: "#meetingX"}
        },
        failure: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `Sorry, I'm afraid I found nothing on the web about ${context.famous}. Try again!`
          })),
          on: {ENDSPEECH: "prompt"}
        },
        prompt: {
          entry: send((context) => ({
            type: "SPEAK",
            value: `Hi ${context.name}. Tell me what you need!`
          })),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        nomatch: {
          entry: say(
            "Sorry, could you please repeat?"
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    greeting: {
      entry: send((context) => ({
        type: "SPEAK",
        value: `OK, Let's create a meeting`,
      })),
      on: { ENDSPEECH: "welcome" },
    },

//start of meeting state
    meetingX: {
      id:"meetingX",
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "denyMeeting",
            cond: (context) => getIntent(context) === "reject",
            actions: assign({
              reject: (context) => context.nluResult.query,
            }), 
          },
          {
            target: "acceptMeeting",
            cond: (context) => getIntent(context) === "affirm",
            actions: assign({
              affirm: (context) => context.nluResult.query,
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
            value: `Would you like to meet ${context.famous}?`,
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
          on: {ENDSPEECH: "prompt"},
        },
      },
    },
    denyMeeting: {
      entry: say("Ok!"),
      on: { ENDSPEECH: "init" },
    },
    acceptMeeting: {
      entry: [
        say("Ok!Let's do it!"),
        assign((context) => ({title: `meeting with ${context.famous}`}))
      ],
      on: { ENDSPEECH: "Date" },
      },
//end of meeting state

    welcome: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "info",
            cond: (context) => !!getEntity(context,"meeting"),
            actions: assign({
              title: (context) =>getEntity(context,"meeting"),
            }),
          },
          {
            target: "info",
            actions: assign({
              title: (context) => context.nluResult.query,
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
          entry: say(" What is it about?"),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        nomatch: {
          entry: say(
            "Sorry, I don't know what it is. Tell me something I know."
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    info: {
      entry: send((context) => ({
        type: "SPEAK",
        value: `OK, ${context.title}`,
      })),
      on: { ENDSPEECH: "Date" },
    },
    Date: {
      id: "Date",
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "Day",
            cond: (context) => !!getEntity(context,"dayoftheweek"),
            actions: assign({
              day: (context) => getEntity(context,"dayoftheweek"),
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
          entry: say("On which day is it?"),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        nomatch: {
          entry: say(
            "Sorry, I don't know what it is. Tell me something I know."
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    Day: {
      entry: send((context) => ({
        type: "SPEAK",
        value: `OK, ${context.day}`,
      })),
      on: { ENDSPEECH: "Duration" },
    },
    
    Duration: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "wholeDayDurationConfirm",
            cond: (context) => getIntent(context) == "affirm",
            actions: assign({
              affirm: (context) => context.nluResult.query,
            }),
          },
          {
            target: "wholeDayDurationReject",
            cond: (context) => getIntent(context) == "reject",
            actions: assign({
              reject:(context) => context.nluResult.query,
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
          entry: say("Will it take the whole day?"),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        nomatch: {
          entry: say(
            "Sorry, I don't know what it is. Tell me something I know."
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    "wholeDayDurationConfirm": {
      entry: say("Ok. Let's create the meeting!"),
      on: { ENDSPEECH: "ConfirmationWholeDay" },
    },
    "wholeDayDurationReject": {
      entry: say("Ok!"),
      on: { ENDSPEECH: "Time" },
    },
    Time: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "TimeOfTheDay",
            cond: (context) => !!getEntity(context,"dayoftheweek"),
            actions: assign({
              time: (context) => getEntity(context,"dayoftheweek"),
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
          entry: say("What time is your meeting?"),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        nomatch: {
          entry: say(
            "Sorry, I don't know what it is. Tell me something I know."
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    TimeOfTheDay: {
      entry: send((context) => ({
        type: "SPEAK",
        value: `OK, ${context.time}`,
      })),
      on: { ENDSPEECH: "Confirmation" },
    },
    ConfirmationWholeDay: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "ConfirmMetingCreation",
            cond: (context) => getIntent(context),
            actions: assign({
              affirm:(context) => context.nluResult.query,
            }),
          },
          {
            target: "RejectMeetingCreation",
            cond: (context) => getIntent(context),
            actions: assign({
              reject: (context) => context.nluResult.query,
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
            value: `Do you want me to create a meeting titled ${context.title}, on ${context.day} for the whole day?`,
          })),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        nomatch: {
          entry: say(
            "Sorry, I don't know what it is. Tell me something I know."
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    "ConfirmMetingCreation": {
      entry: say("Great!"),
      on: { ENDSPEECH: "MeetingCreated" },
    },
    "RejectMeetingCreation": {
      entry: say("Ok. Shall we start over?"),
      on: { ENDSPEECH: "welcome" },
    },
    "MeetingCreated": {
      entry: say("Your meeting has been created!"),
      on: { ENDSPEECH: "init" },

  },
    Confirmation: {
      initial: "prompt",
      on: {
        RECOGNISED: [
          {
            target: "ConfirmMetingCreation",
            cond: (context) => getIntent(context) == "affirm",
            actions: assign({
              affirm: (context) =>context.nluResult.query,
            }),
          },
          {
            target: "RejectMetingCreationByHour",
            cond: (context) => getIntent(context) == "reject",
            actions: assign({
              reject: (context) => context.nluResult.query,
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
            value: `Do you want me to create a meeting titled ${context.title}, on ${context.day} at ${context.time}?`,
          })),
          on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
        nomatch: {
          entry: say(
            "Sorry, I don't know what it is. Tell me something I know."
          ),
          on: { ENDSPEECH: "ask" },
        },
      },
    },
    "ConfirmMetingCreationByHour": {
      entry: say("Great!"),
      on: { ENDSPEECH: "MeetingCreated" },
    },
    "RejectMetingCreationByHour": {
      entry: say("Ok. Shall we start over?"),
      on: { ENDSPEECH: "welcome" },
    },
    "MeetingCreatedByHour": {
      entry: say("Your meeting has been created!"),
      on: { ENDSPEECH: "init" },
    },
  },
};
//here
const kbRequest = (text: string) =>
  fetch(
    new Request(
      `https://cors.eu.org/https://api.duckduckgo.com/?q=${text}&format=json&skip_disambig=1`
    )
  ).then((data) => data.json());