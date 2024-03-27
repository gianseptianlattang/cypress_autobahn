const { Common } = require("../pages/Common");
const { SignUp } = require("../pages/SignUp");
const { apiEmail } = require("../support/apiEmail");

describe("User Registration", () => {
  let email;
  let randomNumber;
  let password;

  beforeEach(() => {
    cy.fixture("dataTest.json").then((data) => {
      password = data.account.password;
      apiEmail.createEmail(password).then((newEmail) => {
        email = newEmail;
        cy.log(`Email : ${email}`);
      });
    });
    randomNumber = Math.floor(Math.random() * 90000) + 10000;
  });

  describe("User Registration - Positif Cases", () => {
    let validEmail;

    it("User successfully registered using valid data", () => {
      validEmail = email;
      cy.fixture("dataTest.json").then((data) => {
        Common.visitUrl(data.browser.url);
      });
      SignUp.inputEmailPassword(validEmail, password);
      SignUp.inputUserDataPositifCases(
        `User${randomNumber}`,
        `Autobahn`,
        `80000${randomNumber}`
      );
      SignUp.clickJoinExistingAccount();
      SignUp.assertButtonResendVisible();
    });

    it("User successfully verify new account from the email", () => {
      apiEmail.verifyFromEmail(validEmail, password).then((verificationUrl) => {
        Common.visitUrl(verificationUrl);
      });
      SignUp.assertVerifySuccess();
    });

    it("User successfully resend verification link", () => {
      cy.fixture("dataTest.json").then((data) => {
        Common.visitUrl(data.browser.url);
      });
      SignUp.inputEmailPassword(email, password);
      SignUp.inputUserDataPositifCases(
        `User${randomNumber}`,
        `Autobahn`,
        `80000${randomNumber}`
      );
      SignUp.clickJoinExistingAccount();
      SignUp.clickResendButton();
      SignUp.assertSpinner();
      SignUp.assertButtonResendVisible();

      apiEmail.assertNumberOfMessage(email, password, 2);
    });
  });

  describe("User Registration - Negatif Cases", () => {
    it("User can't register with an empty email", () => {
      cy.fixture("dataTest.json").then((data) => {
        Common.visitUrl(data.browser.url);
      });
      SignUp.inputEmailPasswordNegatifCases("", password);
      SignUp.assertWarningTextEmail("Field cannot be empty");
      SignUp.assertButtonSignUpDisable();
    });

    it("User can't register using an invalid email format", () => {
      cy.fixture("dataTest.json").then((data) => {
        Common.visitUrl(data.browser.url);
      });
      SignUp.inputEmailPasswordNegatifCases("emailtest.com", password);
      SignUp.assertWarningTextEmail("Must be a valid email");
      SignUp.assertButtonSignUpDisable();
    });

    it("User can't register with an empty password", () => {
      cy.fixture("dataTest.json").then((data) => {
        Common.visitUrl(data.browser.url);
      });
      SignUp.inputEmailPasswordNegatifCases(email, "");
      SignUp.assertWarningTextPassword("Field cannot be empty");
      SignUp.assertButtonSignUpDisable();
    });

    it("User can't register using less than 8 characters on the password", () => {
      cy.fixture("dataTest.json").then((data) => {
        Common.visitUrl(data.browser.url);
      });
      SignUp.inputEmailPasswordNegatifCases(email, "A#1b");
      SignUp.assertAtLeast8CharactersWarningNotFulfilled();
      SignUp.assertButtonSignUpDisable();
    });

    it("User can't register using space on the password", () => {
      cy.fixture("dataTest.json").then((data) => {
        Common.visitUrl(data.browser.url);
      });
      SignUp.inputEmailPasswordNegatifCases(email, "A# 1bqwe123");
      SignUp.assertNoSpaceWarningNotFulfilled();
      SignUp.assertButtonSignUpDisable();
    });

    it("User can't register without uppercase letter on the password", () => {
      cy.fixture("dataTest.json").then((data) => {
        Common.visitUrl(data.browser.url);
      });
      SignUp.inputEmailPasswordNegatifCases(email, "a#1bqwe123");
      SignUp.assertOneUppercaseLetterWarningNotFulfilled();
      SignUp.assertButtonSignUpDisable();
    });

    it("User can't register without lowercase letter on the password", () => {
      cy.fixture("dataTest.json").then((data) => {
        Common.visitUrl(data.browser.url);
      });
      SignUp.inputEmailPasswordNegatifCases(email, "A#1BQWE123");
      SignUp.assertOneLowercaseLetterWarningNotFulfilled();
      SignUp.assertButtonSignUpDisable();
    });

    it("User can't register without number on the password", () => {
      cy.fixture("dataTest.json").then((data) => {
        Common.visitUrl(data.browser.url);
      });
      SignUp.inputEmailPasswordNegatifCases(email, "A#AbqweAAA");
      SignUp.assertOneNumberWarningNotFulfilled();
      SignUp.assertButtonSignUpDisable();
    });

    it("User can't register without special character on the password", () => {
      cy.fixture("dataTest.json").then((data) => {
        Common.visitUrl(data.browser.url);
      });
      SignUp.inputEmailPasswordNegatifCases(email, "AAAbqwe123");
      SignUp.assertOneSpecialCharacterWarningNotFulfilled();
      SignUp.assertButtonSignUpDisable();
    });

    it("User can't register with an empty first name", () => {
      cy.fixture("dataTest.json").then((data) => {
        Common.visitUrl(data.browser.url);
      });
      SignUp.inputEmailPassword(email, password);
      SignUp.inputUserDataNegatifCases(
        "",
        `Autobahn`,
        `80000${randomNumber}`,
        true
      );
      SignUp.assertFirstNameWarning("Field cannot be empty");
      SignUp.assertButtonSignUpDisable();
    });

    it("User can't register using symbol on the first name", () => {
      cy.fixture("dataTest.json").then((data) => {
        Common.visitUrl(data.browser.url);
      });
      SignUp.inputEmailPassword(email, password);
      SignUp.inputUserDataNegatifCases(
        "S@ya",
        `Autobahn`,
        `80000${randomNumber}`,
        true
      );
      SignUp.assertFirstNameWarning("First name cannot contain symbols");
      SignUp.assertButtonSignUpDisable();
    });

    it("User can't register with an empty last name", () => {
      cy.fixture("dataTest.json").then((data) => {
        Common.visitUrl(data.browser.url);
      });
      SignUp.inputEmailPassword(email, password);
      SignUp.inputUserDataNegatifCases(
        "Saya",
        "",
        `80000${randomNumber}`,
        true
      );
      SignUp.assertLastNameWarning("Field cannot be empty");
      SignUp.assertButtonSignUpDisable();
    });

    it("User can't register using symbol on the last name", () => {
      cy.fixture("dataTest.json").then((data) => {
        Common.visitUrl(data.browser.url);
      });
      SignUp.inputEmailPassword(email, password);
      SignUp.inputUserDataNegatifCases(
        "Saya",
        "@uto",
        `80000${randomNumber}`,
        true
      );
      SignUp.assertLastNameWarning("First name cannot contain symbols");
      SignUp.assertButtonSignUpDisable();
    });

    it("User can't register without choosing an industry", () => {
      cy.fixture("dataTest.json").then((data) => {
        Common.visitUrl(data.browser.url);
      });
      SignUp.inputEmailPassword(email, password);
      SignUp.inputUserDataNegatifCases(
        "Saya",
        "@uto",
        `80000${randomNumber}`,
        false
      );
      cy.get(":nth-child(3) > .label").should(
        "have.text",
        "Field cannot be empty"
      );
      SignUp.assertButtonSignUpDisable();
    });

    it("User can't register with an empty phone number", () => {
      cy.fixture("dataTest.json").then((data) => {
        Common.visitUrl(data.browser.url);
      });
      SignUp.inputEmailPassword(email, password);
      SignUp.inputUserDataNegatifCases("Saya", "Autobahn", "", true);
      SignUp.assertPhoneNumberWarning("Field cannot be empty");
      SignUp.assertButtonSignUpDisable();
    });

    it("User can't register with invalid phone number format", () => {
      cy.fixture("dataTest.json").then((data) => {
        Common.visitUrl(data.browser.url);
      });
      SignUp.inputEmailPassword(email, password);
      SignUp.inputUserDataNegatifCases(
        "Saya",
        "Autobahn",
        `10000${randomNumber}`,
        true
      );
      SignUp.assertPhoneNumberWarning("Please enter a valid phone number");
      SignUp.assertButtonSignUpDisable();
    });
  });
});
