const express = require('express');           //to get get post method request 
const mysql = require('mysql');               //to connect to database
const session = require('express-session');    //for session handling
const bodyParser = require('body-parser');     //to get the body of html request
const path = require('path');                     //to work with paths

const app = express();
app.listen(process.env.PORT || "8000");
app.use(express.json());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: true }));

let m = [];                       //store messages
let classes = {};                //hold the list of classes
let testStack = [];              //hold the value of current test
app.use(session({
   secret: "thisismysecrctekey",
   saveUninitialized: true,
   resave: false
}));

let connection = mysql.createConnection({
   host: 'localhost',
   user: 'root',
   password: 'root',
   database: 'pagina'
});
connection.connect(function (err) {
   if (err) {
      return console.error('error: ' + err.message);
   }
   console.log('Connected to the MySQL server.');
});


app.get('/', function (req, res) {
   if (req.session.userid) {
      res.redirect("/home");
   } else {
      res.render("login");
   }
});


app.post('/login', function (req, res) {
   try {
      let username = req.body.uname;
      let password = req.body.upass;
      let sql = `SELECT username FROM accounts WHERE username = ? AND password = ? AND is_logged_in = false`;

      connection.query(sql, [username, password], (error, results) => {
         if (error) {
            return console.error(error.message);
         }
         try {
            setUser(results[0].username);
         } catch (e) {
            checkStatus(username);
         }
      });
   } catch (err) {
      res.redirect('/');
   }


   function setUser(value) {
      if (value && value.length > 0) {
         req.session.userid = value;
         console.log("User Connected: " + req.session.userid);
         setActive();
      } else {
         res.redirect('/');
      }
   }

   function setActive() {
      let sql = `UPDATE accounts SET is_logged_in = true WHERE username = ?;`;

      connection.query(sql, [req.session.userid], (error) => {
         if (error) {
            return console.error(error.message);
         }
         if (req.session.userid) {
            res.redirect('/home');
         }
      })
   }

   function checkStatus(username){
      let sql = `SELECT * FROM accounts WHERE username = ?;`;

      connection.query(sql, [username], (error, results) => {
         if (error) {
            return console.error(error.message);
         }
         if(!results[0]){
            res.render('login', { message: "Invalid Credentials" });
         } else if(results[0] && !(results[0].is_logged_in)){
            res.render('login', { message: "Incorrect username or password" });
         } else if (results[0].is_logged_in){
            res.render('login', { message: "The user is already logged in" });
         } 
      })
   }

});

app.get("/logout", (req, res) => {
   let sql = `UPDATE accounts SET is_logged_in = false WHERE username = ?;`;
   connection.query(sql, [req.session.userid], (error) => {
      if (error) {
         return console.error(error.message);
      }
      destorySession();
   })

   function destorySession(){
      req.session.destroy();
   res.redirect("/");
   }
   
})

app.get('/home', function (req, res) {
   if (req.session.userid) {
      let sql = "SELECT * from classes";
      connection.query(sql, (error, results) => {
         if (error) {
            return console.error(error.message);
         }

         for (var i = 0; i < results.length; i++) {
            classes[results[i].class_code] = results[i].class_description;
         }
         getStudentName();

      });
   } else {
      res.redirect("/");
   }

   function getStudentName() {
      let sql = "SELECT * from students WHERE student_id = ?";
      connection.query(sql, [req.session.userid], (error, results) => {
         if (error) {
            return console.error(error.message);
         }
         res.render("home", { classes: classes, username: results[0].first_name, message: m });
         m = [];
      })
   }
})


app.post("/test/:code", function (req, res) {
   if (req.session.userid) {
      var classCode = req.params.code;
      req.session.classCode = classCode;
      testStack.push(classes[classCode].toString());
      let sql = "SELECT * FROM tests where class_code=?";
      connection.query(sql, [classCode], (error, results) => {
         if (error) {
            return console.error(error.message);
         }
         getStudentName(results);
      })
   } else {
      res.redirect("/");
   }

   function getStudentName(r) {
      let sql = "SELECT * from students WHERE student_id = ?";
      connection.query(sql, [req.session.userid], (error, results) => {
         if (error) {
            return console.error(error.message);
         }
         res.render("test", { username: results[0].first_name, code: classCode, subject: classes[classCode].toString(), tests: r, message:m});
         m=[];
      })
   }
})

