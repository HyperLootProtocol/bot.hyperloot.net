# Bot
Bot is powerful service what provide communication between people in community.

## Usage

* `npm run dev` start in development mode (with nodemon, it will reload after any changes), u can use web adapter for local work, easy start and call `//localhost:3000/api/message?message=text&id=1&username=test`
* `npm test` run jest and eslint (please check it before commit)
* `npm start` start bundle in prod mode (TODO)

## Abstract

### executor
Atomic element, we use it to build all bot functionality. It simple function what get `response` and `context` and return new mutated `response` object.

`response` like temp container what keep all session data (UNDERWORK! Signature unstable).
* `response.output: string` Output need to send text message as handler emiter (user get this as answer).

`context` immutable structure what contain basic functions, what provide from app.js (core?) (UNDERWORK!)
* `context.input: string` contain text view of event (like user msg text in most cases)
* `context.handle: (response) => void` method for calling client callback (in-future need provide cross-client handling)
* `context.from: CLIENT_ID` client name (discord/telegram/etc)
* `context.i18n: (keyword: string) => string` provide function what return string by unique keyword from string lib, see more in i18n
* `context.db: object` provide mongo connector, _in future provide helpers for fast module scope acces and user data_
* `context.id: string` client specific id (for unuqie provide client+id)
* `context.username: string` client specific username

Basic example (signature):
```
async (response, context) => {
    //... CHECKERS (to prevent unexpected mutation)
    if (response.something) {
        return response; // if we return response, we skip executor
    }

    // OR skip executor-set
    if (response.something && context.someMethod()) {
        return; // if we return null, we skip executor and all executor set in this module (executor set) see later
    }

    //... RESPONSE MUTATIONS
    response.someData = true;

    // OR
    try {
        response.test = await someAsyncCall(); // we can write like this
    } catch (error) {
        throw(new Error());
    }

    return response;
}

// Also good point to deconstruction context
async (response, { i18n, db }) => { ... }
```

### module (executors set)
Module is array of executors. Each executor called by declared order and transmit mutated `response` to next executor in array.

If executor return `null` we prevent call rest executors in *array*! Also good point use this behavior for filtering in queue.

If executor `throw('error')` app also skip rest executors in array and add to `esponse.error` error tip. U can use it after filtering by some conditions and provide information for user.

#### Examples:

```
instance.use([someFilter, errorer, mutate]);

// where
function someFilter(response, context) {
    if (context.input[0] === '1') {
        return response; // we pass only then first input symbol equal '!'
    }
}

function errorer(response, context) {
    if (context.input[0] !== '2') {
        throw('SECOND SYMBOL NOT 2');
    }

    return response;
}

function mutate(response) {
    response.output = '3';

    return response;
}

```

Also we can create advanced cases with different filters/filter factories and subchains
```
instance.use([
    [someFilter, filter2, mutate1, mutate2],
    [filter, filterFactory('someType'), mutate],
    otherCall,
    errorHandler
]);

```

### client
Client is something like adapter to connect some service/way to work with app. Any client must emit `proccess` call then something happens and provide `context` with event data. Be sure to transform any handled data to universal form.

Client also must provide callback function, that will be called after all modules will be executed!

In general cases we provide `input` and `handle` and basic adapter ready to serve! :)
```

client.onEvent(data => {
    instance.process({
        input: data.msg,
        handle(response) {
            client.emitTextAnswer(response.output);
        },
    });
})
```

### context
signature and methods

#### i18n
#### db

### response
signature and lock-in keys

### user model
db structure
methods

## Pre-build modules
command
user
...

## clients specific events

## messages

# feature list (+proposals)
telegram
discord
clubs
web-dashboard
twitch
youtube
vk
