require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/database');

const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Favorite = require('../models/Favorite');
const MealPlan = require('../models/MealPlan');
const ShoppingList = require('../models/ShoppingList');

const recipes = require('./seedData');

const DEMO_EMAIL = 'demo@recipefinder.app';
const DEMO_PASSWORD = 'Password123';

const run = async () => {
  try {
    await connectDB();

    console.log('Clearing existing recipe data...');

    /*
     * These collections are user-specific or dependent on recipes,
     * so they are cleared before inserting the fresh recipe dataset.
     */
    await Promise.all([
      Recipe.deleteMany({}),
      Favorite.deleteMany({}),
      MealPlan.deleteMany({}),
      ShoppingList.deleteMany({}),
    ]);

    console.log('Seeding recipes...');

    if (!Array.isArray(recipes) || recipes.length === 0) {
      throw new Error('No recipe seed data found.');
    }

    await Recipe.insertMany(recipes);

    console.log(`Inserted ${recipes.length} recipes.`);

    /*
     * Create the demo account only if it does not already exist.
     */
    let demoUser = await User.findOne({
      email: DEMO_EMAIL,
    });

    if (!demoUser) {
      console.log(
        `Creating demo user (${DEMO_EMAIL} / ${DEMO_PASSWORD})...`
      );

      demoUser = await User.create({
        name: 'Demo User',
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        preferences: {
          diet: ['vegetarian'],
          maxPrepTime: 45,
          servingsDefault: 2,
        },
        allergies: ['peanuts'],
        favoriteCuisines: ['italian', 'indian'],
        mealPreferences: [
          'breakfast',
          'lunch',
          'dinner',
        ],
      });
    } else {
      console.log('Demo user already exists. Keeping existing account.');
    }

    console.log('----------------------------------------');
    console.log('Seed completed successfully.');
    console.log(`Recipes: ${recipes.length}`);
    console.log(`Demo account: ${DEMO_EMAIL}`);
    console.log('----------------------------------------');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    /*
     * Always close the MongoDB connection, even when seeding fails.
     */
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
};

run();