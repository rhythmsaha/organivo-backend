// MongoDB initialization script
// This script runs when the container starts for the first time

// Switch to your database
db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE);

// Create a user for your application with read/write permissions
db.createUser({
    user: "appuser",
    pwd: process.env.MONGO_PASSWORD,
    roles: [
        {
            role: "readWrite",
            db: process.env.MONGO_INITDB_DATABASE
        }
    ]
});

// Create any initial collections or indexes if needed
// Example:
// db.createCollection("users");
// db.users.createIndex({ "email": 1 }, { unique: true });

print("Database initialized successfully");