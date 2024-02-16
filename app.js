const sqlite3 = require('sqlite3').verbose();
const express  = require('express');

const { randomUUID } = require('crypto');

const app = express ();
app.use(express.json());

const DB_LOCATION = 'storage/data.db';
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});

/**
 * ----------------
 * GET Functions
 * ----------------
 */

app.get("/status", (request, response) => {
    const status = {
        "Status": "Running"
    };

    response.send(status);
});

app.get("/all", (request, response) => {
    //connect to the database 
    let db = new sqlite3.Database(DB_LOCATION, (err) => {
        if (err) {
            return console.error(err.message);
        }
    });

    //read the data from the sqlite db
    fetchAllEntries(db, (resultsArray) => {
        response.status(200).json({
            status: true,
            data: resultsArray,
        });
        
        return response;
    } );

});

app.get("/entry", (request, response) => {   
    id = request.query.id;

    if(!checkID(id)){
        return response.status(200).json({
            status: false,
            data: "Invalid ID"
        });
    }

    //connect to the database 
    let db = new sqlite3.Database(DB_LOCATION, (err) => {
        if (err) {
            return console.error(err.message);
        }
    });

    //read the data from the sqlite db
    fetchEntry(id, db, (resultArray) => {
        response.status(200).json({
            status: true,
            data: resultArray,
        });
        return response;              
    } );

});

/**
 * ----------------
 * POST Functions
 * ----------------
 */

app.post("/add", (request, response) => {
    params = request.query;    
    id = randomUUID();

    //connect to the database 
    let db = new sqlite3.Database(DB_LOCATION, (err) => {
        if (err) {
            return console.error(err.message);
        }
    });

    //write the data to the database
    writeEntry(id, request.query.food_type, request.query.current_location, request.query.remembered_location, db, (err) => {
        if (err) {
            return response.status(400).json({
                status: false,
                error: err,
            });
        } else {
            return response.status(200).json({
                status: true,
                data: id,
            });
        }                
    });
});

/**
 * ----------------
 * DELETE Functions
 * ----------------
 */

app.delete("/entry", (request, response) => {
    params = request.query;    

    //connect to the database 
    let db = new sqlite3.Database(DB_LOCATION, (err) => {
        if (err) {
            return console.error(err.message);
        }
    });

    //write the data to the database
    deleteEntry(params.id, db, (err) => {
        if (err) {
            return response.status(400).json({
                status: false,
                error: err,
            });
        } else {
            return response.status(200).json({
                status: true,
                data: params.id,
            });
        }                
    });
});

/**
 * ----------------
 * PUT Functions
 * ----------------
 */

app.put("/entry", (request, response) => {
    //connect to the database 
    let db = new sqlite3.Database(DB_LOCATION, (err) => {
        if (err) {
            return console.error(err.message);
        }
    });

    //write the data to the database
    updateEntry(request.query.id, request.query.food_type, request.query.current_location, request.query.remembered_location, db, (err) => {
        if (err) {
            return response.status(400).json({
                status: false,
                error: err,
            });
        } else {
            return response.status(200).json({
                status: true,
                data: request.query.id,
            });
        }                
    });
});

/**
 * ----------------
 * Helper Functions
 * ----------------
 */

function writeEntry(id, foodType, currentLocation, rememberedLocation, db, callback){
    db.run('INSERT INTO food_data VALUES (?, ?, ?, ?)', 
    [id, foodType, currentLocation, rememberedLocation], (err) => {
        if (err) {
            throw err;
        } 
        callback();
    });
}

function fetchEntry(id, db, callback){
    db.get('SELECT * FROM food_data WHERE id = ?', [id], (err, row) => {
        if (err) {
            throw err;
        } else {
            if(row){
                callback(row)
            } else {
                callback([])
            }            
        }
    });    
}

function fetchAllEntries(db, callback){
    db.all('SELECT * FROM food_data', [], (err, rows) => {
    if (err) {
        throw err;
    } else {
        var resultsArray = [];
        rows.forEach((row) => {
            resultsArray.push(row);
        });
        callback(resultsArray);
    }
    });        
}

function deleteEntry(id, db, callback){
    db.run('DELETE FROM food_data WHERE id = ?', [id], (err) => {
        if (err) {
            throw err;
        } 
        callback();
    });
}

function updateEntry(id, foodType, currentLocation, rememberedLocation, db, callback){
    db.run('UPDATE food_data SET food_type = ?, current_location = ?, remembered_location = ? WHERE id = ?',
        [foodType, currentLocation, rememberedLocation, id], (err) => {
        if (err) {
            throw err;
        } 
        callback();
    });
}

function buildTable(db){
    let sql = 'CREATE TABLE food_data(id integer PRIMARY KEY, food_type string, current_location string, remembered_location string)';
    db.run(sql, (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Successfully created table food_data');
    });
}

function checkID(id){
    return true;
}