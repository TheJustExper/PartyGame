const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://exper:test@cluster0.tzg1u.mongodb.net/test?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true";
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




