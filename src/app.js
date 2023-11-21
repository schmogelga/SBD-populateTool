// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const dbConnection = require('./dbConnection');
const Faker = require('@faker-js/faker');
require('dotenv').config();


// Create an Express application
const app = express();

// MongoDB connection string (replace with your actual MongoDB connection string)
const mongoURI = process.env.MONGODB_QUERY_STRING;
const dbName = process.env.MONGODB_DB_NAME;

function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getRandomDate(startYear, endYear) {
  const startTimestamp = new Date(startYear, 0, 1).getTime();
  const endTimestamp = new Date(endYear, 11, 31).getTime();

  const randomTimestamp =
    startTimestamp + Math.random() * (endTimestamp - startTimestamp);
  const randomDate = new Date(randomTimestamp);

  return formatDateToYYYYMMDD(randomDate);
}

async function getPKRange(pk, tabela) {
  const minCodResultQuery = `SELECT MIN(${pk}) AS min FROM ${tabela}`;
  const maxCodResultQuery = `SELECT MAX(${pk}) AS max FROM ${tabela}`;

  const [minResult, maxResult] = await Promise.all([
    db.query(minCodResultQuery),
    db.query(maxCodResultQuery),
  ]);

  return { min: minResult.rows[0].min, max: maxResult.rows[0].max };
}

// Middleware to parse JSON requests
app.use(bodyParser.text());

