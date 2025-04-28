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
const ReservedOption = mongoose.model('ReservedOption', new mongoose.Schema({
  option: { type: String, required: true, unique: true },
}));

const User = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  option: { type: String, required: true }
}));

// Routes
app.post('/submit', async (req, res) => {
  const { name, phone, option } = req.body;

  if (!name || !phone || !option) {
    return res.status(400).send('الرجاء ملء جميع الحقول.');
  }

  try {
    const existingOption = await ReservedOption.findOne({ option });
    if (existingOption) {
      return res.status(400).send('هذا الاختيار تم حجزه بالفعل.');
    }

    const newOption = new ReservedOption({ option });
    await newOption.save();

    const newUser = new User({ name, phone, option });
    await newUser.save();

    res.status(200).send('تم حجز الاختيار بنجاح.');
  } catch (error) {
    console.error(error);
    res.status(500).send('خطأ في الخادم.');
  }
});

app.get('/reserved-options', async (req, res) => {
  try {
    const reserved = await ReservedOption.find();
    res.json(reserved.map(option => option.option));
  } catch (error) {
    console.error(error);
    res.status(500).send('خطأ في الخادم.');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
