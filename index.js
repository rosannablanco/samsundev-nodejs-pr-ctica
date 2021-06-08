const http = require('http');
const MongoClient = require('mongodb').MongoClient;
const queryString = require('querystring');

// url por defecto del servidor local(MongoDB)
const url = 'mongodb://localhost:27017';

// nombre de la base de datos a la que conectarse
const nameDb = 'local';

// instancia cliente de MongoDB
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

const server = http.createServer((req, resp) => {
  const { method } = req;
  let q = {};
  let resultados;
  let body = [];

  if (method == 'POST') {
    req
      .on('error', () => {
        console.error('error');
      })
      .on('data', (chunk) => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
        q = queryString.parse(body);
      });

    client
      .connect()
      .then(async () => {
        const db = client.db(nameDb);
        const collection = db.collection('usuarios');
        collection.insertOne(q);
        resultados = await collection.find({}).toArray();
        console.log(resultados);
      })
      .then(async () => {
        resp.writeHead(200, { 'Content-type': 'text/html' });
        resp.write(
          '<html><head></head><body><ul>' + resultados.map((r) => `<li>${r.name}</li>`) + '</ul></body></html>'
        );
        resp.end();
      })
      .catch((error) => {
        resp.statusCode = 401;
        client.close();
      });
  }
});

server.listen(4000, () => {
  console.log('Estoy escuchando');
});
