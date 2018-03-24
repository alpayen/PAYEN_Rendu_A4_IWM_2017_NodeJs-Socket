# Rendu de la semaine Node/Express & Socket.io / Front en VueJs
## Intro

Rendu d'une semaine de cour sur Nodejs Express à l'IIM
Le Back-End est réalisé sur un serveur nodeJs / Express. Le chat utilise Socket comme méthode de communication synchrone client/server.
Le tout est relié à Redis pour la sauvegarde des utilisateurs et des messages échangés.

Coté Front-End, tout est réalisé avec VueJs

*nb : Je n'ai jamais eu de prétention graphique, attention les yeux, ça pique un peu*

## Installation

### Front End
`cd chat-front`
`cd yarn install`
`cd yarn serve`

### Back End
`cd chat-server`
`cd yarn install`
`cd yarn start`

## Back End

### Méthodes Socket

#### set_login (username)

* **username** est obligatoire

```js
socket.emit('set_login', username);
```

Reçoit un username et set la variable socket.CurrentUser


#### check_auth (username)

* **message** is mandatory (any valid string)

```js
socket.emit('check_auth, (username)=>{};
```

Check si la variable CurrentUser est set pour la socket.
Renvoie un booléen en fonction

#### action_login (username)

```js
socket.emit('action_login, (username)=>{};
```

Instancie la variable CurrentUser.
Si le username n'existe pas :
Crée valeur dans un hash redis contenant ses informations

Renvoie un booléen pour savoir si l'utilisateur à été créer ou se reconnecte.

#### room_send_new_message (data)

```js
 socket.on('room_send_new_message', (data)
 ```

Enregistre un nouveau message dans Redis.
La clé Redis créer a la forme suivante : *messages:roomSlug*
Le nouveau message à le format suivant :

```json
{
  "send_name":  (String),
  "send_at":  (Date),
  "Content":  (String),
}
```

Elle renvoie le nouveau message dans la room :

```js
io.in(data.slug).emit('room_send_new_message_ret', message);
 ```


#### room_send_user_is_typing (slug) / room_send_user_stopped_typing (slug)

```js
 socket.on('room_send_user_is_typing', (slug)
 socket.on('room_send_user_stopped_typing', (slug)
 ```

Elles renvoient le nom d'utilisateur en train d'écrire


```js
socket.to(slug).emit('user_typing_in_room', socket.currentUser.username);
socket.to(slug).emit('user_stopped_typing_in_room', socket.currentUser.username);
 ```

#### rooms_get ()

```js
socket.on('rooms_get', () => {
 ```

Renvoie l'ensemble des salles de chat en base de données à l'utilisateur une par une.

```js
socket.emit('room_get_ret', room);
 ```



#### create_room (room_name)

```js
socket.on('create_room', (room_name) => {
 ```

Enregistre une nouvelle salle dans la liste Redis *Rooms*.
Elle ajoute le json suivant dans par la clé : rooms:Slug

```json
{
  "name": (String),
  "slug": (String),
  "owner": (String)
}
```

Elle renvoie la nouvelle salle

```js
socket.emit('room_get_ret', room);
 ```

#### join_room (slug)

```js
socket.on('join_room', (slug) => {
 ```

Fait entrée un utilisateur dans la salle.
L'ajoute à la list des utilisaeturs connéctés Redis sous la clés : connected:Slug


Renvoie à la socket la liste des 20 derniers messages (format JSON) envoyés à la salle.
```js
socket.emit('room_get_messages_ret', messages);
 ```

Revoie à l'ensemble de la salle la liste d'utilisateurs connectés à la salle

```js
io.to(slug).emit('room_send_user_list', users);
 ```


#### leave_room (slug)

```js
socket.on('leave_room', (slug) => {
 ```

Déconnecte la socket de la salle.
Le retire de la liste d'utilisateurs connéctés à la salle.
Revoie à l'ensemble de la salle la liste d'utilisateurs connectés à la salle

```js
io.to(slug).emit('room_send_user_list', users);
 ```


## Front End

### VueJs

#### '/' : src/main.js

Instanciation d'une instance Vuejs
A sa création, on check si l'utilisateur à une varible username dans son localstrorage
Si oui, on l'envoie au Back End

On render le fichier src/App.vue
A l'aide des méthodes de la library socket-client-vue :

```js
connect()
disconnect()
 ```

on affiche un bandeau d'état de connexion.

Sont aussi chargé les fichiers de style du projet.

#### '/' : src/Views/Login.vue

Une form demande à l'utilisateur de rentrer son nom.


#### '/' : src/Views/Login.vue

Une form demande à l'utilisateur de rentrer son nom.
Si le login est un succès, il est redirigé sur la route : '/chatrooms'

#### '/chatrooms' : src/Views/Chatrooms.vue

La vue liste les salles de discussions disponibles.
Un formulaire permet d'ajouter une salle.

#### '/chatrooms/{{Slug}}' : src/views/ChatroomSingle.vue

Affiche les 20 derniers messages de la salle, les utilisateurs connéctés et le formulaire d'ajout
de message.

A la réception d'un message, la fenêtre qui contient les messages scroll automatiquement.


#Bon Chat!

##Alexandre Payen


