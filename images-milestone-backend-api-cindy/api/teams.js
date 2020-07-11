const express = require('express');
const Teams = require('../models/teamsmodel');
const TeamMembers = require('../models/teammembersmodel');
const router = express.Router();

router.get('/getcontentbyid/:id', function(req, res) {
  const _editid = req.params.id;

  Teams.esFindOne({
    term: { edit: _editid }
    /* Teams.findOne({
        "edit": _editid*/
  }, function(err, teams) {
    if (err) return res.send('error');
    res.send(JSON.stringify(teams));
  });
});

router.post('/updatecontent', function(req, res) {
  const _teamid = req.body._id;
  const title = req.body.title;
  const subtitle = req.body.subtitle;
  const content = req.body.content;
  const contentbelow = req.body.contentbelow;

  Teams.esUpdateOne({
    '_id': _teamid
  }, {
    $set:
    {
      title,
      subtitle,
      content,
      contentbelow,
      'edit': 1
    }
  }, function(err, doc) {
    if (err) res.send('error');
    else res.send('success');

  });
});

router.post('/savemember', function(req, res, next) {
  const _name = req.body.name;
  const _designation = req.body.designation;
  const _imageid = req.body.imageid;
  const _teammember = new TeamMembers({ 'name': _name, 'designation': _designation, 'image': _imageid });
  _teammember.save(function(err, teammember) {
    if (err) res.send('error');

    else res.send(teammember);

  });
});

router.post('/updatemember', function(req, res, next) {
  const _name = req.body.name;
  const _designation = req.body.designation;
  const _imageid = req.body.imageid;
  let _image = req.body.image;
  const _teamid = req.body._id;
  if (_imageid == '' || _imageid == undefined) {

  }
  else _image = _imageid;

  TeamMembers.esUpdateOne({ '_id': _teamid }, { $set: { 'name': _name, 'designation': _designation, 'image': _image } }, function(err, faq) {
    if (err) res.send('error');
    else res.send('success');
  });

});

router.get('/listallmembers', function(req, res, next) {

  TeamMembers.esFind({ match_all: {} },
    // TeamMembers.find({},
    function(err, memberlist) {
      if (err) return res.send(err);

      else res.send(memberlist);

    });
});

router.get('/teamdelete/:id', function(req, res, next) {
  const _teamid = req.params.id;
  TeamMembers.esRemoveOne({ '_id': _teamid }, function(err, team) {
    if (err) res.send('error');

    else res.send('success');

  });
});

module.exports = router;
