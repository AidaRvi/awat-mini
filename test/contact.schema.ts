import mongoose, { Schema } from 'mongoose';

const Contact = new Schema({
  _id: { type: String },
  name: { type: String },
  phoneNumber: { type: Number, match: /[a-z]/ },
});

export const contactModel = mongoose.model('contacts', Contact);
