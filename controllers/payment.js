const config = require("../config");
const User = require("../models/user");
const prepayment = require("./prepayment");

const epayco = require("epayco-sdk-node")({
  apiKey: config.epayco.publicKey,
  privateKey: config.epayco.privateKey,
  lang: "ES",
  test: true,
});

// exports.createCardToken = async (req, res) => {
//   const { decoded = {}, body: payment } = req;
//   //El objeto creditCardInfo lo recibe el body. A partir del req.body se construye el objeto creditCard
//   const creditCardInfo = {
//     "card[number]": payment.cardNumber,
//     "card[exp_year]": payment.expYear,
//     "card[exp_month]": payment.expMonth,
//     "card[cvc]": payment.CVC,
//   };

//   try {
//     const { card, id, status } = await epayco.token.create(creditCardInfo);

//     const creditCard = {
//       expMonth: card.exp_month,
//       expYear: card.exp_year,
//       name: card.name,
//       mask: card.mask,
//       tokenId: id,
//     };

//     const findUser = await User.findById(decoded.id);

//     findUser.premium.creditCards =
//       findUser.premium.creditCards.concat(creditCard);

//     const updatedUser = await findUser.save();
//     return res.status(200).json(updatedUser);
//   } catch (error) {
//     console.log(
//       "🚀 ~ file: payment.service.js ~ line 14 ~ createCardToken ~ e",
//       error
//     );
//     res.status(500).end({
//       message: "Error al crear el token",
//       error,
//     });
//   }
// };

// exports.createCustomer = async (req, res) => {
//   try {
//     const { decoded = {} } = req;

//     const findUser = await User.findById(decoded.id);
//     const creditCards = findUser.premium.creditCards;

//     const userInfo = {
//       token_card: findUser?.premium?.creditCards?.[0]?.tokenId,
//       name: findUser.firstName,
//       last_name: findUser.lastName,
//       email: findUser.email,
//       default: true,
//     };

//     const { data } = await epayco.customers.create(userInfo);

//     console.log(data);

//     const addCustomerId = await User.findByIdAndUpdate(
//       decoded.id,
//       {
//         premium: {
//           creditCards,
//           customerId: data.customerId,
//         },
//       },
//       { new: true }
//     );

//     return res.json(addCustomerId);
//   } catch (error) {
//     console.log(
//       "🚀 ~ file: payment.service.js ~ line 25 ~ createUser ~ e",
//       error
//     );
//   }
// };

exports.makePayment = async (req, res) => {
  try {
    const { decoded, body: payment } = req;
    const userCC = await User.findById(decoded.id);
    const userCCTokenId = userCC?.premium?.creditCards?.[0]?.tokenId;
    const userCustomerId = userCC?.premium?.customerId;

    const user =
      !userCCTokenId && !userCustomerId
        ? await prepayment.createCardTokenAndCustomer(req)
        : userCC;

    const creditCards = user.premium.creditCards;
    const customerId = user.premium.customerId;

    const paymentInfo = {
      token_card: user?.premium?.creditCards?.[0]?.tokenId,
      customer_id: user?.premium?.customerId,
      doc_type: payment.docType,
      doc_number: payment.docNumber,
      name: user.firstName,
      last_name: user.lastName,
      email: user.email,
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
      user.premium.payments = user.premium.payments.concat(dataPayment);
      const userP = await user.save();
      const payments = userP.premium.payments;

      const userSuccess = await User.findByIdAndUpdate(
        user.id,
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
