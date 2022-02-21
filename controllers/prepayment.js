const config = require("../config");
const User = require("../models/user");

const epayco = require("epayco-sdk-node")({
  apiKey: config.epayco.publicKey,
  privateKey: config.epayco.privateKey,
  lang: "ES",
  test: true,
});

exports.createCardTokenAndCustomer = async (req, res) => {
  const { decoded = {}, body: payment } = req;
  // El objeto creditCardInfo lo recibe el body. A partir del req.body se construye el objeto creditCard

  const creditCardInfo = {
    "card[number]": payment.cardNumber,
    "card[exp_year]": payment.expYear,
    "card[exp_month]": payment.expMonth,
    "card[cvc]": payment.CVC,
  };

  const { card, id } = await epayco.token.create(creditCardInfo);

  const creditCard = {
    expMonth: card.exp_month,
    expYear: card.exp_year,
    name: card.name,
    mask: card.mask,
    tokenId: id,
  };

  const findUser = await User.findById(decoded.id);

  findUser.premium.creditCards =
    findUser.premium.creditCards.concat(creditCard);

  const updatedUser = await findUser.save();

  ///////// Ahora creo el customer

  const creditCards = updatedUser.premium.creditCards;

  const userInfo = {
    token_card: updatedUser?.premium?.creditCards?.[0]?.tokenId,
    name: updatedUser.firstName,
    last_name: updatedUser.lastName,
    email: updatedUser.email,
    default: true,
  };

  const { data } = await epayco.customers.create(userInfo);

  const user = await User.findByIdAndUpdate(
    decoded.id,
    {
      premium: {
        creditCards,
        customerId: data.customerId,
      },
    },
    { new: true }
  );

  return user;
};
