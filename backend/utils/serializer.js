function serializeUser(user) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
      // No passwordHash included!
    };
  }
  
  module.exports = {
    serializeUser
  };
  