const { Sequelize } = require("sequelize");

// Replace below with your Supabase Database Connection String
// Or ideally, set it in your .env file as DATABASE_URL
const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:5WuVZVVjHRYY3DhO@db.vlpetwdfqqopmqaankvz.supabase.co:5432/postgres";
console.log('Attempting to connect to database with URL:', dbUrl.replace(/:[^:@]+@/, ':****@')); // Hide password
const sequelize = new Sequelize(dbUrl);

sequelize.authenticate()
  .then(() => {
    console.log("Database connected successfully!");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

module.exports = sequelize;
