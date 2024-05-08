const express = require('express');
const app = express();
const usersSocialRouter = require('./routes/user/users_social');
const usersRouter = require('./routes/user/users');
const policyRouter = require('./routes/policy/policy');

app.use('/users_social', usersSocialRouter);
app.use('/users', usersRouter);
app.use('/policy', policyRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});