// Endpoint to query MongoDB
app.get('/query-mongodb', async (req, res) => {
  try {
      // Capture the collectionName from query parameters
      const collectionName = req.query.collectionName;
      if (!collectionName) {
          return res.status(400).json({ error: 'Missing collectionName in query parameters' });
      }

      // Connect to MongoDB
      const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();

      // Specify the database and collection
      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      // Retrieve the entire collection
      const result = await collection.find().toArray();

      // Close the MongoDB connection
      await client.close();

      res.status(200).json({ result });
  } catch (error) {
      console.error('Error querying MongoDB:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// POST route
app.post("/api/submit", async (req, res) => {
  const data = await req.body;
  console.log(data);
  const result = await db.query(req.body);

  res.status(200).json({ result });
});

app.post("/populate/professor", async (req, res) => {
  let sql = "insert into professor values ";
  const max = 10000;

  const { rows } = await db.query(
    "SELECT cod_prof FROM professor ORDER BY cod_prof DESC LIMIT 1"
  );
  const lastId = rows.length > 0 ? rows[0].cod_prof + 1 : 1;

  for (let i = lastId; i <= lastId + max; i++) {
    const fullName = Faker.faker.person.fullName().replace(/'/g, "");
    const streetAddress = Faker.faker.location
      .streetAddress({ useFullAddress: true })
      .replace(/'/g, "");
    const phone = Faker.faker.helpers.replaceSymbolWithNumber("+55 9####-####");

    sql += `(${i}, '${fullName}', '${streetAddress}', '${phone}')`;
    if (i < lastId + max) {
      sql += ", ";
    }
  }

  console.log(sql);

  await db.query(sql);
  res.status(200).send("Dados populados com sucesso.");
});

app.post("/populate/aluno", async (req, res) => {
  let sql = "insert into aluno values ";
  const max = 1000000;

  const { rows } = await db.query(
    "SELECT cod_aluno FROM aluno ORDER BY cod_aluno DESC LIMIT 1"
  );
  const lastId = rows.length > 0 ? rows[0].cod_aluno + 1 : 1;

  const pkRange = await getPKRange("cod_resultado", "resultado");

  for (let i = lastId; i <= lastId + max; i++) {
    const fullName = Faker.faker.person.fullName().replace(/'/g, "");
    const streetAddress = Faker.faker.location
      .streetAddress({ useFullAddress: true })
      .replace(/'/g, "");
    const dataNasc = getRandomDate(2005, 2010);
    const cpf = Faker.faker.helpers.replaceSymbolWithNumber("###.###.###-##");
    const rg = Faker.faker.helpers.replaceSymbolWithNumber("#######");
    const cod_resultado = Faker.faker.helpers.rangeToNumber(pkRange);

    sql += `(${i}, '${fullName}', '${streetAddress}', '${dataNasc}', '${cpf}', '${rg}', '${cod_resultado}')`;
    if (i < lastId + max) {
      sql += ", ";
    }
  }

  console.log(sql);

  await db.query(sql);
  res.status(200).send("Dados populados com sucesso.");
});

app.post("/populate/resultado", async (req, res) => {

    for( let j = 0; j < 20; j++){
      let sql = "insert into resultado values ";
      const max = 1000000;
  
      const { rows } = await db.query(
        "SELECT cod_resultado FROM resultado ORDER BY cod_resultado DESC LIMIT 1"
      );
      const lastId = rows.length > 0 ? rows[0].cod_resultado + 1 : 1;
  
      const materiaPKRange = await getPKRange("cod_materia", "materia");
      const semestrePKRange = await getPKRange("cod_semestre", "semestre");
  
      for (let i = lastId; i <= lastId + max; i++) {
        const resutado = Faker.faker.helpers.rangeToNumber({ min: 2, max: 10 });
        const cod_materia = Faker.faker.helpers.rangeToNumber(materiaPKRange);
        const cod_semestre = Faker.faker.helpers.rangeToNumber(semestrePKRange);
  
        sql += `(${i}, '${resutado}', '${cod_materia}', '${cod_semestre}')`;
  
        if (i < lastId + max) {
          sql += ", ";
        }
      }
  
      console.log(j);
  
      await db.query(sql);
    }

  res.status(200).send("Dados populados com sucesso.");
});

app.post("/populate/materia", async (req, res) => {
  let sql = "insert into materia values ";
  const max = 100;

  const { rows } = await db.query(
    "SELECT cod_materia FROM resultado ORDER BY cod_materia DESC LIMIT 1"
  );
  const lastId = rows.length > 0 ? rows[0].cod_materia + 1 : 1;

  for (let i = lastId; i <= lastId + max; i++) {
    const materia = Faker.faker.lorem.words({ min: 1, max: 2 });

    sql += `(${i}, '${materia}')`;

    if (i < lastId + max) {
      sql += ", ";
    }
  }

  console.log(sql);

  await db.query(sql);
  res.status(200).send("Dados populados com sucesso.");
});

app.post("/populate/semestre", async (req, res) => {
  let sql = "insert into semestre values ";
  const max = 20;
  let ano = 2013;
  let letra = "A";

  for (let i = 1; i <= max; i++) {
    if (i % 2 != 0) {
      ano++;
      letra = "A";
    } else {
      letra = "B";
    }

    sql += `(${i}, ${ano}, '${letra}')`;

    if (i < max) {
      sql += ", ";
    }
  }

  console.log(sql);

  await db.query(sql);
  res.status(200).send("Dados populados com sucesso.");
});

app.post("/populate/turma", async (req, res) => {
  let sql = "insert into turma values ";
  const max = 100000;
  const professorPkRange = await getPKRange("cod_prof", "professor");

  for (let i = 1; i <= max; i++) {
    const description = Faker.faker.lorem.words({ min: 3, max: 4 });
    const course = Faker.faker.lorem.words({ min: 1, max: 2 });
    const initialDate = getRandomDate(2013, 2020);
    const cod_professor = Faker.faker.helpers.rangeToNumber(professorPkRange);

    sql += `(${i}, '${description}', '${course}', '${initialDate}', ${cod_professor})`;

    if (i < max) {
      sql += ", ";
    }
  }

  console.log(sql);

  await db.query(sql);
  res.status(200).send("Dados populados com sucesso.");
});

app.post("/populate/prova", async (req, res) => {
  let sql = "insert into prova values ";
  const max = 200;
  const materiaPkRange = await getPKRange("cod_materia", "materia");
  const turmaPkRange = await getPKRange("cod_turma", "turma");

  for (let i = 1; i <= max; i++) {
    const date = getRandomDate(2013, 2020);
    const subject = Faker.faker.lorem.words({ min: 1, max: 2 });
    const weight = Faker.faker.helpers.rangeToNumber({ min: 1, max: 10 });
    const cod_materia = Faker.faker.helpers.rangeToNumber(materiaPkRange);
    const cod_turma = Faker.faker.helpers.rangeToNumber(turmaPkRange);

    sql += `(${i}, '${date}', '${cod_turma}', '${subject}', '${weight}', ${cod_materia})`;

    if (i < max) {
      sql += ", ";
    }
  }

  console.log(sql);

  await db.query(sql);
  res.status(200).send("Dados populados com sucesso.");
});

app.post("/populate/contrato", async (req, res) => {
  let sql = "insert into contrato values ";
  const semestres = await db.query("SELECT cod_semestre FROM semestre");
  const alunos = await db.query("SELECT cod_aluno FROM aluno");
  let usedTurmas = [-1];
  let count = 1;

  for (let semestre of semestres.rows) {
    const turmas = await db.query(
      "SELECT cod_turma FROM turma WHERE cod_turma NOT IN (" +
        usedTurmas.join(", ") +
        ") ORDER BY RANDOM() LIMIT 5"
    );

    turmas.rows.forEach((turma) => {
      alunos.rows.forEach((aluno) => {
        const value = Faker.faker.finance.amount({
          min: 100,
          max: 3000,
          precision: 2,
        });

        sql += `(${count}, ${aluno.cod_aluno}, ${turma.cod_turma}, ${value}, ${semestre.cod_semestre}), `;

        count++;
      });

      usedTurmas.push(turma.cod_turma);
    });
  }

  sql = sql.slice(0, -2);

  console.log(sql);

  await db.query(sql);
  res.status(200).send("Dados populados com sucesso.");
});

app.post("/populate/nota", async (req, res) => {
  let sql = "insert into nota values ";
  const exams = await db.query("SELECT * FROM prova");

  for (let exam of exams.rows) {
    const students = await db.query(
      "SELECT cod_aluno FROM contrato WHERE cod_turma = " + exam.cod_turma
    );

    students.rows.forEach((student) => {
      const grade = Faker.faker.helpers.rangeToNumber({ min: 0, max: 10 });

      sql += `(${exam.cod_prova}, ${student.cod_aluno}, ${grade}), `;
    });
  }

  sql = sql.slice(0, -2);

  console.log(sql);

  await db.query(sql);
  res.status(200).send("Dados populados com sucesso.");
});

app.post("/populate/aula", async (req, res) => {
  let sql = "insert into aula values ";
  const turmas = await db.query("SELECT * FROM turma");
  const materiaPkRange = await getPKRange("cod_materia", "materia");

  for (let turma of turmas.rows) {
    let usedDates = [];
    for (let i = 0; i < 10; i++) {
      let date = getRandomDate(2013, 2023);
      while (usedDates.includes(date)) {
        date = getRandomDate(2013, 2023);
      }

      const subject = Faker.faker.lorem.words({ min: 1, max: 2 });
      const hours = Faker.faker.helpers.rangeToNumber({ min: 1, max: 4 });
      const cod_materia = Faker.faker.helpers.rangeToNumber(materiaPkRange);

      sql += `(${turma.cod_turma}, '${date}', ${turma.cod_prof}, '${subject}', ${hours}, ${cod_materia}), `;

      usedDates.push(date);
    }
  }

  sql = sql.slice(0, -2);

  console.log(sql);

  await db.query(sql);
  res.status(200).send("Dados populados com sucesso.");
});

app.post("/populate/presenca", async (req, res) => {
  let sql = "insert into presenca values ";
  const aulas = await db.query("SELECT * FROM aula");

  for (let aula of aulas.rows) {
    const alunos = await db.query(
      "SELECT cod_aluno FROM contrato WHERE cod_turma = " + aula.cod_turma
    );

    alunos.rows.forEach((aluno) => {
      sql += `(${aula.cod_turma}, '${formatDateToYYYYMMDD(aula.data_aula)}', ${
        aluno.cod_aluno
      }), `;
    });
  }

  sql = sql.slice(0, -2);

  console.log(sql);

  await db.query(sql);
  res.status(200).send("Dados populados com sucesso.");
});

app.post("/populate/parcela", async (req, res) => {
  let sql = "insert into parcela values ";
  const contratos = await db.query("SELECT * FROM contrato");

  for (let contrato of contratos.rows) {
    const dueDate = getRandomDate(2013, 2023);
    const value = Faker.faker.finance.amount({
      min: 100,
      max: 3000,
      precision: 2,
    });
    const paymentDate = getRandomDate(2013, 2023);
    const paidAmount = Faker.faker.finance.amount({
      min: 100,
      max: 3000,
      precision: 2,
    });

    sql += `(${contrato.cod_contrato}, '${dueDate}', ${value}, '${paymentDate}', ${paidAmount}), `;
  }

  sql = sql.slice(0, -2);

  console.log(sql);

  await db.query(sql);
  res.status(200).send("Dados populados com sucesso.");
});

// Start the Express server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
