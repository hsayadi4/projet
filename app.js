
const express = require('express');
const app = express();
const sequelize = require('./config/database');


const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);

sequelize.sync()
  .then(() => console.log('Base de données synchronisée'))
  .catch(err => console.error('Erreur de synchronisation de la base de données :', err));


  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
