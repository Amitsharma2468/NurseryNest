const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();

// CORS setup
app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_APP_FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const plantRoutes = require('./routes/plantRoutes');
const saleRoutes = require('./routes/saleRoutes');



// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/sales', saleRoutes);


// Test email route
app.get('/api/test-email', async (req, res) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: process.env.SMTP_EMAIL,
      subject: 'Test Email',
      text: 'If you receive this email, your email configuration is working.',
      html: '<h1>Test Email</h1><p>If you receive this email, your email configuration is working.</p>',
    });

    console.log('Test email sent:', info.response);
    res.status(200).json({ message: 'Test email sent successfully', info: info.response });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ message: 'Error sending test email', error: error.message });
  }
});


const PORT = process.env.PORT;
const DBURL = process.env.MONGO_URI;

mongoose.connect(DBURL)
    .then(() => {
        console.log('Database connected successfully');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log('Error:', error.message);
    });