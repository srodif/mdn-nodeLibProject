const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');
const { body, validationResult } = require('express-validator');

exports.bookinstance_list = (req, res, next) => {
  BookInstance.find()
    .populate('book')
    .exec( (err, list_bookinstances) => {
      if (err) {
        return next(err);
      }
      res.render('bookinstance_list', {title: 'Book Copy List', bookinstance_list: list_bookinstances});
    });
};

exports.bookinstance_detail = (req, res, next) => {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function(err, bookinstance) {
      if (err) { return next(err); }
      if (bookinstance==null) {
        let err = new Error('Book copy not found');
        err.status = 404;
        return next(err);
      }
      res.render('bookinstance_detail',{ title: 'Copy ' + bookinstance.book.title, bookinstance: bookinstance})
    });
};




exports.bookinstance_create_get = function(req, res, next) {
  Book.find({}, 'title')
  .exec((err,books) => {
    if (err) { return next(err); }
    res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books});
  });
};

exports.bookinstance_create_post = [
  //validate and sanitize inputs
  body('book', 'Book should be specified').trim().isLength({min: 1}).escape(),
  body('imprint', 'Imprint must be specified').trim().isLength({min: 1}).escape(),
  body('copyStatus','Problem at copystatus').escape(),
  body('dueBack', 'Invalid date').optional({checkFalsy: true}).isISO8601().toDate(),

  (req,res,next) => {
    const errors = validationResult(req);
    const bookinstance = new BookInstance(
      {
        book: req.body.book,
        imprint: req.body.imprint,
        copyStatus: req.body.copyStatus,
        dueBack: req.body.dueBack
      }
    )

    if (!errors.isEmpty()) {
      Book.find({}, 'title').
        exec( (err,books) => {
          if (err) { return next(err); }

          res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id, errors: errors.array(), bookinstance: bookinstance})
        });
      return;
      
    } else {
      bookinstance.save((err) => {
        if (err) { return next(err); }

        res.redirect(bookinstance.url);
      });
    }
  }
];




exports.bookinstance_update_get = (req, res) => {
  res.send('ni');
};

exports.bookinstance_update_post = (req, res) => {
  res.send('ni');
};




exports.bookinstance_delete_get = (req, res, next) => {
  async.parallel({
    bookinstance(callback) {
      BookInstance.findById(req.params.id).exec(callback);
    }
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.genre==null) {
      res.redirect('/catalog/bookinstances');
    }
    res.render('bookinstance_delete', {title: 'Delete Book Copy', bookinstance: results.bookinstance});
  });
};

exports.bookinstance_delete_post = (req, res, next) => {
  async.parallel({
    bookinstance(callback) {
      BookInstance.findById(req.body.bookinstanceid).exec(callback);
    }
  }, (err, results) => {
    if (err) { return next(err); }

    BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteGenre(err) {
        if (err) { return next(err); }
        res.redirect('/catalog/bookinstances');
    });
  });
};