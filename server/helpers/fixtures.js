import Client from '../models/client';
import User from '../models/user';

const clients = [{
  name: 'web',
  id: 's!ujGTJKa*2ou&z6pBXN',
  secret: '3CF65437-8A41-4890-B191-7E8A545CB806'
}, {
  name: 'android',
  id: 'ts%ofZgWBcKTQX$kcW6l',
  secret: 'EF1B9E76-2022-4BE4-A7B9-74DE3FFDEB20'
}, {
  name: 'ios',
  id: 'VkNKm8W*6#ZnKO1%Q*Nd',
  secret: '435C8D2E-95C0-4FD0-8FE0-0FC1CF3C07CF'
}];

const users = [{
  username: 'olivers@engiefactory.com',
  password: 'factory5855',
  firstName: 'Olivers',
  lastName: 'De Abreu',
  role: 'admin'
}, {
  username: 'hector@engiefactory.com',
  password: 'factory5855',
  firstName: 'Hector',
  lastName: 'Varas',
  role: 'admin'
}, {
  username: 'luis@engiefactory.com',
  password: 'factory5855',
  firstName: 'Luis',
  lastName: 'Fuenmayor',
  role: 'admin'
}, {
  username: 'natalia.fouillioux@engiefactory.com',
  password: 'factory5855',
  firstName: 'Natalia',
  lastName: 'Fouillioux',
  role: 'admin'
}, {
  username: 'coloma.gili@engiefactory.com',
  password: 'factory5855',
  firstName: 'Coloma',
  lastName: 'Gili',
  role: 'admin'
}];


const Fixtures = () => {
  Client.count({}, (err, count) => {
    if (!err && count === 0) {
      clients.forEach((client) => {
        const _client = new Client({
          id: client.id,
          secret: client.secret,
          name: client.name
        });
        _client.save();
      });
    }
  });

  User.count({}, (err, count) => {
    if (!err && count === 0) {
      users.forEach((user) => {
        const _user = new User({
          username: user.username,
          password: user.password,
          profile: {
            firstName: user.firstName,
            lastName: user.lastName
          },
          role: user.role
        });
        _user.save();
      });
    }
  });
};

export default Fixtures;