app.post("/quiz/:testId", (req, res) => {
   if (req.session.userid) {
      req.session.testId = req.params.testId;
      let sql = "SELECT * FROM responses WHERE test_id = ? and student_id = ?"
      connection.query(sql, [req.session.testId, req.session.userid], (error, results) => {
         if (error) { return console.error(error.message); }
         if (results < 1) {
            checkSchedule();
         } else {
            m = ['error', 'You have already taken this quiz.'];
            res.redirect(307, `/test/`+req.session.classCode);
         }
      })
   } else {
      res.redirect("/");
   }
   function checkSchedule(){
      let sql = "SELECT * FROM `schedules` WHERE test_id = ?;";
      connection.query(sql, [req.session.testId], (error, results) => {
         if (error) { return console.error(error.message); }
         
         try{
            if(results[0].open_date || results[0].close_date){
               let openDate = new Date(results[0].open_date);
               let closeDate = results[0].close_date;
               let timeNow = new Date();
               if(timeNow > openDate && timeNow < closeDate){
                  try{
                     getTestName();
                  } catch(e){
                     m = ['error', 'There was an error while acessing the questions'];
                     res.redirect(307, `/test/`+req.session.classCode);
                  }
               } else{
                  m = ['warning', 'This quiz is not available'];
                  res.redirect(307, `/test/`+req.session.classCode);
               }
            }
            
         } catch(e){
            try{
               getTestName();
            } catch(e){
               m = ['error', 'There was an error while acessing the questions'];
               res.redirect(307, `/test/`+req.session.classCode);
            }
         }
      })
   }
   function getTestName() {
      let sql = "SELECT * FROM `tests` WHERE test_id = ?;";
      connection.query(sql, [req.session.testId], (error, results) => {
         if (error) { return console.error(error.message); }
         try{
            testStack.push(results[0].test_name);
            takeQuiz();
         } catch(e){
            m = ['error', 'There was an error while acessing the questions'];
            res.redirect(307, `/test/`+req.session.classCode);
         }
         
      })
   }
   function takeQuiz() {
      let sql = "SELECT * FROM questions WHERE test_id=?;";
      connection.query(sql, [req.session.testId], (error, results) => {
         if (error) { return console.error(error.message); }
         try{
            testStack.push(results[0].test_name);
            getQuestions(results);
         } catch(e){
            m = ['error', 'There was an error while acessing the questions'];
            res.redirect(307, `/test/`+req.session.classCode);
         }
      })
   }

   function getQuestions(results) {
      let sql = "SELECT * FROM question_choices WHERE question_id=?"
      let r = results;
      let multipleChoiceCounter = 0;
      let queryCounter = 0;

      r.forEach((question) => {
         if (question.question_type == 'multiple-choice') {
            multipleChoiceCounter++;
            connection.query(sql, [question.question_id], (error, results) => {
               if (error) {
                  return console.error(error.message);
               }
               question.question_choices = results;
               queryCounter++;
               if (queryCounter == multipleChoiceCounter) {
                  req.session.questions = r;
                  res.render("quiz", { questions: r, subject: testStack[0], test: testStack[1], message:m});
               }
            });
         }
      })
   }
})

app.post("/submit", (req, res) => {
   if (req.session.userid) {
      testStack = [];
      let sql = "SELECT * FROM responses WHERE test_id = ? and student_id = ?"
      connection.query(sql, [req.session.testId, req.session.userid], (error, results) => {
         if (error) { return console.error(error.message); }
         if (results < 1) {
            submitQuiz();
         } else {
            m = ['warning', 'You have already submitted this quiz.'];
            res.redirect("/home");
         }
      })


   } else {
      res.redirect("/");
   }

   function submitQuiz() {
      let timestamp = Date.now();
      let responseId = req.session.userid + req.session.testId + timestamp;
      let responseSQL = 'INSERT INTO `responses`(`response_id`, `test_id`, `student_id`, `is_checked`, `score`) VALUES (?,?,?,?,?)';
      let responseValues = [responseId, req.session.testId, req.session.userid, false, 0];
      connection.query(responseSQL, responseValues, (error, results) => {
         if (error) { return console.error(error.message); }
         insertResponseDetails(responseId);
      })
      let i = 0;

   }
   function insertResponseDetails(responseId) {
      let detailsSQL = 'INSERT INTO response_details(response_id, question_id, answer) VALUES ?';
      let detailValues = [[]];
      for (var i = 0; i < req.session.questions.length; i++) {
         let response = [];
         response.push(responseId);
         response.push(req.session.questions[i].question_id);
         response.push(eval("req.body.q" + i));
         detailValues[0].push(response);
      }

      connection.query(detailsSQL, detailValues, (error, results) => {
         if (error) { return console.error(error.message); }
         console.log("Response saved");
         res.render("submitted");
         m = ['success', 'Nice, One down'];
      })
   }

})