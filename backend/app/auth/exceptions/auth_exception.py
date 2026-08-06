class AuthException(Exception):
    pass


class EmailAlreadyExistsException(AuthException):

    def __init__(self):
        self.message = "Email already registered."
        super().__init__(self.message)


class InvalidOTPException(AuthException):

    def __init__(self):
        self.message = "Invalid OTP."
        super().__init__(self.message)


class OTPExpiredException(AuthException):

    def __init__(self):
        self.message = "OTP has expired."
        super().__init__(self.message)


class PendingUserNotFoundException(AuthException):

    def __init__(self):
        self.message = "Pending registration not found."
        super().__init__(self.message)