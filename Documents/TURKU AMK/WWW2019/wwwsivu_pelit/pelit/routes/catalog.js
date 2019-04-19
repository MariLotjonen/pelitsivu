var express = require('express');
var router = express.Router();

// Require controller modules.
var game_controller = require('../controllers/gameController');
var gamestudio_controller = require('../controllers/gamestudioController');
var genre_controller = require('../controllers/genreController');
var platform_controller = require('../controllers/platformController');


/// BOOK ROUTES ///

// GET catalog home page.
router.get('/', game_controller.index);

// GET request for creating a Game. NOTE This must come before routes that display Game (uses id).
router.get('/game/create', game_controller.game_create_get);

// POST request for creating Game.
router.post('/game/create', game_controller.game_create_post);

// GET request to update Game.
router.get('/game/:id/update', game_controller.game_update_get);

// POST request to update Game.
router.post('/game/:id/update', game_controller.game_update_post);

// GET request for one Game.
router.get('/game/:id', game_controller.game_detail);

// GET request for list of all Game items.
router.get('/games', game_controller.game_list);

/// Gamestudio ROUTES ///

// GET request for creating Gamestudio. NOTE This must come before route for id (i.e. display gamestudio).
router.get('/gamestudio/create', gamestudio_controller.gamestudio_create_get);

// POST request for creating Gamestudio.
router.post('/gamestudio/create', gamestudio_controller.gamestudio_create_post);

// GET request for one Gamestudio.
router.get('/gamestudio/:id', gamestudio_controller.gamestudio_detail);

// GET request for list of all Gamestudios.
router.get('/gamestudios', gamestudio_controller.gamestudio_list);

/// GENRE ROUTES ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
router.get('/genre/create', genre_controller.genre_create_get);

//POST request for creating Genre.
router.post('/genre/create', genre_controller.genre_create_post);

// GET request for one Genre.
router.get('/genre/:id', genre_controller.genre_detail);

// GET request for list of all Genre.
router.get('/genres', genre_controller.genre_list);

/// PLATFORM ROUTES ///

// GET request for creating a Platform. NOTE This must come before route that displays Platform (uses id).
router.get('/platform/create', platform_controller.platform_create_get);

//POST request for creating Platform.
router.post('/platform/create', platform_controller.platform_create_post);

// GET request for one Platform.
router.get('/platform/:id', platform_controller.platform_detail);

// GET request for list of all Platform.
router.get('/platforms', platform_controller.platform_list);


module.exports = router;
