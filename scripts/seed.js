// VIT Grocery Seed Script
// Run: node scripts/seed.js

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ Please set MONGODB_URI in .env.local')
  process.exit(1)
}

// Define schemas inline for seed script
const UserSchema = new mongoose.Schema({
  name: String, email: String, password: String, phone: String,
  role: String, address: String, approved: Boolean,
  loginAttempts: { type: Number, default: 0 }, lockUntil: Date, createdAt: { type: Date, default: Date.now },
})
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12)
  next()
})

const VendorSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, shopName: String, shopAddress: String, approved: Boolean, totalSales: { type: Number, default: 0 }, createdAt: { type: Date, default: Date.now } })
const AgentSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, available: Boolean, totalDeliveries: { type: Number, default: 0 }, earnings: { type: Number, default: 0 }, createdAt: { type: Date, default: Date.now } })
const CategorySchema = new mongoose.Schema({ name: String, imageUrl: String, createdAt: { type: Date, default: Date.now } })
const ProductSchema = new mongoose.Schema({ vendorId: mongoose.Schema.Types.ObjectId, categoryId: mongoose.Schema.Types.ObjectId, name: String, description: String, price: Number, stock: Number, imageUrl: String, createdAt: { type: Date, default: Date.now } })

const User = mongoose.models.User || mongoose.model('User', UserSchema)
const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema)
const DeliveryAgent = mongoose.models.DeliveryAgent || mongoose.model('DeliveryAgent', AgentSchema)
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema)
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)

const USERS = [
  { name: 'Admin User', email: 'admin@vitgrocery.com', password: 'Admin@123', role: 'admin', approved: true, phone: '9876543210' },
  { name: 'Fresh Vendor', email: 'vendor@vitgrocery.com', password: 'Vendor@123', role: 'vendor', approved: true, phone: '9876543211' },
  { name: 'Quick Agent', email: 'agent@vitgrocery.com', password: 'Agent@123', role: 'agent', approved: true, phone: '9876543212' },
  { name: 'Happy Customer', email: 'customer@vitgrocery.com', password: 'Customer@123', role: 'customer', approved: true, phone: '9876543213' },
]

