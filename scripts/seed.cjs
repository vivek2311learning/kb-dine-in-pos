



// // $env:MONGODB_URI="mongodb+srv://dbuser:dbtest@cluster0.gkqvbyc.mongodb.net/kb_dine-in";

// //  node scripts/seed.cjs
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

/* ================= CONNECT ================= */

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('MongoDB Connected')
}

/* ================= USER MODEL ================= */

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
})

const User = mongoose.model('User', UserSchema)

/* ================= MENU MODEL ================= */

const MenuItemSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: Number,
    category: String,
    status: String,
  },
  { timestamps: true }
)

const MenuItem = mongoose.model('MenuItem', MenuItemSchema)

/* ================= MENU DATA ================= */

const starters = [
  { name: 'Paneer Tikka', price: 220 },
  { name: 'Veg Manchurian', price: 180 },
  { name: 'Spring Roll', price: 160 },
  { name: 'Hara Bhara Kebab', price: 190 },
  { name: 'Chilli Paneer', price: 210 },
  { name: 'Corn Cheese Balls', price: 200 },
  { name: 'Garlic Mushroom', price: 170 },
  { name: 'Veg Crispy', price: 185 },
  { name: 'Paneer Pakoda', price: 175 },
  { name: 'Cheese Garlic Bread', price: 150 },
]

const mains = [
  { name: 'Butter Paneer', price: 260 },
  { name: 'Dal Makhani', price: 220 },
  { name: 'Kadai Paneer', price: 250 },
  { name: 'Veg Kolhapuri', price: 240 },
  { name: 'Shahi Paneer', price: 270 },
  { name: 'Chole Masala', price: 210 },
  { name: 'Mix Veg', price: 200 },
  { name: 'Jeera Rice', price: 140 },
  { name: 'Veg Biryani', price: 230 },
  { name: 'Paneer Biryani', price: 260 },
]

const beverages = [
  { name: 'Coca Cola', price: 40 },
  { name: 'Pepsi', price: 40 },
  { name: 'Lemon Soda', price: 50 },
  { name: 'Cold Coffee', price: 120 },
  { name: 'Masala Chai', price: 30 },
  { name: 'Green Tea', price: 40 },
  { name: 'Mango Shake', price: 110 },
  { name: 'Strawberry Shake', price: 120 },
  { name: 'Sweet Lassi', price: 90 },
  { name: 'Salted Lassi', price: 90 },
]

const desserts = [
  { name: 'Gulab Jamun', price: 80 },
  { name: 'Rasgulla', price: 80 },
  { name: 'Chocolate Brownie', price: 140 },
  { name: 'Ice Cream Vanilla', price: 100 },
  { name: 'Ice Cream Chocolate', price: 100 },
  { name: 'Kulfi', price: 90 },
  { name: 'Rabdi', price: 120 },
  { name: 'Caramel Custard', price: 130 },
  { name: 'Fruit Salad', price: 110 },
  { name: 'Falooda', price: 150 },
]

/* ================= SEED ================= */

async function seed() {
  await connectDB()

  console.log('Clearing old data...')

  await User.deleteMany({})
  await MenuItem.deleteMany({})

  /* ================= USERS ================= */

  const password = await bcrypt.hash('123456', 10)

  await User.insertMany([
    {
      name: 'Admin',
      email: 'admin@test.com',
      password,
      role: 'admin',
      isActive: true,
    },
    {
      name: 'Counter',
      email: 'counter@test.com',
      password,
      role: 'counter',
      isActive: true,
    },
    {
      name: 'Kitchen',
      email: 'kitchen@test.com',
      password,
      role: 'kitchen',
      isActive: true,
    },
  ])

  console.log('Users seeded')

  /* ================= MENU ITEMS ================= */

  const menuItems = []

  starters.forEach((i) =>
    menuItems.push({
      name: i.name,
      description: 'Delicious starter item',
      price: i.price,
      category: 'Starters',
      status: 'active',
    })
  )

  mains.forEach((i) =>
    menuItems.push({
      name: i.name,
      description: 'Main course dish',
      price: i.price,
      category: 'Main Course',
      status: 'active',
    })
  )

  beverages.forEach((i) =>
    menuItems.push({
      name: i.name,
      description: 'Refreshing beverage',
      price: i.price,
      category: 'Beverages',
      status: 'active',
    })
  )

  desserts.forEach((i) =>
    menuItems.push({
      name: i.name,
      description: 'Sweet dessert',
      price: i.price,
      category: 'Desserts',
      status: 'active',
    })
  )

  await MenuItem.insertMany(menuItems)

  console.log(`Menu seeded (${menuItems.length} items)`)

  process.exit()
}

seed()