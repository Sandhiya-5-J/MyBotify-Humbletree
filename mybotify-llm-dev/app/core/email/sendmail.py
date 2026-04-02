import smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from .config import EmailSettings, EmailType


def send_email(subject: str, body: str, to_address: str):
    """
    Args:
        subject (str): Email subject
        body (str): Email body (HTML)
        to_address (str): Recipient email address

    Returns:
        Boolen: True for Success
    """

    email_config = EmailSettings()

    msg = MIMEMultipart()
    msg["From"] = email_config.SMTP_FROM_EMAIL
    msg["To"] = to_address
    msg["Subject"] = subject

    msg.attach(MIMEText(body, "html"))

    try:
        with smtplib.SMTP(
            host=email_config.SMTP_HOST, port=email_config.SMTP_PORT
        ) as server:
            server.starttls()
            server.login(
                user=email_config.SMTP_USERNAME, password=email_config.SMTP_PASSWORD
            )
            t = server.send_message(msg)
        print("Email sent successfully")
    except smtplib.SMTPException as e:
        print(f"[WARNING] Failed to send email to {to_address}: {e}")
        return False
    except Exception as e:
        print(f"[WARNING] Email error for {to_address}: {e}")
        return False

    return True


def generate_email_body(name, otp, email_type=EmailType.ACCOUNT_CREATION):
    """
    Generate an HTML email body.

    Args:
        name (str): User's name
        otp (str): One-Time Password
        email_type (str) : account_creation / reset_password / resend

    Returns:
        tuple: (email subject, HTML email body)
    """
    from datetime import datetime

    current_year = datetime.now().year

    if email_type in [EmailType.ACCOUNT_CREATION, EmailType.RESEND_VERIFICATION]:
        subject = "MyBotify - Account Verification"
        message = "You're almost done creating your MyBotify account. Please use the verification code below to complete your registration:"
    elif email_type == EmailType.RESET_PASSWORD:
        subject = "MyBotify - Password Reset Request"
        message = "We received a request to reset your MyBotify account password. Please use the verification code below to complete reset password "

    body = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MyBotify Account Verification</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {{
            font-family: 'Plus Jakarta Sans', Arial, sans-serif;
            line-height: 1.6;
            background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
            margin: 0;
            padding: 20px;
            color: #2c3e50;
        }}

        .email-container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 1px solid rgba(0, 0, 0, 0.05);
        }}

        .email-header {{
            background: linear-gradient(135deg, #007bff 0%, #3f51b5 100%);
            color: white;
            text-align: center;
            padding: 25px;
            position: relative;
            overflow: hidden;
        }}

        .email-header::before {{
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: rgba(255,255,255,0.1);
            transform: rotate(-45deg);
        }}

        .email-header h2 {{
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }}

        .email-content {{
            padding: 35px;
        }}

        .verification-code {{
            background: linear-gradient(145deg, #f0f4f8 0%, #e6eaf0 100%);
            border: 2px solid rgba(0, 123, 255, 0.2);
            text-align: center;
            padding: 25px;
            margin: 25px 0;
            border-radius: 12px;
            position: relative;
        }}

        .verification-code::before {{
            content: 'Verification Code';
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 0 10px;
            font-size: 12px;
            color: #6c757d;
        }}

        .verification-code-text {{
            font-size: 36px;
            letter-spacing: 10px;
            color: #007bff;
            font-weight: 700;
            display: inline-block;
            background-color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }}

        .important-note {{
            background: linear-gradient(to right, #fff3cd 0%, #ffeeba 100%);
            border-left: 5px solid #ffc107;
            padding: 20px;
            margin-bottom: 25px;
            border-radius: 6px;
            position: relative;
        }}

        .important-note::before {{
            content: '⚠️';
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 24px;
        }}

        .footer-note {{
            font-size: 12px;
            color: #6c757d;
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            border-top: 1px solid #e9ecef;
        }}

        .btn {{
            display: inline-block;
            background: linear-gradient(135deg, #007bff 0%, #3f51b5 100%);
            color: #FFFFFF !important;  /* Explicitly set white text */
            text-align: center;
            font-weight: 600;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 8px;
            margin-top: 20px;
            transition: transform 0.2s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }}

        .btn:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
        }}
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h2>{subject}</h2>
        </div>

        <div class="email-content">
            <p>Hi {name},</p>

            <p>{message}</p>

            <div class="verification-code">
                <div class="verification-code-text">
                    {otp}
                </div>
            </div>

            <div class="important-note">
                <strong>Important:</strong>
                This verification code is valid for 10 mins.
            </div>

            <p>If you did not initiate this, please contact us:</p>
            <a href="mailto:support@mybotify.com" class="btn">Contact Support</a>
        </div>

        <div class="footer-note">
            ©{current_year} MyBotify. All rights reserved.
            <br>
            If you're having trouble, please contact support@mybotify.com
        </div>
    </div>
</body>
</html>"""
    return subject, body
