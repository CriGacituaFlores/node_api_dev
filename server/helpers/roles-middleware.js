import ConnectRoles from 'connect-roles';

const roles = new ConnectRoles({
  failureHandler: (req, res) => res.status(403).json({ message: 'Access Denied' })
});

roles.use('admin', req => req.user.role === 'admin');

roles.use('Authenticated', req => req.isAuthenticated());


export default roles;
