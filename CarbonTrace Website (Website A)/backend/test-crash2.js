const { getModels } = require('./routes/gov');
// wait, getModels is not exported, it is inside gov.js
// let's just require('../models') and see if it throws / crashes the event loop!
console.log("requiring models...");
try {
  require('./models');
  console.log("models required successfully");
} catch (e) {
  console.error("error requiring models:", e);
}
console.log("done");
