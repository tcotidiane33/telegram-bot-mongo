// Récupérez une référence à la base de données Firebase
var database = firebase.database().ref('https://novohub-default-rtdb.firebaseio.com/');

// Sélectionnez l'élément HTML où vous souhaitez afficher les données
var userList = document.getElementById('userList');

// Écoutez les modifications de données
database.on('value', function(snapshot) {
  userList.innerHTML = ''; // Effacez le contenu précédent

  snapshot.forEach(function(childSnapshot) {
    var user = childSnapshot.val();
    var userId = childSnapshot.key;

    // Créez des éléments HTML pour afficher les informations de l'utilisateur
    var userDiv = document.createElement('div');
    userDiv.className = 'card';
    userDiv.innerHTML = '<div class="card-body">' +
      '<h5 class="card-title">ID de l\'utilisateur : ' + userId + '</h5>' +
      '<p class="card-text">Email : ' + user.email + '</p>' +
      '<p class="card-text">Nom d\'utilisateur : ' + user.username + '</p>' +
      '<p class="card-text">Mot de passe : ' + user.password + '</p>' +
      '</div>';

    // Ajoutez l'élément HTML à la liste des utilisateurs
    userList.appendChild(userDiv);
  });
}, function(error) {
  console.error('Erreur lors de la récupération des données :', error);
});
