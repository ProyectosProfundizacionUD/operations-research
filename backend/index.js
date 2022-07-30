const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.static("public"));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public/index.html"));
});

app.listen(3010, () => {
  console.log(`Server is running on port 3010`);
});