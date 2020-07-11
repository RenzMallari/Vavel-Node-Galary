var old = {
  //required parameters
  'userId': 'nits.soutik-facilitator_api1.gmail.com',
  'password': '1383656087',
  'signature': 'AVFWrb2ma2KXcRr-kkxfLqx7mEPOArsqtrMXucFprSI80skWJOyxCFch',

  //make sure that senderEmail and above credentials are from the same paypal account
  //otherwise paypal won't complete payment automatically
  'senderEmail': 'nits.soutik-facilitator@gmail.com',

  //optional parameters and their defaults
  'sandbox': true,
  'feesPayer': 'SENDER',
  'currencyCode': 'USD',
};
var pay = require('paypal-pay')({
  //required parameters
  'userId': 'javier-facilitator_api1.vavel.com',
  'password': 'H8NYTDUFFYTU24NY',
  'signature': 'AL9m.Ik7RwRs-q0u3tu6-0eSqDOVAkB1qw-IiJIqVqg2aa3NmoScx3yj',

  //make sure that senderEmail and above credentials are from the same paypal account
  //otherwise paypal won't complete payment automatically
  'senderEmail': 'javier-facilitator@vavel.com',

  //optional parameters and their defaults
  'sandbox': true,
  'feesPayer': 'SENDER',
  'currencyCode': 'USD',
});
var paypal_api = require('paypal-rest-sdk');

/*var config = {
  "api": {
    "host": "api.sandbox.paypal.com",
    "port": "",
    "client_id": "AbKFI5oxOVC6rzRTSHzStUt-YcmqESLZuS1Rg22qbuOyrQNHPIlQcsi6yKjI5cUIdXnbMXLrgn-dyqR5", // your paypal application client id
    "client_secret": "EMdU5s8gK8cPnFrD7njXBzwxJA1aRRpdYBZX4Cvs10a0bF2DTEzkVGj4L9GWUApbHSUspzYmaFRfMA5u" // your paypal application secret id
  }
}*/
//facundo.crego config
var config = {
  "api": {
    "host": "api.sandbox.paypal.com",
    "port": "",
    "client_id": "AbKFI5oxOVC6rzRTSHzStUt-YcmqESLZuS1Rg22qbuOyrQNHPIlQcsi6yKjI5cUIdXnbMXLrgn-dyqR5", // your paypal application client id
    "client_secret": "EMdU5s8gK8cPnFrD7njXBzwxJA1aRRpdYBZX4Cvs10a0bF2DTEzkVGj4L9GWUApbHSUspzYmaFRfMA5u" // your paypal application secret id
  }
}



paypal_api.configure(config.api);

/*
user.js and usergallery.js
paypal.paypal_api.configure({
 'mode': 'sandbox',
 'client_id': 'AagmhObOlbFGnRUeTbkSfuoEpLPLuZoLAf_wbN177nkcfrIdEYmjcVjr-l6nk_7dj0PXageyOR_dfy8v',
 'client_secret': 'ELDrwbpgIEtg1MOiaObvVgvxzUZrBdkoSZlXdtRRbjyuV40Rhyxyyh0qitkOgSvNDyHNmyc6ZL-I0auF'
});*/

var getApprovalURL = function(links) {
  var url;
  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    if (link.rel === 'approval_url') {
      url = link.href;
    }
  }
  return url;
};

// var merchantURL = 'https://vavel.photos/';
var merchantURL = 'https://images.vavel.com/';

module.exports = {
  pay: pay,
  paypal_api: paypal_api,
  getApprovalURL: getApprovalURL,
  merchantURL: merchantURL
};
