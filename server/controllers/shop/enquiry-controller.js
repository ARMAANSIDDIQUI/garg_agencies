const nodemailer = require("nodemailer");
const Product = require("../../models/Product");

// Configure your email transport
const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: "gozoomtechnologies@gmail.com", 
    pass: "qwuyqyxwiystcbhf", 
  },
});

const sendEnquiry = async (req, res) => {
  try {
    const { productId, email, message, phone } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    const mailOptions = {
      from: "gozoomtechnologies@gmail.com",
      to: "shashwatmbd@gmail.com",
      subject: `New Enquiry for Product: ${product.title}`,
      html: `
        <h1>New Enquiry Details</h1>
        <p><strong>Product:</strong> ${product.title}</p>
        <p><strong>From:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p>Thank you for using our service @Shashwat Enterprises!</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Enquiry sent successfully!",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred while sending the enquiry!",
    });
  }
};

module.exports = { sendEnquiry };
