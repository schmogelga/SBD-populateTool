// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const db = require("./dbConnection");
const Faker = require('@faker-js/faker');

// Create an Express application
const app = express();


function formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getRandomDate(startYear, endYear) {
    const startTimestamp = new Date(startYear, 0, 1).getTime();
    const endTimestamp = new Date(endYear, 11, 31).getTime();

    const randomTimestamp = startTimestamp + Math.random() * (endTimestamp - startTimestamp);
    const randomDate = new Date(randomTimestamp);

    return formatDateToYYYYMMDD(randomDate);
}

async function getPKRange(pk, tabela){
    const minCodResultQuery = `SELECT MIN(${pk}) AS min FROM ${tabela}`;
    const maxCodResultQuery = `SELECT MAX(${pk}) AS max FROM ${tabela}`;

    const [minResult, maxResult] = await Promise.all([
    db.query(minCodResultQuery),
    db.query(maxCodResultQuery),
    ]);

    return { min: minResult.rows[0].min, max: maxResult.rows[0].max }
} 

// Middleware to parse JSON requests
app.use(bodyParser.text());

// POST route
app.post('/api/submit', async (req, res)  => {
  
    const data = await req.body;
    console.log(data)
    const result = await db.query(req.body)

    res.status(200).json({ result });
});

app.post('/populate/professor', async (req, res) =>  {

    let sql = 'insert into professor values '
    const max = 10000

    const { rows } = await db.query('SELECT cod_prof FROM professor ORDER BY cod_prof DESC LIMIT 1');
    const lastId = rows.length > 0 ? rows[0].cod_prof + 1 : 1;


    for( let i = lastId; i <= (lastId + max); i++){

        const fullName = Faker.faker.person.fullName().replace(/'/g, '');
        const streetAddress = Faker.faker.location.streetAddress({ useFullAddress: true }).replace(/'/g, '');
        const phone =  Faker.faker.helpers.replaceSymbolWithNumber('+55 9####-####');

        sql += `(${i}, '${fullName}', '${streetAddress}', '${phone}')`
            if (i < (lastId + max)) {
                sql += ', ';
            }
    } 
    
    console.log(sql)

    await db.query(sql);
    res.status(200).send('Dados populados com sucesso.');

})

app.post('/populate/aluno', async (req, res) =>  {

    let sql = 'insert into aluno values '
    const max = 5

    const { rows } = await db.query('SELECT cod_alu FROM aluno ORDER BY cod_alu DESC LIMIT 1');
    const lastId = rows.length > 0 ? rows[0].cod_alu + 1 : 1;

    const pkRange = await getPKRange('cod_resultado', 'resultado');

    for( let i = lastId; i <= (lastId + max); i++){

        const fullName = Faker.faker.person.fullName().replace(/'/g, '');
        const streetAddress = Faker.faker.location.streetAddress({ useFullAddress: true }).replace(/'/g, '');
        const dataNasc = getRandomDate(2005, 2010);
        const cpf =  Faker.faker.helpers.replaceSymbolWithNumber('###.###.###-##');
        const rg =  Faker.faker.helpers.replaceSymbolWithNumber('#######');
        const cod_resultado = Faker.faker.helpers.rangeToNumber(pkRange)

        sql += `(${i}, '${fullName}', '${streetAddress}', '${dataNasc}', '${cpf}', '${rg}', '${cod_resultado}')`
            if (i < (lastId + max)) {
                sql += ', ';
            }
    } 
    
    console.log(sql)

    await db.query(sql);
    res.status(200).send('Dados populados com sucesso.');
})

app.post('/populate/resultado', async (req, res) =>  {

    let sql = 'insert into resultado values '
    const max = 100000

    const { rows } = await db.query('SELECT cod_resultado FROM resultado ORDER BY cod_resultado DESC LIMIT 1');
    const lastId = rows.length > 0 ? rows[0].cod_resultado + 1 : 1;

    const materiaPKRange = await getPKRange('cod_materia', 'materia');
    const semestrePKRange = await getPKRange('cod_semestre', 'semestre');

    for( let i = lastId; i <= (lastId + max); i++){


        const resutado = Faker.faker.helpers.rangeToNumber({min: 2, max: 10})
        const cod_materia = Faker.faker.helpers.rangeToNumber(materiaPKRange)
        const cod_semestre = Faker.faker.helpers.rangeToNumber(semestrePKRange)
        
        sql += `(${i}, '${resutado}', '${cod_materia}', '${cod_semestre}')`
      
        if (i < (lastId + max)) {
            sql += ', ';
        }
    } 
    
    // console.log(sql)

    await db.query(sql);
    res.status(200).send('Dados populados com sucesso.');
})

app.post('/populate/materia', async (req, res) =>  {

    let sql = 'insert into materia values '
    const max = 100

    const { rows } = await db.query('SELECT cod_materia FROM resultado ORDER BY cod_materia DESC LIMIT 1');
    const lastId = rows.length > 0 ? rows[0].cod_materia + 1 : 1;

    for( let i = lastId; i <= (lastId + max); i++){

        const materia = Faker.faker.lorem.words({min: 1, max: 2});
        
        sql += `(${i}, '${materia}')`
      
        if (i < (lastId + max)) {
            sql += ', ';
        }
    } 
    
    console.log(sql)

    await db.query(sql);
    res.status(200).send('Dados populados com sucesso.');
})

app.post('/populate/semestre', async (req, res) =>  {

    let sql = 'insert into semestre values '
    const max = 20
    let ano = 2013;
    let letra = 'A';

    for( let i = 1; i <= max; i++){

        if(i % 2 != 0){
            ano++;
            letra = 'A';
        } else {
            letra = 'B';
        }

        sql += `(${i}, ${ano}, '${letra}')`
      
        if (i < max) {
            sql += ', ';
        }
    } 
    
    console.log(sql)

    await db.query(sql);
    res.status(200).send('Dados populados com sucesso.');
})

// Start the Express server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
