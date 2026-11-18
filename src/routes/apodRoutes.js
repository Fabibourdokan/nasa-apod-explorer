const express = require('express');
const { getApod, ApodError } = require('../services/nasaService');

const router = express.Router();
const firstApodDate = '1995-06-16';

function isValidDate(date) {
  if (typeof date !== 'string' || date.length !== 10 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    return false;
  }

  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${now.getFullYear()}-${month}-${day}`;
  return date >= firstApodDate && date <= today;
}

router.get('/', async (req, res) => {
  const { date } = req.query;
  if (date !== undefined && !isValidDate(date)) {
    return res.status(400).json({
      error: 'Informe uma data válida no formato AAAA-MM-DD, entre 16/06/1995 e hoje.',
    });
  }

  try {
    const apod = await getApod(date);
    return res.json(apod);
  } catch (error) {
    if (error instanceof ApodError) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Não foi possível consultar o APOD agora.' });
  }
});

module.exports = router;
