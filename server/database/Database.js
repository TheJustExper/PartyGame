const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://exper:test@cluster0.lorg0.mongodb.net/test";
let mongodb;

function connect(callback){
    MongoClient.connect(uri, (err, database) => {
        mongodb = database.db("partygame");
        callback();
    });
}

function get(){
    return mongodb;
}

function close(){
    mongodb.close();
}

module.exports = {
    connect,
    get,
    close
};




