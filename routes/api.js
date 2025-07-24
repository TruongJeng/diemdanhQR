const express = require('express');
const router = express.Router();
const { getStatusList } = require('../services/sheetService');

router.get('/status-list', async (req, res) => {
  try {
    const data = await getStatusList();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;