'use strict';

const { ObjectId } = require('mongodb');

module.exports = function (app, collection) {
  app.route('/api/books')
    .get(async function (req, res) {
      try {
        const books = await collection.find().toArray();
        const response = books.map(book => ({
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length
        }));
        res.json(response);
      } catch (err) {
        res.status(500).send('Error retrieving books');
      }
    })
    .post(async function (req, res) {
      let title = req.body.title;
      if (!title) {
        return res.send('missing required field title');
      }
      try {
        const newBook = { title, comments: [] };
        const result = await collection.insertOne(newBook);
        res.json({ _id: result.insertedId, title });
      } catch (err) {
        res.status(500).send('Error adding book');
      }
    })
    .delete(async function (req, res) {
      try {
        await collection.deleteMany({});
        res.send('complete delete successful');
      } catch (err) {
        res.status(500).send('Error deleting all books');
      }
    });

  app.route('/api/books/:id')
    .get(async function (req, res) {
      let bookid = req.params.id;
      if (!ObjectId.isValid(bookid)) {
        return res.send('no book exists');
      }
      try {
        const book = await collection.findOne({ _id: new ObjectId(bookid) });
        if (!book) {
          return res.send('no book exists');
        }
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch (err) {
        res.send('no book exists');
      }
    })
    .post(async function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;

      // Verificar se o comentário foi fornecido
      if (!comment) {
        return res.send('missing required field comment');
      }

      // Validar se bookid é um ObjectId válido
      if (!ObjectId.isValid(bookid)) {
        return res.send('no book exists');
      }

      try {
        // Verificar se o livro existe
        const book = await collection.findOne({ _id: new ObjectId(bookid) });
        if (!book) {
          return res.send('no book exists');
        }

        // Atualizar o livro com o novo comentário
        await collection.updateOne(
          { _id: new ObjectId(bookid) },
          { $push: { comments: comment } }
        );

        // Buscar o livro atualizado
        const updatedBook = await collection.findOne({ _id: new ObjectId(bookid) });

        // Retornar o objeto do livro atualizado
        res.json({
          _id: updatedBook._id,
          title: updatedBook.title,
          comments: updatedBook.comments
        });
      } catch (err) {
        console.error('Error in POST /api/books/:id:', err);
        res.send('no book exists');
      }
    })
    .delete(async function (req, res) {
      let bookid = req.params.id;
      if (!ObjectId.isValid(bookid)) {
        return res.send('no book exists');
      }
      try {
        const result = await collection.deleteOne({ _id: new ObjectId(bookid) });
        if (result.deletedCount === 0) {
          return res.send('no book exists');
        }
        res.send('delete successful');
      } catch (err) {
        res.send('no book exists');
      }
    });
};