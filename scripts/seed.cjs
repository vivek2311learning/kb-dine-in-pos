const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
// require('dotenv').config()

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('MongoDB Connected')
}

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
})

const User = mongoose.model('User', UserSchema)

async function seed() {
  await connectDB()

  await User.deleteMany({})

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
  process.exit()
}

seed()



// // $env:MONGODB_URI="mongodb+srv://dbuser:dbtest@cluster0.gkqvbyc.mongodb.net/kb_dine-in";

// //  node scripts/seed.cjs
