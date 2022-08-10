const router = require("express").Router();
const MethodsController = require("../controllers/methods")

router.post("/methods", MethodsController.linearSystem);

module.exports = router;