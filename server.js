const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const exjwt= require('express-jwt');
const bodyParser = require('body-parser');
const app = express();

app.use((req, res,next ) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

const PORT = 3000;
const secretKey = 'My Super Secret Key';

const jwtMW= exjwt.expressjwt({
    secret: secretKey,
    algorithms: ['HS256']
});

let users = [
    {
        id : 1,
        username : 'udaya',
        password : 'uda'
    },
    {
        id : 2,
        username : 'uchinta@charlotte.edu',
        password : 'uchinta'
    }
];
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return res.status(401).json({
            success: false,
            err: 'Username or password is incorrect',
            token: null
        });
    }
    
    let token = jwt.sign(
        { id: user.id, username: user.username }, 
        secretKey, 
        { expiresIn: 60 }  // 60 seconds for testing
    );
    
    return res.json({
        success: true,
        err: null,
        token
    });
});

app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see.'
    });
});

app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Settings content that only logged in people can see.'
    });
});

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError : err,
            err: 'Username or password in incorrect 2'
        });
    }
    else {
        next(err);
    }
});


app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});