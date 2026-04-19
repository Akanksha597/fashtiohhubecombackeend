const Query = require('../Models/queriesModel');
const User = require('../Models/userModel');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const queryController = {

  async createQuery(req, res) {
    try {
      const { dbCart, title, description, issue_msg, resolve_status } = req.body;

      if (!Array.isArray(dbCart) || dbCart.length === 0) {
        return res.status(400).json({ message: 'dbCart must be a non-empty array' });
      }

      if (!title || !description || !issue_msg) {
        return res.status(400).json({ message: 'Title, description, and issue message are required' });
      }

      for (const item of dbCart) {
        if (!item.user_id || !item.name || !item.email) {
          return res.status(400).json({ message: 'Each dbCart item must include user_id, name, and email' });
        }
      }

      const query = await Query.create({
        dbCart,
        title,
        description,
        issue_msg,
        resolve_status: resolve_status || 'Pending',
      });

      res.status(201).json({ message: 'Query created successfully', query });
    } catch (error) {
      console.error('Error creating query:', error);
      res.status(500).json({ message: 'Error creating query', error: error.message });
    }
  },


  async getAllQueries(req, res) {
    try {
      const queries = await Query.find();

      if (!queries.length) {
        return res.status(404).json({ message: 'No queries found' });
      }

      res.status(200).json({ message: 'Queries retrieved successfully', queries });
    } catch (error) {
      console.error('Error retrieving queries:', error);
      res.status(500).json({ message: 'Error retrieving queries', error: error.message });
    }
  },


  async getQueryById(req, res) {
    try {
      const { queryId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(queryId)) {
        return res.status(400).json({ message: 'Invalid Query ID' });
      }

      const query = await Query.findById(queryId);

      if (!query) {
        return res.status(404).json({ message: 'Query not found' });
      }

      res.status(200).json({ message: 'Query retrieved successfully', query });
    } catch (error) {
      console.error('Error retrieving query by ID:', error);
      res.status(500).json({ message: 'Error retrieving query', error: error.message });
    }
  },


  async deleteQuery(req, res) {
    try {
      const queryId = req.params.queryId;

      if (!mongoose.Types.ObjectId.isValid(queryId)) {
        return res.status(400).json({ message: 'Invalid Query ID' });
      }

      const query = await Query.findByIdAndDelete(queryId);

      if (!query) {
        return res.status(404).json({ message: 'Query not found' });
      }

      res.status(200).json({ message: 'Query deleted successfully' });
    } catch (error) {
      console.error('Error deleting query:', error);
      res.status(500).json({ message: 'Error deleting query', error: error.message });
    }
  },


  async markAsRead(req, res) {
    try {
      const queryId = req.params.queryId;

      if (!mongoose.Types.ObjectId.isValid(queryId)) {
        return res.status(400).json({ message: 'Invalid Query ID' });
      }

      const query = await Query.findById(queryId);
      if (!query) {
        return res.status(404).json({ message: 'Query not found' });
      }

      if (query.resolve_status === 'Read') {
        return res.status(200).json({ message: 'Query is already marked as read', query });
      }

      query.resolve_status = 'Read';
      await query.save();

      res.status(200).json({ message: 'Query marked as read successfully', query });
    } catch (error) {
      console.error('Error marking query as read:', error);
      res.status(500).json({ message: 'Error marking query as read', error: error.message });
    }
  },


  async replyToMail(req, res) {
    try {
      const { queryId, replyMessage } = req.body;

      if (!queryId || !replyMessage) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const query = await Query.findById(queryId);
      if (!query || !query.dbCart || !query.dbCart.length) {
        return res.status(404).json({ message: 'Query or dbCart not found' });
      }

      for (const item of query.dbCart) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: item.email,
          subject: 'Response to Your Query',
          text: replyMessage,
        };

        await transporter.sendMail(mailOptions);
      }

      res.status(200).json({ message: 'Reply sent successfully' });
    } catch (error) {
      console.error('Error replying to query:', error);
      res.status(500).json({ message: 'Error replying to query', error: error.message });
    }
  },


  async resolveQuery(req, res) {
    try {
      const { queryId, resolvedBy, afterResolutionMsg } = req.body;

      if (!queryId || !resolvedBy) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const query = await Query.findById(queryId);
      if (!query) {
        return res.status(404).json({ message: 'Query not found' });
      }

      query.resolve_status = 'Resolved';
      query.resolve_by = resolvedBy;
      query.after_resolution_msg = afterResolutionMsg || 'Issue resolved successfully';

      await query.save();

      res.status(200).json({ message: 'Query resolved successfully', query });
    } catch (error) {
      console.error('Error resolving query:', error);
      res.status(500).json({ message: 'Error resolving query', error: error.message });
    }
  },
};

module.exports = queryController;
