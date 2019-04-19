var Gamestudio = require('../models/gamestudio');
var async = require('async');
var Game = require('../models/game');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Gamestudios.
exports.gamestudio_list = function(req, res, next) {

    Gamestudio.find()
      .sort([['studioname', 'ascending']])
      .exec(function (err, list_gamestudios) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('gamestudio_list', { title: 'Gamestudios', gamestudio_list: list_gamestudios });
      });
  
  };
  
// Display detail page for a specific Gamestudio.
exports.gamestudio_detail = function(req, res, next) {

    async.parallel({
        gamestudio: function(callback) {
            Gamestudio.findById(req.params.id)
              .exec(callback)
        },
        gamestudios_games: function(callback) {
          Game.find({ 'gamestudio': req.params.id },'title summary')
          .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.gamestudio==null) { // No results.
            var err = new Error('Gamestudio not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('gamestudio_detail', { title: 'Gamestudio Detail', gamestudio: results.gamestudio, gamestudio_games: results.gamestudios_games } );
    });

};

// Display Gamestudio create form on GET.
exports.gamestudio_create_get = function(req, res, next) {       
    res.render('gamestudio_form', { title: 'Add Gamestudio'});
};

// Handle Gamestudio create on POST.
exports.gamestudio_create_post = [

    // Validate fields.
    body('country').isLength({ min: 1 }).trim().withMessage('Country must be specified.')
        .isAlphanumeric().withMessage('Country has non-alphanumeric characters.'),
    body('studioname').isLength({ min: 1 }).trim().withMessage('Studioname must be specified.'),
    body('year').isLength({ min: 1 }).trim().withMessage('Year must be specified.'),
    body('history'),
 

    // Sanitize fields.
    sanitizeBody('country').escape(),
    sanitizeBody('studioname').escape(),
    sanitizeBody('year').escape(),
    sanitizeBody('history').escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('gamestudio_form', { title: 'Create Gamestudio', gamestudio: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Create an Gamestudio object with escaped and trimmed data.
            var gamestudio = new Gamestudio(
                {
                    country: req.body.country,
                    studioname: req.body.studioname,
                    year: req.body.year,
                    history: req.body.history,
                });
            gamestudio.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new gamestudio record.
                res.redirect(gamestudio.url);
            });
        }
    }
];
