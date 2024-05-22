const express = require('express');
const agentes = require('./public/data/agentes.js');
const app = express();
const port = process.env.PORT ?? 4000;
const path = require('path');
const jwt = require('jsonwebtoken');
const secretKey = 'FBI';

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/SignIn', (req, res) => {
    const { email, password } = req.body;
    const agente = agentes.find((a) => a.email == email && a.password == password);
    if(agente){
        const token = jwt.sign(
            {
                exp: Math.floor(Date.now() / 1000) + 120,
                data: agente
            },
            secretKey
        );
        res.send(`
            <h1>Bienvenido ${email}</h1>
            <a href="/RestrictedArea?token=${token}"> <p> Ir a casa </p> </a>
            <script>
                alert('Usuario encontrado y autenticado');
                sessionStorage.setItem('token', JSON.stringify("${token}"));
            </script>
        `);
    }else{
        res.send(`
            <script>
                alert('Usuario o contraseña incorrecta');
            </script>
        `);
    }
});

app.get('/RestrictedArea', (req, res) =>{
    let { token } = req.query;
    jwt.verify(token, secretKey, (err, decoded) => {
        err 
        ? res.status(401).send({
            error: "401 Unauthorized",
            message: err.message            
        })
        :
        res.send(`
            <h1>Area Restringida</h1> <br>Bienvenido ${decoded.data.email}
            <script>
                localStorage.setItem('email', "${decoded.data.email}")
            </script>
        `);
    });
});

app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));