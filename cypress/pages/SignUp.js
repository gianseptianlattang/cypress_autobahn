export const SignUp = {
  selectors: {
    inputEmail: 'input[name="email"]',
    inputPassword: 'input[name="password"]',
    buttonSignUp: ".button-wrapper > .custom-button > .btn > .button-text",
    inputFirstName: 'input[name="first-name"]',
    inputLastName: 'input[name="last-name"]',
    dropdownIndustry: ".placeholderActive",
    optionIndustry: "#item-3",
    dropdownCountryPhoneCode: ".iti__selected-flag > .iti__flag",
    optionCountryPhoneCode: "#iti-item-id",
    inputPhoneNumber: 'input[name="phone-number"]',
    buttonStart: ".button-wrapper > .custom-button > .btn > .button-text",
    spinner: ".spinner > .fa",
    buttonJoinExistingAccount:
      "#join-existing-account-btn > .btn > .button-text",
    buttonResend: 'p[class="button-text paragraph button-large"]',
    textVerificationSuccess:
      '[style=""] > .modal-content > .modal-wrapper > .modal-container',
    textEmailWarning: ".error > .label",
    textPasswordWarning: "label",
    atLeast8CharactersWarning: "li:contains('At least 8 characters')",
    noSpaceWarning: "li:contains('No empty space')",
    oneUppercaseLetterWarning: "li:contains('One uppercase letter')",
    oneLowercaseLetterWarning: "li:contains('One lowercase letter')",
    oneNumberWarning: "li:contains('One number')",
    oneSpecialCharacterWarning: "li:contains('One special character')",
  },

  inputEmailPassword: (email, password) => {
    cy.get(SignUp.selectors.inputEmail).type(email);
    cy.get(SignUp.selectors.inputPassword).type(password);
    cy.get(SignUp.selectors.buttonSignUp).click();
  },

  inputEmailPasswordNegatifCases: (email, password) => {
    email
      ? cy.get(SignUp.selectors.inputEmail).type(email)
      : cy.get(SignUp.selectors.inputEmail).click();
    password
      ? cy.get(SignUp.selectors.inputPassword).type(password)
      : cy.get(SignUp.selectors.inputPassword).click();
    cy.get(SignUp.selectors.inputEmail).click();
  },

  inputUserDataPositifCases: (firstName, lastName, phoneNumber) => {
    cy.get(SignUp.selectors.inputFirstName).type(firstName);
    cy.get(SignUp.selectors.inputLastName).type(lastName);
    cy.get(SignUp.selectors.dropdownIndustry).click();
    cy.get(SignUp.selectors.optionIndustry).click();
    cy.get(SignUp.selectors.dropdownCountryPhoneCode).click();
    cy.get(SignUp.selectors.optionCountryPhoneCode).click();
    cy.get(SignUp.selectors.inputPhoneNumber).type(phoneNumber);
    cy.get(SignUp.selectors.buttonStart).click();
  },

  inputUserDataNegatifCases: (firstName, lastName, phoneNumber) => {
    firstName
      ? cy.get(SignUp.selectors.inputFirstName).type(firstName)
      : cy.get(SignUp.selectors.inputFirstName).click();
    lastName
      ? cy.get(SignUp.selectors.inputLastName).type(lastName)
      : cy.get(SignUp.selectors.inputLastName).click();
    cy.get(SignUp.selectors.dropdownIndustry).click();
    cy.get(SignUp.selectors.optionIndustry).click();
    cy.get(SignUp.selectors.dropdownCountryPhoneCode).click();
    cy.get(SignUp.selectors.optionCountryPhoneCode).click();
    phoneNumber
      ? cy.get(SignUp.selectors.inputPhoneNumber).type(phoneNumber)
      : cy.get(SignUp.selectors.inputPhoneNumber).click();
    cy.get(SignUp.selectors.inputFirstName).click();
  },

  assertSpinner: () => {
    cy.get(SignUp.selectors.spinner).should("be.visible");
  },

  clickJoinExistingAccount: () => {
    cy.get(SignUp.selectors.buttonJoinExistingAccount).click();
  },

  assertButtonResendVisible: () => {
    cy.get(SignUp.selectors.buttonResend).should("be.visible");
  },

  assertVerifySuccess: () => {
    cy.get(SignUp.selectors.textVerificationSuccess).should("be.visible");
  },

  clickResendButton: () => {
    cy.get(SignUp.selectors.buttonResend).click();
  },

  assertWarningTextEmail: (text) => {
    cy.get(SignUp.selectors.textEmailWarning).should("have.text", text);
  },

  assertWarningTextPassword: (text) => {
    cy.get(SignUp.selectors.textPasswordWarning).should("have.text", text);
  },

  assertAtLeast8CharactersWarningNotFulfilled: () => {
    cy.get(SignUp.selectors.atLeast8CharactersWarning).should(
      "not.have.class",
      "is-fulfilled"
    );
  },

  assertNoSpaceWarningNotFulfilled: () => {
    cy.get(SignUp.selectors.noSpaceWarning).should(
      "not.have.class",
      "is-fulfilled"
    );
  },

  assertOneUppercaseLetterWarningNotFulfilled: () => {
    cy.get(SignUp.selectors.oneUppercaseLetterWarning).should(
      "not.have.class",
      "is-fulfilled"
    );
  },

  assertOneLowercaseLetterWarningNotFulfilled: () => {
    cy.get(SignUp.selectors.oneLowercaseLetterWarning).should(
      "not.have.class",
      "is-fulfilled"
    );
  },

  assertOneNumberWarningNotFulfilled: () => {
    cy.get(SignUp.selectors.oneNumberWarning).should(
      "not.have.class",
      "is-fulfilled"
    );
  },

  assertOneSpecialCharacterWarningNotFulfilled: () => {
    cy.get(SignUp.selectors.oneSpecialCharacterWarning).should(
      "not.have.class",
      "is-fulfilled"
    );
  },

  assertButtonSignUpDisable: () => {
    cy.get(SignUp.selectors.buttonSignUp).should("not.be.enabled");
  },
};
