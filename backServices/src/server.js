const express = require("express");
const cors = require("cors");
require("dotenv").config();

const executeRoute = require("./routes/execute");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/execute", executeRoute);

app.get("/", (req, res) => {

    res.json({
        message: "Backend funcionando"
    });

});

app.listen(PORT, () => {

    console.log(`Servidor iniciado en http://localhost:${PORT}`);

});