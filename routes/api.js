/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const Book = require('../models').Book;

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res){
      try {
        const books = await Book.find({});
        if (!books) {
          res.json([]);
          return;
        }
        const formatData = books.map(book => {
          return {
            _id: book._id,
            title: book.title,
            comments: book.comments,
            commentcount: book.comments.length
          };
      });
        res.json(formatData);
        return;
      }
      catch (err) {
        console.log(err);
        res.send('there was an error getting the books');
        return;
      }

      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post( async function (req, res){
      let title = req.body.title;
      if(!title){
        res.send('missing required field title');
        return;
      }
      const newBook = new Book({title, comments: []});
      try {
        const book = await newBook.save();
        res.json({_id: book._id, title: book.title});
      } catch (err) {
        res.send('there was an error saving the book');
      }
    })


    
    .delete(async function(req, res){
      try {
        await Book.deleteMany({});
        res.send('complete delete successful');
      } catch (err) {
        res.send('there was an error deleting all books');
      }
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      let bookid = req.params.id;
      try {
        const book = await Book.findById(bookid);
        if (!book) {
          res.send('no book exists');
          return;
        }
        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });
      } catch (err) {
        res.send('there was an error getting the book');
      }
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(async function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      if (!comment) {
        res.send('missing required field comment');
        return;
      }
      try {
        const book = await Book.findById(bookid);
        if (!book) {
          res.send('no book exists');
          return;
        }
        book.comments.push(comment);
        await book.save();
        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });
      } catch (err) {
        res.send('there was an error adding the comment');
      }
      //json res format same as .get
    })
    
    .delete(async function(req, res){
      let bookid = req.params.id;
      try {
        const book = await Book.findByIdAndDelete(bookid);
        if (!book) {
          res.send('no book exists');
          return;
        }
        res.send('delete successful');
      } catch (err) {
        res.send('there was an error deleting the book');
      }
      //if successful response will be 'delete successful'
    });
  
};