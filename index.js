'use strict';


const line = require('@line/bot-sdk');
const express = require('express');
const config = require('./config.json');
var storeLock = "";
const { incomeExpense } = require('./IncomeExpense');
const { replyText } = require('./Process/replymessage.js');



// create LINE SDK client
const client = new line.messagingApi.MessagingApiClient(config);

const app = express();

// webhook callback
app.post('/webhook', line.middleware(config), (req, res) => {
  // ��Ǩ�ͺ��� req.body.events ����������
  if (!Array.isArray(req.body.events)) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    return res.status(500).end();
  }

  // ���Թ��áѺ�������ǹ��
  Promise.all(req.body.events.map(event => {
    console.log('event', event);
    return handleEvent(event);
  }))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// simple reply function
/*const replyText = (replyToken, text, quoteToken,userId) => {
  
  //text = 'วันนี้อยู่ล็อค '+storeLock;
  return client.replyMessage({
    replyToken,
    messages: [{
      type: 'text',
      text,
      quoteToken
    }]
  });
};*/

// callback function to handle a single event
function handleEvent(event) {
  switch (event.type) {
    case 'message':
      const message = event.message;
      const userId = event.source.userId;
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken,userId);
        case 'image':
          return handleImage(message, event.replyToken);
        case 'video':
          return handleVideo(message, event.replyToken);
        case 'audio':
          return handleAudio(message, event.replyToken);
        case 'location':
          return handleLocation(message, event.replyToken);
        case 'sticker':
          return handleSticker(message, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'follow':
      return replyText(event.replyToken, 'Got followed event');

    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

    case 'join':
      return replyText(event.replyToken, `Joined ${event.source.type}`);

    case 'leave':
      return console.log(`Left: ${JSON.stringify(event)}`);

    case 'postback':
      let data = event.postback.data;
      return replyText(event.replyToken, `Got postback: ${data}`);

    case 'beacon':
      const dm = `${Buffer.from(event.beacon.dm || '', 'hex').toString('utf8')}`;
      return replyText(event.replyToken, `${event.beacon.type} beacon hwid : ${event.beacon.hwid} with device message = ${dm}`);

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

function handleText(message, replyToken,userId) {
  const text = message.text;   
  const quoteToken = ""; 

  console.log('log001');
  incomeExpense(client,replyToken, text, quoteToken, userId);
  //return replyText(replyToken, message.text, "",userId);
  return '';
}

function handleImage(message, replyToken) {
  return replyText(replyToken, 'Got Image');
}

function handleVideo(message, replyToken) {
  return replyText(replyToken, 'Got Video');
}

function handleAudio(message, replyToken) {
  return replyText(replyToken, 'Got Audio');
}

function handleLocation(message, replyToken) {
  return replyText(replyToken, 'Got Location');
}

function handleSticker(message, replyToken) {
  return replyText(replyToken, 'Got Sticker');
}

const port = config.port;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});


