const sqlite3 = require('sqlite3').verbose();

const DB_LOCATION = 'storage/data.db';

function buildTable(){
    let db = new sqlite3.Database(DB_LOCATION, (err) => {
        if (err) {
            return console.error(err.message);
        }
    });

    let sql = 'CREATE TABLE food_data(id string PRIMARY KEY, food_type string, current_location string, remembered_location string)';
    db.run(sql, (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Successfully created table food_data');
    });
}

buildTable();