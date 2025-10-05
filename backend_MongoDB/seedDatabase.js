// Seed Database Script - Populate MongoDB with Product Data
// Run this script to load products from products.json into MongoDB

const mongoose = require("mongoose");
const Products = require("./Models/standup");
const productsData = require("./products.json");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/ProductsAPI", {
    useNewUrlParser: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error:"));

db.once("open", async function() {
    console.log("✅ Connected to MongoDB");
    
    try {
        // Clear existing products (optional - comment out if you want to keep existing data)
        console.log("\n🗑️  Clearing existing products...");
        await Products.deleteMany({});
        console.log("✅ Existing products cleared");
        
        // Insert new products
        console.log("\n📦 Inserting products from products.json...");
        const result = await Products.insertMany(productsData);
        console.log(`✅ Successfully inserted ${result.length} products!`);
        
        // Display summary by category
        console.log("\n📊 Products by Category:");
        const categories = [
            "mobiles",
            "laptops", 
            "televisions",
            "microwave",
            "audio",
            "refrigerators",
            "washing machines",
            "air conditioners"
        ];
        
        for (const category of categories) {
            const count = await Products.countDocuments({ category: category });
            console.log(`   ${category}: ${count} products`);
        }
        
        console.log("\n✨ Database seeding completed successfully!");
        
    } catch (error) {
        console.error("❌ Error seeding database:", error);
    } finally {
        // Close connection
        mongoose.connection.close();
        console.log("\n🔌 Database connection closed");
    }
});
