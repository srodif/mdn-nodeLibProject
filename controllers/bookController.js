const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');
const async = require('async');
const { body, validationResult} = require('express-validator');

exports.index = function(req, res, next) {
  async.parallel({
    book_count(callback) {
      Book.countDocuments({}, callback); //empty object as match condition to return all documents
    },
    book_instance_count(callback) {
      BookInstance.countDocuments({}, callback);
    },
    book_instance_available_count(callback) {
      BookInstance.countDocuments({status:'Available'}, callback);
    },
    author_count(callback) {
      Author.countDocuments({}, callback);
    },
    genre_count(callback) {
      Genre.countDocuments({}, callback);
    }
  }, function(err, results) {
    res.render('index', {title: 'Local Library Home', error: err, data: results});
  }
  );
};

// Display list of all books.
exports.book_list = function(req, res, next) {

  Book.find({}, 'title author')
    .sort({title: 1})
    .populate('author')
    .exec( function(err, list_books) {
      if (err) {
        return next(err);
      }
      res.render('book_list', { title: 'Book list', book_list: list_books});
    });
  
  
  //res.send('NOT IMPLEMENTED: Book list');
};

// Display detail page for a specific book.
exports.book_detail = function(req, res, next) {

  async.parallel({
    book(callback) {
      
      Book.findById(req.params.id)
        .populate('author')
        .populate('genre')
        .exec(callback);
    },
    book_instance(callback) {

      BookInstance.find({ 'book': req.params.id}).exec(callback);
    }
  }, function(err, results) {
    if (err) {return next(err);}
    if (results.book==null) { //when no results show up
      let err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    res.render('book_detail', { title: results.book.title, book: results.book, book_instances: results.book_instance});
  }
  );
};




// Display book create form on GET.
exports.book_create_get = function(req, res, next) {
    async.parallel({
      authors(callback) {
        Author.find(callback);
      },
      genres(callback) {
        Genre.find(callback);
      },
    }, function(err, results) {
      if (err) { return next(err); }
      res.render('book_form', {title: "Create Book", authors: results.authors, genres: results.genres });
    });
};

// Handle book create on POST.
exports.book_create_post = [
  
  (req,res,next) => {
    if(!(Array.isArray(req.body.genre))) {
      if (typeof req.body.genre === 'undefined') {
        req.body.genre = [];
      } else {
        req.body.genre = [req.body.genre];
      }
    }
    next();
  },

  //field validation and sanitization
  body('title', 'Title should not be empty.').trim().isLength({ min: 1}).escape(),
  body('author', 'Author should not be empty').trim().isLength({min: 1}).escape(),
  body('summary', 'Summary should not be empty').trim().isLength({min: 1}).escape(),
  body('isbn', 'ISBN should not be empty').trim().isLength({min: 1}).escape(),
  body('genre.*').escape(),

  //process validated and sanitized req
  (req,res,next) => {
    const errors = validationResult(req);
    let book = new Book(
      {
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: req.body.genre
      }
    );

    if (!errors.isEmpty()) {
      async.parallel({
        authors(callback) {
          Author.find(callback);
        },
        genres(callback) {
          Genre.find(callback);
        }
      }, (err, results) => {
        if (err) { return next(err); }

        for (let i=0; i<results.genres.length; i++) {
          if (book.genre.indexOf(results.genres[i]._id) > -1) {
            results.genres[i].checked = 'true';
          }
        }
        res.render('book_form', {title: "Create book", authors: results.authors, genres: results.genres, book: book, errors: errors.array()});
      });
      return;
    } else {
      book.save((err) => {
        if (err) { return next(err); }
        res.redirect(book.url);
      })
    }
  }
];




// Display book delete form on GET.
exports.book_delete_get = function(req, res, next) {
    async.parallel({
    book(callback) {
      Book.findById(req.params.id).exec(callback);
    },
    books_copies(callback) {
      BookInstance.find({ 'book': req.params.id }).exec(callback);
    }
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.book==null) {
      res.redirect('/catalog/books');
    }
    res.render('book_delete', {title: 'Delete Book', book: results.book, book_copies: results.books_copies});
  });
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res, next) {
    async.parallel({
    book(callback) {
      Book.findById(req.body.bookid).exec(callback);
    },
    books_copies(callback) {
      BookInstance.find({'book':req.body.bookid}).exec(callback);
    }
  }, (err, results) => {
    if (err) { return next(err); }

    if (results.books_copies.length > 0) {
      //Book has copies. We will not delete the record if that is the case, in this implementation
      res.render('book_delete', {title: 'Delete Book', book: results.book, book_copies: results.books_copies});
      return;
    } else {
      //If book does not have copies, delete
      Book.findByIdAndRemove(req.body.bookid, function deleteBook(err) {
        if (err) { return next(err); }
        res.redirect('/catalog/books');
      });
    }
  });
};




// Display book update form on GET.
exports.book_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update POST');
};
