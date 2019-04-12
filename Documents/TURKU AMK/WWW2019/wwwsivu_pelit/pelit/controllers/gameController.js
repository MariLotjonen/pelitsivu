var Game = require('../models/game');
var Gamestudio = require('../models/gamestudio');
var Genre = require('../models/genre');
var Platform = require('../models/platform');


var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.index = function(req, res) {   
    
    async.parallel({
        game_count: function(callback) {
            Game.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        gamestudio_count: function(callback) {
            Gamestudio.countDocuments({}, callback);
        },
        genre_count: function(callback) {
            Genre.countDocuments({}, callback);
        },
        platform_count: function(callback) {
            Platform.countDocuments({}, callback);
        }
    }, function(err, results) {
        res.render('index', { title: 'Games worth to play', error: err, data: results });
    });
};;

// Display list of all Games.
exports.game_list = function(req, res, next) {

    Game.find({}, 'title gamestudio')
      .populate('gamestudio')
      .exec(function (err, list_games) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('game_list', { title: 'List of Games', game_list: list_games });
      });
      
  };

// Display detail page for a specific game.
exports.game_detail = function(req, res, next) {

    async.parallel({
        game: function(callback) {

            Game.findById(req.params.id)
              .populate('gamestudio')
              .populate('genre')
              .populate('platform')
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.game==null) { // No results.
            var err = new Error('Game not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('game_detail', { title: 'Title', game: results.game, game_instance: results.game_instance } );
    });

};

// Display game create form on GET.
exports.game_create_get = function(req, res, next) { 
      
    // Get all gamestudios and genres, which we can use for adding to our game.
    async.parallel({
        gamestudios: function(callback) {
            Gamestudio.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
        platforms: function(callback) {
            Platform.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('game_form', { title: 'Add a game', gamestudios: results.gamestudios, genres: results.genres, platforms: results.platforms });
    });
    
};

// Handle game create on POST.
exports.game_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },

    (req, res, next) => {
        if(!(req.body.platform instanceof Array)){
            if(typeof req.body.platform==='undefined')
            req.body.platform=[];
            else
            req.body.platform=new Array(req.body.platform);
        }
        next();
    },

    // Validate fields.
    body('title', 'Name must not be empty.').isLength({ min: 1 }).trim(),
    body('gamestudio', 'Gamestudio must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('players', 'players must not be empty').isLength({ min: 1 }).trim(),
  
    // Sanitize fields (using wildcard).
    sanitizeBody('*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Game object with escaped and trimmed data.
        var game = new Game(
          { title: req.body.title,
            gamestudio: req.body.gamestudio,
            summary: req.body.summary,
            players: req.body.players,
            genre: req.body.genre,
            platform: req.body.platform,
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all gamestudios and genres for form.
            async.parallel({
                gamestudios: function(callback) {
                    Gamestudio.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
                platforms: function(callback) {
                    Platform.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (game.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                for (let i = 0; i < results.platforms.length; i++) {
                    if (game.platform.indexOf(results.platforms[i]._id) > -1) {
                        results.platforms[i].checked='true';
                    }
                }
                res.render('game_form', { title: 'Add game',gamestudios:results.gamestudios, genres:results.genres, platforms:results.platforms, game: game, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save game.
            game.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to new game record.
                   res.redirect(game.url);
                });
        }
    }
];

// Display game delete form on GET.
exports.game_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Game delete GET');
};

// Handle game delete on POST.
exports.game_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Game delete POST');
};

// Display game update form on GET.
exports.game_update_get = function(req, res, next) {

    // Get game, gamestudios and genres for form.
    async.parallel({
        game: function(callback) {
            Game.findById(req.params.id).populate('gamestudio').populate('genre').exec(callback);
        },
        gamestudios: function(callback) {
            Gamestudio.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
        platforms: function(callback) {
            Platform.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.game==null) { // No results.
                var err = new Error('Game not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            // Mark our selected genres as checked.
            for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
                for (var game_g_iter = 0; game_g_iter < results.game.genre.length; game_g_iter++) {
                    if (results.genres[all_g_iter]._id.toString()==results.game.genre[game_g_iter]._id.toString()) {
                        results.genres[all_g_iter].checked='true';
                    }
                }
            }
            for (var all_g_iter = 0; all_g_iter < results.platforms.length; all_g_iter++) {
                for (var game_g_iter = 0; game_g_iter < results.game.platform.length; game_g_iter++) {
                    if (results.platforms[all_g_iter]._id.toString()==results.game.platform[game_g_iter]._id.toString()) {
                        results.platforms[all_g_iter].checked='true';
                    }
                }
            }
            res.render('game_form', { title: 'Update Game', gamestudios:results.gamestudios, genres:results.genres, platforms:results.platforms, game: results.game });
        });

};

// Handle game update on POST.
exports.game_update_post = [

    // Convert the genre to an array
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },

    (req, res, next) => {
        if(!(req.body.platform instanceof Array)){
            if(typeof req.body.platform==='undefined')
            req.body.platform=[];
            else
            req.body.platform=new Array(req.body.platform);
        }
        next();
    },
   
    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('gamestudio', 'Gamestudio must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('players', 'players must not be empty').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('title').escape(),
    sanitizeBody('gamestudio').escape(),
    sanitizeBody('summary').escape(),
    sanitizeBody('players').escape(),
    sanitizeBody('genre.*').escape(),
    sanitizeBody('platform.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Game object with escaped/trimmed data and old id.
        var game = new Game(
          { title: req.body.title,
            gamestudio: req.body.gamestudio,
            summary: req.body.summary,
            players: req.body.players,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            platform: (typeof req.body.platform==='undefined') ? [] : req.body.platform,
            _id:req.params.id //This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all gamestudios and genres for form.
            async.parallel({
                gamestudios: function(callback) {
                    Gamestudio.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
                platforms: function(callback) {
                    Platform.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (game.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                for (let i = 0; i < results.platforms.length; i++) {
                    if (game.platform.indexOf(results.platforms[i]._id) > -1) {
                        results.platforms[i].checked='true';
                    }
                }
                res.render('game_form', { title: 'Update Game',gamestudios:results.gamestudios, genres:results.genres, platforms:results.platforms, game: game, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Game.findByIdAndUpdate(req.params.id, game, {}, function (err,thegame) {
                if (err) { return next(err); }
                   // Successful - redirect to game detail page.
                   res.redirect(thegame.url);
                });
        }
    }
];