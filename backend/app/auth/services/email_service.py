import smtplib 
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.message import EmailMessage
from app.config import EMAIL_ADDRESS ,EMAIL_PASSWORD

import traceback

def send_otp_email(
        email:str,otp:str
):
    message=MIMEMultipart()
    message["From"]=EMAIL_ADDRESS
    message["To"]=email
    message["Subject"]="Your AI SQLv Analyst Verification Code"
    body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            font-family: Arial, Helvetica, sans-serif;
        }}

        .container {{
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 5px 20px rgba(0,0,0,.15);
        }}

        .header {{
            background: #2563eb;
            color: white;
            text-align: center;
            padding: 25px;
        }}

        .header h1 {{
            margin: 0;
            font-size: 28px;
        }}

        .content {{
            padding: 35px;
            text-align: center;
            color: #333;
        }}

        .content h2 {{
            margin-bottom: 10px;
        }}

        .otp {{
            display: inline-block;
            margin: 25px 0;
            padding: 15px 35px;
            background: #f1f5f9;
            border: 2px dashed #2563eb;
            border-radius: 10px;
            font-size: 34px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #2563eb;
        }}

        .warning {{
            color: #ef4444;
            font-size: 14px;
            margin-top: 20px;
        }}

        .footer {{
            background: #f8fafc;
            text-align: center;
            padding: 20px;
            color: #777;
            font-size: 13px;
        }}
    </style>
</head>

<body>

<div class="container">

    <div class="header">
        <h1>AI SQL Analyst</h1>
    </div>

    <div class="content">

        <h2>Email Verification</h2>

        <p>
            Hello,
            <br><br>
            Thank you for registering with <strong>AI SQL Analyst</strong>.
        </p>

        <p>Please use the verification code below:</p>

        <div class="otp">
            {otp}
        </div>

        <p>
            This OTP is valid for
            <strong>5 minutes</strong>.
        </p>

        <p class="warning">
            Do not share this code with anyone.
        </p>

    </div>

    <div class="footer">
        © 2026 AI SQL Analyst<br>
        This is an automated email. Please do not reply.
    </div>

</div>

</body>
</html>
"""
    message.attach(MIMEText(body,"html"))
    
    with smtplib.SMTP(
        "smtp.gmail.com",
        587
    ) as server:
        server.starttls()
        server.login(EMAIL_ADDRESS,EMAIL_PASSWORD)
        server.send_message(message)

def send_notification(to_email: str, subject: str, body: str):
    msg = EmailMessage()

    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.send_message(msg)




def send_error_notification(error: Exception):
    body = f"""
AI SQL Analyst - Backend Error

Error:
{str(error)}

Traceback:
{traceback.format_exc()}
"""

    send_notification(
        to_email=EMAIL_ADDRESS,
        subject="🚨 AI SQL Analyst Backend Error",
        body=body
    )              