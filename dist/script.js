// Route pour la page de sign up
app.get('/signup', (req, res) => {
  res.render('signup'); // Crée un fichier signup.ejs pour la page de sign up
});

// Route pour la page de sign in
app.get('/signin', (req, res) => {
  res.render('signin'); // Crée un fichier signin.ejs pour la page de sign in
});

// Route pour traiter la soumission du formulaire de sign up
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  // Insère les données dans la collection MongoDB
  const novoDb = client.db('novo');
  const collection = novoDb.collection('users');
  await collection.insertOne({ email, password });
  
  res.send('Inscription réussie !');
});

// Route pour traiter la soumission du formulaire de sign in
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  // Vérifie les informations d'identification dans la collection MongoDB
  const novoDb = client.db('novo');
  const collection = novoDb.collection('users');
  const user = await collection.findOne({ email, password });

  if (user) {
      res.send('Connexion réussie !');
  } else {
      res.send('Échec de la connexion. Vérifiez vos informations d\'identification.');
  }
});

// Route pour le tableau de bord
app.get('/dashboard', async (req, res) => {
  try {
      const novoDb = client.db('novo');
      const collections = await novoDb.listCollections().toArray();

      res.render('dashboard', { collections });
  } catch (err) {
      console.error('Failed to retrieve collection names:', err);
      res.send('Failed to retrieve collection names. Please try again later.');
  }
});


// Route pour traiter la mise à jour d'une collection
app.post('/dashboard/update', async (req, res) => {
  const collectionName = req.body.collection;
  
  // Ajoute ici la logique de mise à jour selon tes besoins

  res.send(`Mise à jour réussie pour la collection ${collectionName}`);
});

// Route pour traiter la suppression d'une collection
app.post('/dashboard/delete', async (req, res) => {
  const collectionName = req.body.collection;

  // Ajoute ici la logique de suppression selon tes besoins

  res.send(`Suppression réussie pour la collection ${collectionName}`);
});
