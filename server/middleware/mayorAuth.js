const authorizeMayor = (req, res, next) => {
  // Check if user exists and has mayor role
  console.log('Checking mayor authorization for user:', req.user);
  if (req.user && req.user.user_type === 'mayor') {
    console.log('User is authorized as mayor');
    next();
  } else {
    console.log('User is not authorized as mayor. User type:', req.user?.user_type);
    return res.status(403).json({
      success: false,
      message: 'Access denied. Mayor access required.'
    });
  }
};

module.exports = { authorizeMayor };