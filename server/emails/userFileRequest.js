export const userFileRequest = ({
  username,
  type,
  file,
  status = "Pending",
  requestDate = new Date().toLocaleString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }),
}) => {
  const link = `${process.env.CLIENT_URI}/app/my-requests`;
  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: "Poppins", Arial, sans-serif;
        background: #f5f6f8;
        margin: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        background: #171717;
        color: #fff;
        text-align: center;
        padding: 20px;
        font-size: 24px;
        font-weight: 600;
      }
      .content {
        padding: 24px;
        color: #333;
        line-height: 1.6;
      }
      .btn {
        background: #2563eb;
        color: #fff;
        padding: 10px 20px;
        border-radius: 8px;
        text-decoration: none;
        margin-top: 12px;
        display: inline-block;
      }
      .footer {
        background: #f8f9fb;
        text-align: center;
        color: #666;
        font-size: 13px;
        padding: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">xCHnG</div>
      <div class="content">
        <h3>You requested to ${type} an item</h3>
        <p>Hi <b>${username}</b>,</p>
        <p>
          Your request to ${type} item has been successfully generated and is currently awaiting admin review.
        </p>
        <p>
          <b>Item Name:</b> ${
            file?.originalName ? file?.originalName : "-"
          }<br />
          <b>Tags:</b> ${file?.tags ? file?.tags : "-"}<br />
          <b>Item Price:</b> ${
            file.itemPrice ? `${file?.itemPrice}/-` : "-"
          }<br />
          <b>Item Rental Cost:</b> ${
            file.itemRentalCost ? `${file?.itemRentalCost}/-` : "-"
          }<br />
          <b>Service Cost:</b> ${
            file.serviceCost ? `${file?.serviceCost}/-` : "-"
          }<br />
          <b>Shipping Cost:</b> ${
            file.shippingCost ? `${file?.shippingCost}/-` : "-"
          }<br />
          <b>Offer Type:</b> ${
            file.offerType ? `${file?.offerType}` : "-"
          }<br />
          <b>Requested On:</b> ${requestDate}<br />
          <b>Status:</b> ${status}<br />
        </p>
        <p>
          Once reviewed, you will be notified whether the item is approved or rejected.
        </p>
        <a href="${link}" target="_blank" class="btn">View Status</a>
        <p>
          Please contact admin for any questions or concerns.
        </p>
      </div>
      <div class="footer">© 2025 xCHnG</div>
    </div>
  </body>
</html>`;
};
