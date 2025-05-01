
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const dbURI = "mongodb+srv://mpcodie:q62ibwJO7GTBIo5a@projects-selection.xks1cnr.mongodb.net/";

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((err) => console.error('❌ MongoDB connection error:', err.message));

// Models
const User = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  option: { type: String, required: true }
}));

// Routes
app.post('/submit', async (req, res) => {
  const { name, phone, option } = req.body;

  if (!name || !phone || !option) {
    return res.status(400).send('الرجاء ملء جميع الحقول.');
  }

  try {
    // 1. Check if user already submitted
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).send('لا يمكنك الحجز أكثر من مرة.');
    }

    // 2. Check if option has already been reserved by 2 users
    const optionCount = await User.countDocuments({ option });
    if (optionCount >= 2) {
      return res.status(400).send('تم حجز هذا الاختيار من قبل مستخدمين بالفعل.');
    }

    // 3. Save new user
    const newUser = new User({ name, phone, option });
    await newUser.save();

    res.status(200).send('تم حجز الاختيار بنجاح.');
  } catch (error) {
    console.error(error);
    res.status(500).send('حدث خطأ في الخادم.');
  }
});

app.get('/reserved-options', async (req, res) => {
  try {
    const reserved = await User.find();
    res.json(reserved.map(entry => entry.option));
  } catch (error) {
    console.error(error);
    res.status(500).send('خطأ في الخادم.');
  }
});

// Optional: Get stats per option
app.get('/option-stats', async (req, res) => {
  try {
    const stats = await User.aggregate([
      { $group: { _id: "$option", count: { $sum: 1 } } }
    ]);
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).send('خطأ في الخادم.');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