const CATEGORIES = [
  { name: 'Fruits', imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&h=300&fit=crop' },
  { name: 'Vegetables', imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=300&fit=crop' },
  { name: 'Dairy', imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=300&fit=crop' },
  { name: 'Bakery', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop' },
  { name: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=300&fit=crop' },
  { name: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=300&h=300&fit=crop' },
  { name: 'Meat', imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=300&h=300&fit=crop' },
]

const PRODUCTS_DATA = {
  Fruits: [
    { name: 'Apples', price: 120, description: 'Fresh red apples, perfect for snacking. Crisp and sweet.', stock: 100, imageUrl: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&h=400&fit=crop&auto=format' },
    { name: 'Bananas', price: 40, description: 'Ripe yellow bananas, rich in potassium and natural energy.', stock: 150, imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400&h=400&fit=crop&auto=format' },
    { name: 'Mangoes', price: 150, description: 'Sweet Alphonso mangoes from Maharashtra. The king of fruits!', stock: 80, imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=400&fit=crop&auto=format' },
    { name: 'Oranges', price: 60, description: 'Juicy Nagpur oranges, packed with Vitamin C.', stock: 120, imageUrl: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=400&h=400&fit=crop&auto=format' },
    { name: 'Grapes', price: 80, description: 'Fresh seedless green grapes, sweet and refreshing.', stock: 90, imageUrl: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&h=400&fit=crop&auto=format' },
    { name: 'Watermelon', price: 60, description: 'Juicy red watermelon, perfect summer fruit. Rich in water and vitamins.', stock: 40, imageUrl: 'https://images.unsplash.com/photo-1587049332298-1c42e83937a7?w=400&h=400&fit=crop&auto=format' },
    { name: 'Strawberries', price: 180, description: 'Fresh ripe strawberries 250g, sweet and aromatic.', stock: 60, imageUrl: 'https://images.unsplash.com/photo-1543528176-61b239494933?w=400&h=400&fit=crop&auto=format' },
    { name: 'Papaya', price: 70, description: 'Ripe papaya rich in digestive enzymes and Vitamin C.', stock: 50, imageUrl: 'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=400&h=400&fit=crop&auto=format' },
    { name: 'Pomegranate', price: 110, description: 'Fresh pomegranate, packed with antioxidants and juicy arils.', stock: 70, imageUrl: 'https://images.unsplash.com/photo-1604495772376-9657b5751852?w=400&h=400&fit=crop&auto=format' },
  ],
  Vegetables: [
    { name: 'Tomatoes', price: 30, description: 'Farm fresh red tomatoes, perfect for cooking and salads.', stock: 200, imageUrl: 'https://images.unsplash.com/photo-1546094096-0df4bcaad337?w=400&h=400&fit=crop&auto=format' },
    { name: 'Onions', price: 25, description: 'Premium quality onions, essential for Indian cooking.', stock: 300, imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop&auto=format' },
    { name: 'Potatoes', price: 35, description: 'Fresh farm potatoes, great for curries and fries.', stock: 250, imageUrl: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=400&h=400&fit=crop&auto=format' },
    { name: 'Spinach', price: 20, description: 'Organic baby spinach leaves, rich in iron and vitamins.', stock: 100, imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop&auto=format' },
    { name: 'Carrots', price: 40, description: 'Crunchy fresh carrots, rich in beta-carotene.', stock: 150, imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop&auto=format' },
    { name: 'Broccoli', price: 55, description: 'Fresh green broccoli florets, high in fibre and vitamins.', stock: 80, imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&h=400&fit=crop&auto=format' },
    { name: 'Cauliflower', price: 45, description: 'White cauliflower head, great for curries and stir-fries.', stock: 90, imageUrl: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400&h=400&fit=crop&auto=format' },
    { name: 'Bell Pepper', price: 60, description: 'Colorful mixed bell peppers, perfect for salads and stir-fries.', stock: 100, imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop&auto=format' },
    { name: 'Cucumber', price: 20, description: 'Fresh cucumber, cooling and hydrating. Great for salads.', stock: 180, imageUrl: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&h=400&fit=crop&auto=format' },
    { name: 'Garlic', price: 30, description: 'Fresh garlic bulbs, aromatic and essential for Indian cuisine.', stock: 200, imageUrl: 'https://images.unsplash.com/photo-1587049369099-06b44a17b9fb?w=400&h=400&fit=crop&auto=format' },
  ],
  Dairy: [
    { name: 'Milk', price: 65, description: 'Fresh full-cream milk 1L. Pure, pasteurized and fresh.', stock: 200, imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop&auto=format' },
    { name: 'Paneer', price: 90, description: 'Fresh cottage cheese 200g, perfect for Indian dishes.', stock: 100, imageUrl: 'https://images.unsplash.com/photo-1631452180539-96aea7d32f6b?w=400&h=400&fit=crop&auto=format' },
    { name: 'Curd', price: 45, description: 'Thick creamy curd 500g, probiotic and refreshing.', stock: 150, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop&auto=format' },
    { name: 'Butter', price: 55, description: 'Amul butter 100g, smooth and delicious.', stock: 120, imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop&auto=format' },
    { name: 'Cheese', price: 120, description: 'Processed cheese slices 200g, great for sandwiches.', stock: 80, imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop&auto=format' },
    { name: 'Ghee', price: 350, description: 'Pure desi cow ghee 500ml, traditional and aromatic.', stock: 60, imageUrl: 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400&h=400&fit=crop&auto=format' },
    { name: 'Buttermilk', price: 30, description: 'Chilled salted buttermilk 500ml, perfect for summer.', stock: 120, imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop&auto=format' },
  ],
  Bakery: [
    { name: 'Bread', price: 45, description: 'Whole wheat sandwich bread, soft and nutritious.', stock: 100, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop&auto=format' },
    { name: 'Croissant', price: 30, description: 'Buttery flaky croissant, freshly baked every morning.', stock: 50, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop&auto=format' },
    { name: 'Cookies', price: 25, description: 'Chocolate chip cookies pack, crispy and delicious.', stock: 150, imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop&auto=format' },
    { name: 'Cake', price: 350, description: 'Freshly baked vanilla sponge cake 500g, soft and moist.', stock: 30, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop&auto=format' },
    { name: 'Muffins', price: 60, description: 'Blueberry muffins pack of 4, moist and fluffy.', stock: 60, imageUrl: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=400&fit=crop&auto=format' },
  ],
  Beverages: [
    { name: 'Orange Juice', price: 99, description: 'Fresh squeezed orange juice 1L, no added sugar.', stock: 80, imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop&auto=format' },
    { name: 'Green Tea', price: 120, description: 'Premium green tea 25 bags, antioxidant rich.', stock: 100, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop&auto=format' },
    { name: 'Coconut Water', price: 30, description: 'Natural tender coconut water 200ml, hydrating.', stock: 200, imageUrl: 'https://images.unsplash.com/photo-1550461716-dbf266b2a8a7?w=400&h=400&fit=crop&auto=format' },
    { name: 'Mango Juice', price: 75, description: 'Thick mango nectar 1L, made from real Alphonso mangoes.', stock: 90, imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop&auto=format' },
    { name: 'Lemon Juice', price: 50, description: 'Fresh squeezed lemon juice 500ml, tangy and refreshing.', stock: 110, imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=400&fit=crop&auto=format' },
  ],
  Snacks: [
    { name: 'Chips', price: 30, description: 'Crispy potato chips masala flavor, packed with crunch.', stock: 200, imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop&auto=format' },
    { name: 'Namkeen', price: 35, description: 'Mixed Indian snack mix, perfect for evening munching.', stock: 150, imageUrl: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=400&h=400&fit=crop&auto=format' },
    { name: 'Peanuts', price: 40, description: 'Roasted salted peanuts 250g, crunchy and protein-rich.', stock: 200, imageUrl: 'https://images.unsplash.com/photo-1567892737950-30c4db37cd89?w=400&h=400&fit=crop&auto=format' },
    { name: 'Dark Chocolate', price: 150, description: '70% dark chocolate bar 100g, rich and indulgent.', stock: 80, imageUrl: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=400&fit=crop&auto=format' },
  ],
  Meat: [
    { name: 'Chicken', price: 220, description: 'Fresh broiler chicken 500g, cleaned and ready to cook.', stock: 60, imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop&auto=format' },
    { name: 'Eggs', price: 80, description: 'Farm fresh eggs dozen, high protein and nutritious.', stock: 200, imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop&auto=format' },
    { name: 'Fish Fillet', price: 280, description: 'Fresh boneless fish fillet 400g, ideal for frying or grilling.', stock: 40, imageUrl: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=400&h=400&fit=crop&auto=format' },
  ],
}

async function seed() {
  console.log('🌱 Starting VIT Grocery seed...')

  try {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false })
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Vendor.deleteMany({}),
      DeliveryAgent.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
    ])
    console.log('🗑️  Cleared existing data')

    // Create users
    const createdUsers = {}
    for (const userData of USERS) {
      const user = new User(userData)
      await user.save()
      createdUsers[userData.role] = user
      console.log(`👤 Created ${userData.role}: ${userData.email}`)
    }

    // Create vendor profile
    const vendor = await Vendor.create({
      userId: createdUsers['vendor']._id,
      shopName: 'VIT Fresh Store',
      shopAddress: 'VIT Campus, Vellore, Tamil Nadu 632014',
      approved: true,
      totalSales: 0,
    })
    console.log('🏪 Created vendor profile')

    // Create agent profile
    await DeliveryAgent.create({
      userId: createdUsers['agent']._id,
      available: true,
      totalDeliveries: 0,
      earnings: 0,
    })
    console.log('🚚 Created agent profile')

    // Create categories
    const categoryMap = {}
    for (const catData of CATEGORIES) {
      const cat = await Category.create(catData)
      categoryMap[cat.name] = cat._id
      console.log(`📂 Created category: ${cat.name}`)
    }

    // Create products
    let productCount = 0
    for (const [categoryName, products] of Object.entries(PRODUCTS_DATA)) {
      const categoryId = categoryMap[categoryName]
      if (!categoryId) continue
      for (const product of products) {
        await Product.create({
          ...product,
          categoryId,
          vendorId: vendor._id,
        })
        productCount++
      }
    }
    console.log(`📦 Created ${productCount} products`)

    console.log('\n✅ Seed completed successfully!')
    console.log('\n🔐 Demo Accounts:')
    console.log('   Admin:    admin@vitgrocery.com    / Admin@123')
    console.log('   Vendor:   vendor@vitgrocery.com   / Vendor@123')
    console.log('   Agent:    agent@vitgrocery.com    / Agent@123')
    console.log('   Customer: customer@vitgrocery.com / Customer@123')
    console.log('\n🚀 Start the app with: npm run dev')

  } catch (error) {
    console.error('❌ Seed failed:', error.message)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\n👋 Disconnected from MongoDB')
    process.exit(0)
  }
}

seed()
