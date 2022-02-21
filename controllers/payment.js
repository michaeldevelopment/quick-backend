const config = require("../config");
const User = require("../models/user");
const prepayment = require("./prepayment");

const epayco = require("epayco-sdk-node")({
  apiKey: config.epayco.publicKey,
  privateKey: config.epayco.privateKey,
  lang: "ES",
  test: true,
});

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
    return res.json({ message: error, error: true });
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
