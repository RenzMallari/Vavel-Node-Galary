var express = require('express');
const { google } = require('googleapis');
var router = express.Router();

const keys = require('./jwt-key.json');
const scopes = ['https://www.googleapis.com/auth/analytics.readonly'];
const jwt = new google.auth.JWT(keys.client_email, null, keys.private_key, scopes);

async function getauthtoken() {
    const response = await jwt.authorize();
    return response;
}

router.get('/getauthtoken', function(req, res) {
    getauthtoken()
    .then(auth => {
        if (auth) {
            res.send({
                access_token: auth.access_token
            });   
        }
    })
    .catch(err => {
        console.log('error', err);
    });
});

router.post('/queryAnalyticsData', async function(req, res){
    var params = {
        'auth': jwt,
        'ids': 'ga:' + req.body.ids,
        'start-date': req.body.startDate,
        'end-date': req.body.endDate,
        'metrics': req.body.metrics,
        'sort': req.body.sort
    };
    
    if (req.body.dimensions) {
        params.dimensions = req.body.dimensions;
    }
  
    if (req.body.filters) {
        params.filters = req.body.filters;
    }

    if (req.body.pageSize) {
        params = {
            ...params, 
            'max-results': req.body.pageSize
        };
    }
    if (req.body.startIndex) {
        params = {
            ...params,
            'start-index': req.body.startIndex
        };
    }

    const result = await google.analytics('v3').data.ga.get(params);
    res.send(result.data);
});

module.exports = router;
