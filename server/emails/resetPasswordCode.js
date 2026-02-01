export const resetPasswordCode = ({ username, otp }) => {
  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: 'Poppins', Arial, sans-serif;
        background-color: #f5f6f8;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      .header {
        background-color: #171717;
        color: white;
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
      .otp-box {
        display: inline-block;
        background-color: #2563eb;
        color: white;
        font-size: 22px;
        letter-spacing: 4px;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        margin: 20px 0;
      }
      .btn {
        display: inline-block;
        background-color: #2563eb;
        color: white !important;
        text-decoration: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 500;
        margin-top: 15px;
      }
      .footer {
        background-color: #f8f9fb;
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
        <h3>Password Reset Request</h3>
        <p>Hello ${username},</p>
        <p>We received a request to reset your <b>xCHnG</b> account password.</p>
        <p>Please use the OTP below to verify your identity and reset your password:</p>

        <div class="otp-box">${otp}</div>

        <p>This OTP is valid for the next <b>10 minutes</b>. Do not share it with anyone for security reasons.</p>
        <p>If you didn’t request this, you can safely ignore this email.</p>
        <p>
          Please contact admin for any questions or concerns.
        </p>
      </div>
      <div class="footer">
        © 2025 xCHnG
      </div>
    </div>
  </body>
</html>`;
};
