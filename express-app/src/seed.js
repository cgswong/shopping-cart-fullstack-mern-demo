import mongoose from 'mongoose';
import { Product } from './models/index.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shopping-cart';

const sampleProducts = [
  {
    name: "MacBook Pro 16\"",
    description: "Apple M3 Max chip, 36GB RAM, 1TB SSD. Perfect for developers and creative professionals.",
    price: 3499.99,
    stock: 15,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"
  },
  {
    name: "Sony WH-1000XM5",
    description: "Industry-leading noise canceling wireless headphones with premium sound quality.",
    price: 399.99,
    stock: 45,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500"
  },
  {
    name: "iPhone 15 Pro",
    description: "Titanium design with A17 Pro chip, 256GB storage, advanced camera system.",
    price: 1199.99,
    stock: 30,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1592286927505-2fd0d113e4e7?w=500"
  },
  {
    name: "Samsung 55\" OLED TV",
    description: "4K Ultra HD Smart TV with stunning picture quality and smart features.",
    price: 1799.99,
    stock: 12,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500"
  },
  {
    name: "Ergonomic Office Chair",
    description: "Premium mesh back chair with lumbar support and adjustable armrests.",
    price: 449.99,
    stock: 25,
    category: "Furniture",
    imageUrl: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500"
  },
  {
    name: "Standing Desk",
    description: "Electric height-adjustable desk, 60x30 inches, with memory presets.",
    price: 599.99,
    stock: 18,
    category: "Furniture",
    imageUrl: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500"
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB backlit gaming keyboard with Cherry MX switches and aluminum frame.",
    price: 159.99,
    stock: 50,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"
  },
  {
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with precision tracking and long battery life.",
    price: 79.99,
    stock: 60,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500"
  },
  {
    name: "4K Webcam",
    description: "Professional webcam with auto-focus, HDR, and built-in microphone.",
    price: 199.99,
    stock: 35,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=500"
  },
  {
    name: "Portable SSD 2TB",
    description: "Ultra-fast external SSD with USB-C, up to 1050MB/s read speeds.",
    price: 249.99,
    stock: 40,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500"
  },
  {
    name: "Smart Watch",
    description: "Fitness tracker with heart rate monitor, GPS, and 7-day battery life.",
    price: 299.99,
    stock: 55,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"
  },
  {
    name: "Desk Lamp LED",
    description: "Adjustable LED desk lamp with touch control and USB charging port.",
    price: 49.99,
    stock: 70,
    category: "Furniture",
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500"
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} products. Skipping seed.`);
      process.exit(0);
    }

    await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${sampleProducts.length} products`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
