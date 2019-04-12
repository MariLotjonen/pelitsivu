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
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('country').escape(),
    sanitizeBody('studioname').escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

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
                    date_of_birth: req.body.date_of_birth,
                    date_of_death: req.body.date_of_death
                });
            gamestudio.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new gamestudio record.
                res.redirect(gamestudio.url);
            });
        }
    }
];

// Display Gamestudio delete form on GET.
exports.gamestudio_delete_get = function(req, res, next) {

    async.parallel({
        gamestudio: function(callback) {
            Gamestudio.findById(req.params.id).exec(callback)
        },
        gamestudios_games: function(callback) {
          game.find({ 'gamestudio': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.gamestudio==null) { // No results.
            res.redirect('/catalog/gamestudios');
        }
        // Successful, so render.
        res.render('gamestudio_delete', { title: 'Delete Gamestudio', gamestudio: results.gamestudio, gamestudio_games: results.gamestudios_games } );
    });

};

// Handle Gamestudio delete on POST.
exports.gamestudio_delete_post = function(req, res, next) {

    async.parallel({
        gamestudio: function(callback) {
          Gamestudio.findById(req.body.gamestudioid).exec(callback)
        },
        gamestudios_games: function(callback) {
          Book.find({ 'gamestudio': req.body.gamestudioid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.gamestudios_games.length > 0) {
            // Gamestudio has games. Render in same way as for GET route.
            res.render('gamestudio_delete', { title: 'Delete Gamestudio', gamestudio: results.gamestudio, gamestudio_games: results.gamestudios_games } );
            return;
        }
        else {
            // Gamestudio has no games. Delete object and redirect to the list of gamestudios.
            Gamestudio.findByIdAndRemove(req.body.gamestudioid, function deleteGamestudio(err) {
                if (err) { return next(err); }
                // Success - go to gamestudio list
                res.redirect('/catalog/gamestudios')
            })
        }
    });
};

// Display Gamestudio update form on GET.
exports.gamestudio_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Gamestudio update GET');
};

// Handle Gamestudio update on POST.
exports.gamestudio_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Gamestudio update POST');
};