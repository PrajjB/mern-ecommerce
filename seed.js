import fs from "fs";
import Product from "./models/product.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected for Seeding"))
  .catch(err => console.log(err));

const products = [
  {
    name: "Wireless Headphones",
    description: "Noise cancelling headphones",
    price: 2999,
    category: "69e663475eaa1bc928e3e7b1",
    shipping: true,
    quantity: 20,
    imagePath: "./seed-images/headphones.jpg",
  },
  {
    name: "Smartphone",
    description: "Latest Android phone",
    price: 15999,
    category: "69e663475eaa1bc928e3e7b1",
    shipping: true,
    quantity: 15,
    imagePath: "./seed-images/phone.jpg",
  },
  {
    name: "Smart Watch",
    description: "Fitness tracking watch",
    price: 4999,
    category: "69e663475eaa1bc928e3e7b1",
    shipping: true,
    quantity: 30,
    imagePath: "./seed-images/watch.jpg",
  },
  {
    name: "Gaming Mouse",
    description: "RGB gaming mouse",
    price: 1299,
    category: "69e663475eaa1bc928e3e7b1",
    shipping: true,
    quantity: 50,
    imagePath: "./seed-images/mouse.jpg",
  },
  {
    name: "Sneakers",
    description: "Comfortable running shoes",
    price: 2499,
    category: "69e663475eaa1bc928e3e7b3",
    shipping: true,
    quantity: 40,
    imagePath: "./seed-images/sneakers.jpg",
  }
];

const seedDB = async () => {
  try {
    await Product.deleteMany();

    const formatted = products.map(p => ({
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      shipping: p.shipping,
      quantity: p.quantity,
      photo: {
        data: fs.readFileSync(p.imagePath),
        contentType: "image/jpeg"
      }
    }));

    await Product.insertMany(formatted);

    console.log("✅ Database seeded successfully");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

seedDB();