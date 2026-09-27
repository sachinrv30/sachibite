const mongoose = require('mongoose');

const shoppingItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 0,
    },

    unit: {
      type: String,
      default: '',
      trim: true,
      maxlength: 30,
    },

    category: {
      type: String,
      default: 'other',
      trim: true,
      lowercase: true,
    },

    purchased: {
      type: Boolean,
      default: false,
    },

    custom: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  }
);

const shoppingListSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    items: {
      type: [shoppingItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ShoppingList', shoppingListSchema);