const User = require('../models/User');
const bcrypt = require('bcrypt');


exports.register = async (req, res) => {
  const { name, email, password, address } = req.body;

  try {
   
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await User.create({ name, email, password: hashedPassword, address });

    res.status(201).json({ message: 'Utilisateur enregistré avec succès', user });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'utilisateur' });
  }
};
