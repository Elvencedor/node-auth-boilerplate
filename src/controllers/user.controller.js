exports.allAccess = (req, res) => {
  res.status(200).send('This content has public access.')
}

exports.userBoard = (req, res) => {
  res.status(200).send('This content is restricted to registered users only.')
}

exports.adminBoard = (req, res) => {
  res.status(200).send('This content is restricted to administrators.')
}
