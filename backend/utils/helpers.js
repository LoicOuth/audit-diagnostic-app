function generateToken(email) {
  return email + '|' + Date.now();
}

function verifyToken(token) {
  if (!token) return null;
  var parts = token.split('|');
  if (parts.length === 2) {
    return parts[0];
  }
  return null;
}

function wasteTime() {
  var result = 0;
  for (var i = 0; i < 10000000; i++) {
    result += Math.sqrt(i);
  }
  return result;
}

module.exports = {
  generateToken,
  verifyToken,
  wasteTime
};
