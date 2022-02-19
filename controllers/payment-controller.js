const config = require("../config");
const User = require("../models/user");

const epayco = require("epayco-sdk-node")({
  apiKey: config.epayco.publicKey,
  privateKey: config.epayco.privateKey,
  lang: "ES",
  test: true,
});

const paymentInfo = {
  token_card: "token_id",
  customer_id: "customer_id",
  doc_type: "CC",
  doc_number: "10358519",
  name: "John",
  last_name: "Doe",
  email: "example@email.com",
  // city: "Bogota",
  // address: "Cr 4 # 55 36",
  // phone: "3005234321",
  // cell_phone: "3010000001",
  bill: "OR-1234",
  description: "Test Payment",
  value: "116000",
  tax: "16000",
  tax_base: "100000",
  currency: "COP",
  dues: "12",
  ip: "190.000.000.000" /*This is the client's IP, it is required */,
  url_response: "https://ejemplo.com/respuesta.html",
  url_confirmation: "https://ejemplo.com/confirmacion",
  method_confirmation: "GET",

  //Los parámetros extras deben ser enviados tipo string, si se envía tipo array generara error.

  use_default_card_customer: true /*if the user wants to be charged with the card that the customer currently has as default = true*/,

  extras: {
    extra1: "",
    extra2: "",
    extra3: "",
    extra4: "",
    extra5: "",
    extra6: "",
  },
};

exports.createCardToken = async (req, res) => {
  //El objeto creditCardInfo lo recibe el body. A partir del req.body se construye el objeto creditCard
  const creditCardInfo = {
    "card[number]": "4575623182290326",
    "card[exp_year]": "2025",
    "card[exp_month]": "12",
    "card[cvc]": "123",
  };

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
    const findUser = await User.findById(decoded.id);

    findUser.premium.creditCards =
      findUser.premium.creditCards.concat(creditCard);

    const updatedUser = await findUser.save();
    return res.status(200).json(updatedUser);
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

exports.createCustomer = async (req, res) => {
  try {
    const { decoded = {} } = req;

    const findUser = await User.findById(decoded.id);
    const creditCards = findUser.premium.creditCards;

    const userInfo = {
      token_card: findUser?.premium?.creditCards?.[0]?.tokenId,
      name: findUser.firstName,
      last_name: findUser.lastName,
      email: findUser.email,
      default: true,
    };

    const { data } = await epayco.customers.create(userInfo);

    const addCustomerId = await User.findByIdAndUpdate(
      decoded.id,
      {
        premium: {
          creditCards,
          customerId: data.customerId,
        },
      },
      { new: true }
    );

    return res.json(addCustomerId);
  } catch (error) {
    console.log(
      "🚀 ~ file: payment.service.js ~ line 25 ~ createUser ~ e",
      error
    );
  }
};

exports.makePayment = async (req, res) => {
  try {
    const { decoded = {}, body: payment } = req;

    const findUser = await User.findById(decoded.id);
    const creditCards = findUser.premium.creditCards;
    const customerId = findUser.premium.customerId;

    const paymentInfo = {
      token_card: findUser?.premium?.creditCards?.[0]?.tokenId,
      customer_id: findUser?.premium?.customerId,
      doc_type: payment.docType,
      doc_number: payment.docNumber,
      name: findUser.firstName,
      last_name: findUser.lastName,
      email: findUser.email,
      /////////////////////////////
      bill: payment.bill,
      description: "Suscripción Mensual Quick App +",
      value: payment.value,
      tax: payment.tax,
      tax_base: payment.taxBase,
      currency: payment.currency,
      dues: payment.dues,
      ip: payment.ip /*This is the client's IP, it is required */,
      // url_response: "https://ejemplo.com/respuesta.html",
      // url_confirmation: "https://ejemplo.com/confirmacion",
      // method_confirmation: "GET",
    };

    const { data, success } = await epayco.charge.create(paymentInfo);

    const dataPayment = {
      refId: data.ref_payco,
      bill: data.factura,
      description: data.descripcion,
      value: data.valor,
      state: data.estado,
    };

    if (success) {
      findUser.premium.payments = findUser.premium.payments.concat(dataPayment);
      const user = await findUser.save();
      const payments = user.premium.payments;

      const userSuccess = await User.findByIdAndUpdate(
        decoded.id,
        {
          premium: {
            creditCards,
            customerId,
            premiumStatus: true,
            payments,
          },
        },
        { new: true }
      );

      const updatedUser = await userSuccess.save();
      return res.json({
        error: false,
        message: "Compra exitosa",
        updatedUser,
      });
    } else {
      return res.json({
        message: "Error a la hora de hacer el pago",
        error: true,
      });
    }
  } catch (error) {
    console.log(
      "🚀 ~ file: payment.service.js ~ line 36 ~ makePayment ~ error",
      error
    );
  }
};

exports.cleanCredit = async (req, res) => {
  const { decoded = {} } = req;

  const userClean = await User.findByIdAndUpdate(
    decoded.id,
    {
      premium: { $pull: { creditCards: "visa" } },
    },
    { new: true }
  );
  return res.json(userClean);
};
