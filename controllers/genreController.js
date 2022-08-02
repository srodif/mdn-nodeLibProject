const mongoose = require('mongoose')
const Genre = require('../models/genre');
const Book = require('../models/book');
const async = require('async');
const { body, validationResult} = require('express-validator');
/* above line shortcut for below:
const validator = require('express-validator');
const body = validator.body;
const validationResult = validator.validationResult;
*/


// Display list of all Genre.
exports.genre_list = function(req, res, next) {
  Genre.find()
    .sort([['name', 'ascending']])
    .exec( (err, list_genres) => {
      if (err) {
        return next(err);
      }
      res.render('genre_list', {title: 'Genre List', genre_list: list_genres});
    });
};



// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next) {
  //let id = mongoose.types.ObjectId(req.params.id);
  async.parallel({
    genre(callback) {
      Genre.findById(req.params.id).exec(callback);
    },
    genre_books(callback) {
      Book.find({'genre': req.params.id}).exec(callback);
    }
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.genre == null) {
      let err = new Error('Genre not found')
      err.status = 404;
      return next(err);
    }
    res.render('genre_detail', {title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books});
  }
);
};



// Display Genre create form on GET.
exports.genre_create_get = function(req, res, next) {
    res.render('genre_form', {title: "Create Genre"});
};
// Handle Genre create on POST.
exports.genre_create_post = [
  //validate and sanitize  
  body("name", "Genre name required")
      .trim()
      .isLength({min: 1})
      .escape(),

  //process req (validated and sanitized)
  (req, res, next) => {
    const errors = validationResult(req);
    const genre = new Genre({name: req.body.name})

    if (!errors.isEmpty()){
      //this means errors where found. We need to render the form again with sanitized values and error messages.
      res.render('genre_form', {
        title: "Create Genre",
        genre,
        errors: errors.array()
      });
      return;
    } else {
      //valid data
      //still check if the genre already exists
      Genre.findOne({name: req.body.name})
      .exec((err, found_genre) => {
        if (err) {
          return next(err);
        }

        if (found_genre) {
          //the genre exists, so we redirect to it
          res.redirect(found_genre.url);
        } else {
          genre.save((err) => {
            if (err) {
              return next(err);
            }
            //by now the new genre is saved, we redirect to it
            res.redirect(genre.url);
          }); 
        }
      }
    );}
  }
];



// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete GET');
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete POST');
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};