import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "world",
  password: process.env.PGPASSWORD || "qwerty123" ,// put in .env, do NOT hardcode
  port: Number(process.env.PGPORT) || 5432,
});

await db.connect();

let countryCodes = [];

async function addNewCountry(countryCode) {
    await db.query("INSERT INTO visited_country (country_code) VALUES ($1)", [countryCode]);
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  const result = await db.query("SELECT country_code FROM visited_country");
  const countryCodes = result.rows.map(r => r.country_code);
  res.render("index.ejs", { countries: countryCodes, total: countryCodes.length-1 });
});


// placeholder until you implement it properly
app.post("/add",  async(req, res) => {
  const newCountry = req.body.country;
  const result = await db.query("SELECT country_code FROM visited_country WHERE country_code = $1", [newCountry]);
  if (newCountry && !result.rows.length) {

    await addNewCountry(newCountry);
    // Note: In a real app, you should also insert into the database here
    console.log(`Added new country code: ${newCountry}`);
  }
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
