const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

require('./db');

const loggingMiddleware = require('./middlewares/logging');
const errorHandler = require('./middlewares/errorHandler');

const productsRouter = require('./routes/products');
const { router: authRouter } = require('./routes/auth');
const { router: cartRouter } = require('./routes/cart');
const adminRouter = require('./routes/admin');
const paymentRouter = require('./routes/payment');
const usersRouter = require('./routes/users');
const { router: debugRouter } = require('./routes/debug');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(loggingMiddleware);

app.get('/', (req, res) => {
  res.send('Welcome to the Bookstore API');
});

app.use('/products', productsRouter);
app.use('/', authRouter);
app.use('/cart', cartRouter);
app.use('/admin', adminRouter);
app.use('/payment', paymentRouter);
app.use('/user', usersRouter);
app.use('/debug', debugRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});
