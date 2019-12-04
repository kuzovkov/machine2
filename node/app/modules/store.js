const { Pool, Client } = require('pg');
const getenv = require('getenv');

const dbhost = getenv('DB_HOST');
const dbuser = getenv('DB_USER');
const password = getenv('DB_PASS');
const dbname = getenv('DB_NAME');


const client = new Client({
  user: dbuser,
  host: dbhost,
  database: dbname,
  password: password,
  port: 5432
});
 client.connect();

function insertData(data) {
    //console.log(data);
    if (typeof(data.length) === 'number'){
        for (var i = 0; i < data.length; i++){
            insertRow(data[i]);
        }
    }else{
        insertRow(data);
    }

}

function insertRow(data){
    client.query('INSERT INTO courses (symbol, price, time_stamp) VALUES ($1, $2, $3);', [data.symbol, data.value, data.timestamp], function (err, result) {
        if (err) {
            console.log(err);
        }
    });
}

exports.insertData = insertData;

