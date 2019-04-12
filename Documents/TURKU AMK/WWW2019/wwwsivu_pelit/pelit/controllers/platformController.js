var Platform = require('../models/platform');
var Game = require('../models/game');
var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Platforms.
exports.platform_list = function(req, res, next) {

    Platform.find()
      .sort([['name', 'ascending']])
      .exec(function (err, list_platforms) {
        if (err) { return next(err); }
        // Successful, so render.
        res.render('platform_list', { title: 'Game Platform List', list_platforms:  list_platforms});
      });
  
  };
// Display detail page for a specific Platforms
exports.platform_detail = function(req, res, next) {

    async.parallel({
        platform: function(callback) {
            Platform.findById(req.params.id)
              .exec(callback);
        },

        platform_games: function(callback) {
            Game.find({ 'platform': req.params.id })
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.platform==null) { // No results.
            var err = new Error('Platform not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('platform_detail', { title: 'Platform Detail', platform: results.platform, platform_games: results.platform_games } );
    });

};
// Display Platform create form on GET.
exports.platform_create_get = function(req, res, next) {     
    res.render('platform_form', { title: 'Create Platform' });
};

// Handle Platform create on POST.
exports.platform_create_post =  [
   
    // Validate that the name field is not empty.
    body('name', 'Platform name required').isLength({ min: 1 }).trim(),
    
    // Sanitize (escape) the name field.
    sanitizeBody('name').escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
  
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a platform object with escaped and trimmed data.
      var platform = new Platform(
        { name: req.body.name }
      );
  
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render('platform_form', { title: 'Create Platform', platform: platform, errors: errors.array()});
        return;
      }
      else {
        // Data from form is valid.
        // Check if Platform with same name already exists.
        Platform.findOne({ 'name': req.body.name })
          .exec( function(err, found_platform) {
             if (err) { return next(err); }
  
             if (found_platform) {
               // Platform exists, redirect to its detail page.
               res.redirect(found_platform.url);
             }
             else {
  
               platform.save(function (err) {
                 if (err) { return next(err); }
                 // Platform saved. Redirect to platform detail page.
                 res.redirect(platform.url);
               });
  
             }
  
           });
      }
    }
];

// Display Platform delete form on GET.
exports.platform_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Platform delete GET');
};

// Handle Platform delete on POST.
exports.platform_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Platform delete POST');
};

// Display Platform update form on GET.
exports.platform_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Platform update GET');
};

// Handle Platform update on POST.
exports.platform_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Paltform update POST');
};