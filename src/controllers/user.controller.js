exports.allAccess = (req, res) => {
  res.status(200).send('This content has public access.')
}

exports.userBoard = (req, res) => {
  res.status(200).send('This content is restricted to registered users only. You have access')
}

exports.adminBoard = (req, res) => {
  res.status(200).send('This content is restricted to administrators.You have access')
}

exports.merchantStore = (req, res) => {
  res.status(200).send('Stores are restricted to merchants only. You have access')
}
