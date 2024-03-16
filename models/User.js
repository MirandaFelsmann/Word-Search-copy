import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const { Schema } = mongoose;


const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  accountName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'user',
  },
  crosswords: [{
    crosswordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crossword'
    },
    theme: String,
    grid: [[String]],
    words: [String], // Add words array
    wordsFound: [String],
    solved: {
        type: Boolean,
        default: false,
    }
  }]
});

UserSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.methods.comparePassword = function (password, callback) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

// Check if the model exists before compiling it
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;