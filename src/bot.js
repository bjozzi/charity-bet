const Bot = require('./lib/Bot')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')

let bot = new Bot()

// ROUTING

bot.onEvent = function(session, message) {
  console.log(message.type)
  switch (message.type) {
    case 'Init':
      welcome(session)
      break
    case 'Message':
      onMessage(session, message)
      break
    case 'Command':
      onCommand(session, message)
      break
    case 'Payment':
      onPayment(session, message)
      break
    case 'PaymentRequest':
      welcome(session)
      break
  }
}


function onMessage(session, message) {
  if (message.content.body.includes('Go')) {
    charity(session)
    return
  }
  else{
    welcome(session)
  }
  
}


function onCommand(session, command) {
  console.log(command.content);
  switch (command.content.value) {
    case 'red-cross':
      session.set('charity', command.content.value)
      game1(session)
      break
    case 'ethereum-foundation':
      session.set('charity', command.content.value)
      game1(session)
      break
    case 'givewell.org':
      session.set('charity', command.content.value)
      game1(session)
      break
    case 'iceland':
      session.set('team', nameAndOdds(command.content.body))
      game2(session)
      break
    case 'croatia':
      session.set('team', nameAndOdds(command.content.body))
      game2(session)
      break
    case 'scotland':
      session.set('team2', nameAndOdds(command.content.body))
      final(session)
      break
    case 'england':
      session.set('team2', nameAndOdds(command.content.body))
      final(session)
      break
    }
}

function onPayment(session, message) {
  console.log(session)
  console.log(message)
  if (message.fromAddress == session.config.paymentAddress) {
    // handle payments sent by the bot
    if (message.status == 'confirmed') {
      // perform special action once the payment has been confirmed
      // on the network
    } else if (message.status == 'error') {
      // oops, something went wrong with a payment we tried to send!
    }
  } else {
    // handle payments sent to the bot
    if (message.status == 'unconfirmed') {
      // payment has been sent to the ethereum network, but is not yet confirmed
      sendMessage(session, `Thanks for the payment! 🙏`);
    } else if (message.status == 'confirmed') {
      // handle when the payment is actually confirmed!
    } else if (message.status == 'error') {
      sendMessage(session, `There was an error with your payment!🚫`);
    }
  }
}

// STATES

function welcome(session) {
  sendMessage(session, `Charity betting. Type "go" for choosing a charity and what teams to bet on!`)
}

function charity(session){
  session.reply(SOFA.Message({
      body: "Choose a charity",
      controls: [
        {type: "button", label: "Red Cross", value: "red-cross"},
        {type: "button", label: "Ethereum foundation", value: "ethereum-foundation"},
        {type: "button", label: "GiveWell.org", value: "givewell.org"}
      ],
      showKeyboard: false
    }));
}

function game1(session){
  session.reply(SOFA.Message({
      body: "Choose a team",
      controls: [
        {type: "button", label: "Iceland - 3.97", value: "iceland"},
        {type: "button", label: "Croatia - 2.01", value: "croatia"}
      ],
      showKeyboard: false
    }));
}

function game2(session){
  session.reply(SOFA.Message({
      body: "Choose a team",
      controls: [
        {type: "button", label: "England - 1.71", value: "england"},
        {type: "button", label: "Scotland - 5.47", value: "scotland"}
      ],
      showKeyboard: false
    }));
}

function final(session){
  var charity = session.get('charity')
  console.log(session.get('team'))
  var game = session.get('team')
  var game2 = session.get('team2')
  var message = 'You will give ' + charity + " if " + game.name + " or " + game2.name + " will lose!\n"+
  "Press pay to get the odds and place bet?"
  session.reply(message);
}



function donate(session) {
  // request $1 USD at current exchange rates
  Fiat.fetch().then((toEth) => {
    session.requestEth(toEth.USD(1))
  })
}

// HELPERS

function sendMessage(session, message) {
  session.reply(message);
}

function nameAndOdds(odd){
  console.log(odd)
  var res = odd.split("-");
  console.log(res[0])
  console.log(res[1])
  var obj = {name:res[0], odds:res[1]}
  return obj
}

//P(A or B) = P(A) + P(B) - P(A and B)
function calculateOdds(odd1, odd2){
  return odd1 + odd2 - (odd1 * odd2)
}