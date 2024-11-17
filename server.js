import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Monthly rate limiter: 50 requests per 30 days
const monthlyLimiter = rateLimit({
    windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    max: 50, // limit each IP to 50 requests per 30 days
    message: 'You have reached your monthly limit of 50 requests. Please wait until next month.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // Minute rate limiter: 10 requests per minute
  const minuteLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute in milliseconds
    max: 10, // limit each IP to 10 requests per minute
    message: 'Too many requests from this IP, please try again after a minute.',
    standardHeaders: true,
    legacyHeaders: false,
  });

// Route to get summary from RapidAPI
app.get('/api/get-summary', async (req, res) => {
  const { articleUrl } = req.query;

  if (!articleUrl) {
    return res.status(400).json({ error: 'Article URL is required' });
  }

  try {
    const response = await fetch(`https://article-extractor-and-summarizer.p.rapidapi.com/summarize?url=${encodeURIComponent(articleUrl)}&length=3`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPID_API_KEY,
        'X-RapidAPI-Host': 'article-extractor-and-summarizer.p.rapidapi.com',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Error fetching summary' });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
