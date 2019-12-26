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

/**
 * insert Data
 * @param data
 */
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

/**
 * insert Row
 * @param data
 */
function insertRow(data){
    var d = new Date(data.timestamp);
    sql = "INSERT INTO symbol (name, scode, price, updated_at) VALUES ($1, $2, $3, $4) ON CONFLICT (scode) DO UPDATE SET name=$1, price=$3, updated_at=$4";
    client.query(sql, [data.symbol, data.symbol, data.value, d], function (err, result) {
        if (err) {
            console.log(err);
        }
    });
}

exports.insertData = insertData;

