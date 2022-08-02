var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/cooluser', (req,res,next) => {
  res.send('A cool user :sunglasses');
});

module.exports = router;
