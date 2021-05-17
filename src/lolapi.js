var LolApi = function (messageName, payloadObj) {
    parent.parent.postMessage({
        message: messageName,
        payload: JSON.stringify(payloadObj)},
        '*');
console.log("API message sent: " + messageName)};


var gameProvidedPayload = false;
var lolMaxRounds = 30;

var reportProgress = function(roundsComplete, scoreDifference) {

    if (scoreDifference < 0){scoreDifference = 0};

    LolApi( "progress", {
        currentProgress: roundsComplete,
        maximumProgress: lolMaxRounds,
        score: scoreDifference
    });
    //sends the complete message if maxrounds is reached
    if (roundsComplete >= lolMaxRounds){
        LolApi("complete", {});
    }
}


const EVENT = {
    RECEIVED: {
        PAUSE: 'pause',
        RESUME: 'resume',
        QUESTIONS: 'questions',
        LANGUAGE: 'language',
        START: 'start',
        INIT: 'init',
        STATE: 'loadState'
    }
};

window.addEventListener("message", function (msg) {
    console.log("[PARENT => JAVASCRIPT", msg);

    switch (msg.data.messageName) {
        case EVENT.RECEIVED.PAUSE:
            // PAUSE handler here
            console.log("PAUSE");
            break;
        case EVENT.RECEIVED.RESUME:
            // RESUME handler here
            break;
        case EVENT.RECEIVED.QUESTIONS:
            // QUESTIONS handler here
            break;
        case EVENT.RECEIVED.LANGUAGE:
            // LANGUAGE handler here
            break;
        case EVENT.RECEIVED.START:
            // START handler here
            break;
        case EVENT.RECEIVED.STATE:
            // STATE handler here
            break;
        case EVENT.RECEIVED.INIT:
            break;
        default:
               console.log('Unhandled message: ' + msg);
    }
});
