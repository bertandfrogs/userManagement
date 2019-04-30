const express = require('express');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bodyParser = require('body-parser');
const router = express.Router();
const fs = require('fs');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/userManagement', {useNewUrlParser: true});
// "userManagement" is the db name
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('db connected');
});

const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    email: String,
    age: { type: Number, max: 70 },
    userID: Number
});

const user = mongoose.model('userCollection', userSchema);

let app = express();

let usersData = JSON.parse(fs.readFileSync('./data/users.json'));

let users = usersData.users;
console.log(users);

let initialUserID = 7;
let userID = initialUserID;


app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.render('userCreation', {});
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: 'super secret',
    saveUninitialized: false,
    resave: false,
    cookie: {maxAge: 600000}
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user)
});

passport.deserializeUser((user, done) => {
    done(null, user)
});

passport.use(new GoogleStrategy({
    //options
    clientID: '1078031502590-6jk74ce21l7m8o04sioinf26f0au3v04.apps.googleusercontent.com',
    clientSecret: '4d-xcnfSIj02JmuQYbshZpc_',
    callbackURL: 'http://localhost:3000/auth/google/callback'
}, (req, accessToken, refreshToken, profile, done) => {
    //callback
    done(null, profile)
}));

app.post('/users', (req, res, next) => {

    let newUser = new user();
    userID++;

    newUser.username = req.body.username;
    newUser.name = req.body.name;
    newUser.email = req.body.email;
    newUser.age = req.body.age;
    newUser.userID = userID;
    console.log(newUser.userID);
    console.log(userID);

    let allFilledOut = false;
    if(newUser.username !== null && newUser.name !== null && newUser.email !== null && newUser.age !== null){
        allFilledOut = true;
    }

    console.log(`Add user: ${newUser.username} ${newUser.name} ${newUser.email} ${newUser.age} ${newUser.userID}`);

    if(allFilledOut){
        users.push(newUser);
    }
    res.render("userListing", {users: users});

    // newUser.save((err, data) => {
    //     if (err) {
    //         return console.error(err);
    //     }
    //     console.log(`new user save: ${data}`);
    //     res.send(`done ${data}`);
    // });
    // let found = false;
    // let duplicateUsername = false;
    // for(let i = 0; i < users.length; i++){
    //     if(users[i].username === user.username){
    //         duplicateUsername = true;
    //     }
    //     if(duplicateUsername && users[i].name === req.body.name && users[i].email === req.body.email && users[i].age === user.age){
    //         console.log("user already in system");
    //         found = true;
    //     }
    // }
    // if(!found && !duplicateUsername){
    //     console.log("not found");
    //     users.push(user);
    // }
    // if(duplicateUsername){
    //     console.log("please choose a different username");
    // }
    // else{
    //     res.render("userListing", {users: users});
    // }
});

app.get('/users/:userID', (req, res) => {
    // res.end(`Editing user ${req.params.userID}`);
    let position = getUserFromID(req.params.userID);
    res.render("userEdit", {user: users[position]});
});

function getUserFromID(id){
    let position;
    for(let i = 0; i < users.length; i++){
        if(users[i].username === id){
            position = i;
        }
    }
    console.log(position);
    return position;
}

app.get('/logout', (req, res) => {
    req.logout();
});

app.listen(3000, () => {
    console.log('listening on port 3000');
});

function deletThis(user){
    console.log(user);
}

function saveUser(user){
    // console.log(usersData);
    // let stringy = JSON.stringify(usersData);
    // let regex = /"users": \[{(.*)}]/;
    // let result = stringy.replace(regex, `"users": [${user}] eeeeeeeeee`);
    // console.log("this is after regex " + result);
}

