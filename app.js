const express = require('express');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bodyParser = require('body-parser');
const router = express.Router();
const fs = require('fs');

let app = express();

let usersData = JSON.parse(fs.readFileSync('./data/users.json'));
saveUser('e');

let users = usersData.users;




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


//read users file
// fs.readFile('./data/users.json', 'json', (err, data) => {
//     if(err) throw err;
//     console.log(data);
// });



// app.get('/auth/google', passport.authenticate('google', {scope: 'profile'}));
// app.get('/auth/google/callback', passport.authenticate('google', {successRedirect: '/userListing', failure: '/'}));

app.post('/users', (req, res, next) => {
    let user = {
        username: req.body.username,
        name: req.body.name,
        email: req.body.email,
        age: req.body.age
    };
    let found = false;
    let duplicateUsername = false;
    for(let i = 0; i < users.length; i++){
        if(users[i].username === user.username){
            duplicateUsername = true;
        }
        if(duplicateUsername && users[i].name === req.body.name && users[i].email === req.body.email && users[i].age === user.age){
            console.log("user already in system");
            found = true;
        }
    }
    if(!found && !duplicateUsername){
        console.log("not found");
        users.push(user);
    }
    if(duplicateUsername){
        console.log("please choose a different username");
    }
    else{
        res.render("userListing", {users: users});
    }
});

app.get('/users/:userID', (req, res) => {
    res.end(`Editing user ${req.params.userID}`)
});

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
    console.log(usersData);
    let stringy = JSON.stringify(usersData);
    let regex = /"users": \[{(.*)}]/;
    let result = stringy.replace(regex, `"users": [${users}] eeeeeeeeee`);
    console.log("this is after regex " + result);
}
