const config = require("../config");
const User = require("../models/user");

const epayco = require("epayco-sdk-node")({
  apiKey: config.epayco.publicKey,
  privateKey: config.epayco.privateKey,
  lang: "ES",
  test: true,
});

const creditCardInfo = {
  "card[number]": "4575623182290326",
  "card[exp_year]": "2025",
  "card[exp_month]": "12",
  "card[cvc]": "123",
};

const userInfo = {
  token_card: "toke_id",
  name: "Joe",
  last_name: "Doe",
  email: "joe@payco.co",
  default: true,
  //Optional parameters: These parameters are important when validating the credit card transaction
  city: "Bogota",
  address: "Cr 4 # 55 36",
  phone: "3005234321",
  cell_phone: "3010000001",
};

const paymentInfo = {
  token_card: "toke_id",
  name: "Joe",
  last_name: "Doe",
  email: "joe@payco.co",
  default: true,
  //Optional parameters: These parameters are important when validating the credit card transaction
  city: "Bogota",
  address: "Cr 4 # 55 36",
  phone: "3005234321",
  cell_phone: "3010000001",
};

exports.createCardToken = async (req, res) => {
  try {
    const { card, id, status } = await epayco.token.create(creditCardInfo);

    const creditCard = {
      expMonth: card.exp_month,
      expYear: card.exp_year,
      name: card.name,
      mask: card.mask,
      tokenId: id,
    };

    const { decoded = {} } = req;
    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { billing: { $push: { creditCards: creditCard } } },
      {
        runValidators: true,
        new: true,
      }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log(
      "🚀 ~ file: payment.service.js ~ line 14 ~ createCardToken ~ e",
      error
    );
    res.status(500).end({
      message: "Error al crear el token",
      error,
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    await epayco.customers.create(userInfo);
  } catch (error) {
    console.log(
      "🚀 ~ file: payment.service.js ~ line 25 ~ createUser ~ e",
      error
    );
  }
};

exports.makePayment = async (req, res) => {
  try {
    await epayco.charge.create(paymentInfo);
  } catch (error) {
    console.log(
      "🚀 ~ file: payment.service.js ~ line 36 ~ makePayment ~ error",
      error
    );
  }
};
