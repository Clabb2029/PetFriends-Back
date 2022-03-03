var express = require('express');
const userModel = require('../models/users');
const agendaModel = require('../models/agenda')
const reviewModel = require('../models/reviews')
var router = express.Router();
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });


// Création d'un compte 

router.post('/signup', async function(req, res, next) {
  // var token = req.body.token;
  // var pseudo = req.body.pseudo;
  // var email = req.body.email;
  // var password = req.body.password

  var newUser = await userModel({
    address: {
      zipcode : req.body.zipcode,
      city : req.body.city,
      latitude : req.body.latitude,
      longitude : req.body.longitude
    },
  pseudo : req.body.pseudo,
  email : req.body.email,
  optinEmails : req.body.optinEmails,
  password : req.body.password,
  avatar : req.body.avatar,
  livingPlace : req.body.livingPlace,
  status : req.body.status,
  petChoice : [req.body.petChoice],
  description : req.body.description,
  guardType : req.body.guardType,
  })

  var userSaved = await newUser.save();

  res.json({result:true, userSaved})


  // if (!token || !pseudo || !email || !password) {
  //   res.json({result: false})
  // } else {
  //   res.json({result: true})
  // }
});


// Connection
router.post('/signin', function(req, res, next) {
  var email = req.body.email
  var password = req.body.password

  if(!email || !password){
    res.json({result: false})
  } else {
    res.json({result: true, user: [{
      pseudo: 'clara',
      token: 12
    }] })
  }
})

// Récuperation des profils users pour l'affichage sur ProfilScreen : 
router.get('/users/:userID', async function(req, res, next) {

  var userid = await userModel.findById(req.params.userID)
  
  if(userid){
    var userReviews = await userModel.findById(req.params.userID).populate('reviews').exec();
    var reviewSender = await reviewModel.find({id_receiver: req.params.userID}).populate('id_sender').exec();

    res.json({userInfo : userReviews, reviews: userReviews.reviews, reviewSender})
    console.log(reviewSender)
  } else {
    res.json({result: false})
  }
})

// Récupération des positions des users
router.get('/users-position', async function(req, res, next){

  var users = await userModel.find({
    latitude: req.query.latitude,
    longitude: req.query.longitude
  })

  if(!users){
    res.json({result: false})
  } else {
    res.json({result: true, users})
  }
 
})

// Récupération des notes 
router.get('/rate', function(req, res, next){
  res.json()
})

// Ajout d'un favoris
router.post('/add-favorite', function(req, res, next){
  res.json()
})

// Suppression d'un favoris
router.delete('/delete-favorite/', function(req, res, next){
  res.json()
})

// Récupération des favoris
router.get('/favorites', function(req, res, next){
  res.json()
})

// Récupération des conversations
router.get('/conversations', function(req, res, next){
  res.json()
})

// Suppression d'une conversation 
router.delete('/delete-conversation', function(req, res, next){
  res.json()
})

// Récupération d'un chat pour afficher les messages entre 2 users
router.get('/chat', function(req, res, next){
  res.json()
})

// Envoi d'un message
router.post('/send-message', function(req, res, next){
  res.json()
})

// Récupération de l'agenda
router.get('/agenda', async function(req, res, next){
  var user = await userModel.findById('621e0150cf730fd82221b149')
  
  if(user){
    var userAgenda = await agendaModel.find({id_receiver:"621e0150cf730fd82221b149" }).populate('id_sender').exec();
    res.json({ result: true, agendaInfo:userAgenda})
  } else {
    res.json({result: false})  }
})

// Modification de l'agenda
router.put('/agenda/', async function(req, res, next){
  console.log(req.body)

  agenda = await agendaModel.updateOne(
    {_id : req.body.id},
    {status: req.body.status})

    agendaUpdate = await agendaModel.findById(req.body.id).populate('id_sender').exec();

    if(agenda.acknowledged == true){
      res.json({result:true, agendaUpdate })
    } else {
      res.json({result: false})
    }
  
})

// Ajouter un rendez-vous
router.post('/add-date', async function(req, res, next){
  var sitter = await userModel.findById(req.body.receiverid)
  var owner = await userModel.findById(req.body.senderid)

  var newDate = await agendaModel({
    id_sender : req.body.senderid,
    id_receiver : req.body.receiverid,
    beginning : req.body.beginningdate,
    ending : req.body.endingdate,
    status : req.body.status
  })
  var newDateSaved = await newDate.save()

  sitter.agenda.push(newDateSaved.id)
  var sitterSaved = sitter.save()
  owner.agenda.push(newDateSaved.id)
  var ownerSaved = owner.save()
  res.json({result:true, newDate, ownerSaved, sitterSaved})
})

// Modifier info d'un user 
router.put('/settings', function(req, res, next){
  res.json()
})

// Ecrire une review
router.post('/add-review', async function(req, res, next){

 var user = await userModel.findById(req.body.id_receiver)

 var newReview = await reviewModel ({
  id_sender : req.body.id_sender,
  id_receiver : req.body.id_receiver,
  message : req.body.message,
  rate : req.body.rate,
})
var reviewSaved =  await newReview.save()

  user.reviews.push(reviewSaved.id)
  var userSaved = user.save();
  res.json({result:true, reviewSaved, userSaved})
})


module.exports = router;
