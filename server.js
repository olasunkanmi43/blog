const express = require('express'),
mongoose = require('mongoose'),
bcrypt = require('bcrypt'),

app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

mongoose.connect("mongodb://localhost:27017/blog", {useUnifiedTopology:true});

const userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    sex: String,
    email: String,
    password: String,
    date_registered:{
        type:Date,
        default:Date.now()
    }
});

const User = mongoose.model('user', userSchema);

const articleSchema = new mongoose.Schema({
    title: String,
    content: String,
    date: {
        type: Date,
        default:Date.now()
    }
});

const Article = new mongoose.model('article', articleSchema);

app.get('/', function(req, res){
    res.render('index');
});

app.post('/', function(req, res) {
    User.findOne({email:req.body.email}, function(err, user){
        if(user == null) {
            res.send("Email does not exist");
            console.log("User Not Found");
        } else {
            // res.send("There's a User");
            // console.log(user);

            bcrypt.compare(req.body.password, user.password, function(err, isVerified){
                if(isVerified) {
                    res.redirect('/blog');
                    // res.send("Password is correct");
                } else {
                    res.send("Password is incorrect");
                }
            });
        }
    });
});

app.get('/signup', function(req, res){
    res.render('signup');
});

app.post('/signup', function(req, res) {

    const{firstname, lastname, sex, email, password} = req.body;
   User.find({email:email}, function(error, user) {
       if(error) {
           console.log(error);
           res.send("There's a problem. Please try again");
       }
            if(user.length > 0) {
                res.send("Email already exists");
                console.log(user);
            } else {

                bcrypt.hash(password, 10, function(error, hash) {

                    const user = new User({
                            firstname,
                            lastname,
                            sex,
                            email,
                            password:hash
                    });

                    user.save(function(error){
                        if(error){
                            console.log(error);
                            res.send("There was a problem registering.");
                        } else {
                            res.redirect('/');
                        }
                    });
                });
                // res.send("Email is ok");
                // console.log(user);
            }
   });
   
   
    // console.log(firstname);
    // console.log(lastname);
    // console.log(password);
    // res.send("Registration in Progress");

});

app.get('/blog', (req, res) => {
   
    // res.render('article');
    Article.find({}, function(err, posts) {
        if(err) {
            res.send("There's a problem loading the articles feed");
            console.log(err)
        } else {
            res.render('article', {blogpost:posts});
        }
    });
});

app.post('/blog', (req, res) => {
    // console.log(req.body);
    // res.send("Article Sent");

    const{title, content} = req.body;

    const article = new Article({
        title, content
    });

    article.save((error) => {
        if(error) {
            res.send("There was a problem submitting your article");
        } else {
            res.redirect('/blog');
        }
    });
});

app.get('/compose', (req, res) => {
    res.render('compose');
});

app.get('/logout', (req, res) => {
    res.redirect('/');
});

app.listen(4100, function() {
    console.log('Server started on port 4100');
});