#!/usr/bin/env node

var dataIndex1 = {};
var dataIndex2 = {};
var dataIndex3 = {};

dataIndex1['A'] = 1;
dataIndex2['B'] = 2;
dataIndex3['C'] = 3;

var symbol1 = 'A';
var symbol2 = 'B';
var symbol3 = 'C';
var symbol4 = 'D';

var symbolIndex = dataIndex1[symbol1] || dataIndex2[symbol1] || dataIndex3[symbol1];
console.log(symbolIndex);

symbolIndex = dataIndex1[symbol2] || dataIndex2[symbol2] || dataIndex3[symbol2];
console.log(symbolIndex);

symbolIndex = dataIndex1[symbol3] || dataIndex2[symbol3] || dataIndex3[symbol3];
console.log(symbolIndex);

symbolIndex = dataIndex1[symbol4] || dataIndex2[symbol4] || dataIndex3[symbol4];
console.log(symbolIndex);

console.log(dataIndex1['A'] == undefined);
console.log(dataIndex1['M'] == undefined);


var data = {
            '1543': '{"price": 67.0, "code": "USD_RUB", "id": 1543}',
            '1544': '{"price": 75.0, "code": "USD_RUB", "id": 1544}',
            '1556': '{"price": 74.25, "code": "EUR_RUB", "id": 1556}'
        };

delete data['1544'];

console.log(data);

var data2 = {};
console.log(Object.keys(data).length);
console.log(Object.keys(data2).length);

