// models/Crossword.js
import mongoose from 'mongoose';

const CrosswordSchema = new mongoose.Schema({
  theme: {
    type: String,
    required: true,
  },
  words: [{
    type: String,
    required: true,
  }],
});

const Post = mongoose.model('Post', CrosswordSchema);

export default Post;
