const express = require('express');
const app = express();
const usersSocialRouter = require('./routes/users_social');
const usersRouter = require('./routes/users');

app.use('/users_social', usersSocialRouter);
app.use('/users', usersRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
