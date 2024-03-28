const fs = require('fs');
const path = require('path');
const express = require('express');
const joi = require('joi');
const app = express();

const userShema = joi.object({
    firstName: joi.string().min(2).required(),
    SecondName: joi.string().min(2).required(),
    age: joi.number().min(0).required(),
    city: joi.string().min(2)
});

let uniqueId = 1;

const userDbPath = path.join(__dirname, './users.json');
app.use(express.json())

app.get('/users', (req,res) => {
    const users = JSON.parse(fs.readFileSync(userDbPath))
    res.send({users})
})

app.get('/users/:id', (req,res) => {
    const users = JSON.parse(fs.readFileSync(userDbPath))
    const findUser = users.find((user) => {
        return user.id === Number(req.params.id);
    })
    res.send({users: [findUser]})
})

app.post('/users', (req, res) => {
    const resultValidation = userShema.validate(req.body);

    if (resultValidation.error) {
        return res.status(404).send({error:resultValidation.error.details});
    }
    
    const users = JSON.parse(fs.readFileSync(userDbPath));
    
    // Находим максимальный id среди существующих пользователей
    const maxId = users.reduce((max, user) => {
        return user.id > max ? user.id : max;
    }, 0);

    const newId = maxId + 1; // Генерируем новый уникальный id
    users.push({ id: newId, ...req.body }); // Добавляем нового пользователя с новым id
    fs.writeFileSync(userDbPath, JSON.stringify(users)); // Записываем обновленные данные в файл
    res.send({ id: newId }); // Отправляем id нового пользователя клиенту
});


app.put('/users/:id', (req,res) => {
    const resultValidation = userShema.validate(req.body);

    if (resultValidation.error) {
        return res.status(404).send({error:resultValidation.error.details});
    }
    
    const users = JSON.parse(fs.readFileSync(userDbPath))
    const findUser = users.find((user) => {
        return user.id === Number(req.params.id);
    })
    if(findUser) {
    findUser.firstName = req.body.firstName;
    findUser.SecondName = req.body.SecondName;
    findUser.city = req.body.city;
    findUser.age = req.body.age;
    fs.writeFileSync(userDbPath, JSON.stringify(users))
    res.send({users:findUser})
} else {
    res.send({users:null})
}
})

app.delete('/users/:id', (req,res) => {
    const users = JSON.parse(fs.readFileSync(userDbPath))
    const findUser = users.findIndex((user) => {
        return user.id === Number(req.params.id);
    })
    users.splice(findUser,1);
    fs.writeFileSync(userDbPath, JSON.stringify(users))
    res.send({id: [req.params.id]})
})

app.listen(4000);