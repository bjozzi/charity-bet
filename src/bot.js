const Bot = require('./lib/Bot')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')

let bot = new Bot()

// ROUTING

bot.onEvent = function(session, message) {
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
  if (message.content.body.includes('choose')) {
    charity(session)
  }
  welcome(session)
}


function onCommand(session, command) {
  console.log(command.content);
  switch (command.content.value) {
    case 'red-cross':
      charity(command.content.value)
      break
    case 'ethereum-foundation':
      session.set('charity', 'ethereum-foundation')
      break
    case 'givewell.org':
      session.set('charity', 'givewell.org')
      break
    case 'iceland':
      session.set('team1', 'iceland')
      break
    case 'croatia':
      session.set('team1', 'croatia')
      break
    case 'scotland':
      session.set('team2', 'scotland')
      break
    case 'england':
      session.set('team2', 'england')
      break
    }
}

function onPayment(session, message) {
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
  sendMessage(session, `Welcome to charity betting, type charity for choosing charity and games for seeing available games.`)
}

function charity(session){
  session.reply(SOFA.Message({
      body: "Choose a charity you want to bet for with a donation of $0.01.",
      controls: [
        {type: "button", label: "Red Cross", value: "red-cross"},
        {type: "button", label: "Ethereum foundation", value: "ethereum-foundation"},
        {type: "button", label: "GiveWell.org", value: "givewell.org"},
        {type: "button", label: "Not now, thanks", value: null}
      ]
    }));
}

function charity(value){
    session.set('charity', value)
}

function pong(session) {
  sendMessage(session, `Pong`)
}

// example of how to store state on each user
function count(session) {
  let count = (session.get('count') || 0) + 1
  session.set('count', count)
  sendMessage(session, `${count}`)
}

function donate(session) {
  // request $1 USD at current exchange rates
  Fiat.fetch().then((toEth) => {
    session.requestEth(toEth.USD(1))
  })
}

// HELPERS

function sendMessage(session, message) {
  let controls = [
    {type: 'button', label: 'Ping', value: 'ping'},
    {type: 'button', label: 'Count', value: 'count'},
    {type: 'button', label: 'Donate', value: 'donate'}
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}
