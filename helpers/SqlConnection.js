var mysql = require('mysql'); 



var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "shareskill"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

function Connection(){
  return con;
}
module.exports = {
  Connection
}
