describe("User Registration", () => {
  let domainName;
  let email;
  let randomNumber;
  let password = "@Test12345abc";
  let token;

  beforeEach(() => {
    randomNumber = Math.floor(Math.random() * 90000) + 10000;

    cy.request({
      method: "GET",
      url: "https://api.mail.tm/domains",
    }).then((response) => {
      domainName = response.body["hydra:member"][0].domain;
      cy.log("Domain:", domainName);
      expect(response.status).to.eq(200);

      cy.request({
        method: "POST",
        url: "https://api.mail.tm/accounts",
        body: {
          address: `autobahn_${randomNumber}@${domainName}`,
          password: password,
        },
      }).then((response) => {
        email = response.body.address;
        cy.log("Response:", email);
        expect(response.status).to.eq(201);
      });
    });
  });

  describe("User Registration - Positif Cases", () => {
    let validEmail;
    let resendEmail;

    it("User successfully registered using valid data", () => {
      validEmail = email;
      cy.visit("https://autobahn.security/signup");
      cy.get('input[name="email"]').type(validEmail);
      cy.get('input[name="password"]').type(password);
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").click();
      cy.get(".spinner > .fa").should("be.visible");
      cy.get('input[name="first-name"]').type("User");
      cy.get('input[name="last-name"]').type("Autobahn");
      cy.get(".placeholderActive").click();
      cy.get("#item-3").click();
      cy.get(".iti__selected-flag > .iti__flag").click();
      cy.get("#iti-item-id").click();
      cy.get('input[name="phone-number"]').type(`80000${randomNumber}`);
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").click();
      cy.get(".spinner > .fa").should("be.visible");
      cy.get("#join-existing-account-btn > .btn > .button-text").click();
      cy.get(".spinner > .fa").should("be.visible");
      cy.get('p[class="button-text paragraph button-large"]').should(
        "be.visible"
      );
    });

    it("User successfully verify new account from the email", () => {
      cy.wait(10000);
      cy.request({
        method: "POST",
        url: "https://api.mail.tm/token",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          address: validEmail,
          password: password,
        },
      }).then((response) => {
        token = response.body.token;
        cy.log("Token:", token);

        cy.request({
          method: "GET",
          url: "https://api.mail.tm/messages",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((response) => {
          const url = response.body["hydra:member"][0].downloadUrl;
          expect(response.body["hydra:totalItems"]).to.eq(1);
          cy.log("Number of messages:", response.body["hydra:totalItems"]);
          cy.log("URL", url);
          cy.request({
            method: "GET",
            url: `https://api.mail.tm${url}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then((response) => {
            const responseBody = response.body;

            function extractVerificationLink(data) {
              const parser = new DOMParser();
              const doc = parser.parseFromString(data, "text/html");
              const anchorElements = doc.querySelectorAll("a");
              for (const anchor of anchorElements) {
                if (anchor.textContent.trim().includes("Verify Account")) {
                  return anchor.getAttribute("href");
                }
              }
              console.warn(
                "Verification link not found in email response body."
              );
              return null;
            }

            const verificationUrl = extractVerificationLink(responseBody);
            if (verificationUrl) {
              cy.log(`Extracted verification URL: ${verificationUrl}`);
            } else {
              cy.log("Not Found");
            }

            cy.visit(verificationUrl);
            cy.get(
              '[style=""] > .modal-content > .modal-wrapper > .modal-container'
            ).should("be.visible");
          });
        });
      });
    });

    it("User successfully resend verification link", () => {
      resendEmail = email;
      cy.visit("https://autobahn.security/signup");
      cy.get('input[name="email"]').type(resendEmail);
      cy.get('input[name="password"]').type(password);
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").click();
      cy.get(".spinner > .fa").should("be.visible");
      cy.get('input[name="first-name"]').type("User");
      cy.get('input[name="last-name"]').type("Autobahn");
      cy.get(".placeholderActive").click();
      cy.get("#item-3").click();
      cy.get(".iti__selected-flag > .iti__flag").click();
      cy.get("#iti-item-id").click();
      cy.get('input[name="phone-number"]').type(`80000${randomNumber}`);
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").click();
      cy.get(".spinner > .fa").should("be.visible");
      cy.get("#join-existing-account-btn > .btn > .button-text").click();
      cy.get(".spinner > .fa").should("be.visible");
      cy.get('p[class="button-text paragraph button-large"]').click();
      cy.get(".spinner > .fa").should("be.visible");
      cy.get('p[class="button-text paragraph button-large"]').should(
        "be.visible"
      );

      cy.wait(10000);
      cy.request({
        method: "POST",
        url: "https://api.mail.tm/token",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          address: resendEmail,
          password: password,
        },
      }).then((response) => {
        token = response.body.token;
        cy.log("Token:", token);

        cy.request({
          method: "GET",
          url: "https://api.mail.tm/messages",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((response) => {
          expect(response.body["hydra:totalItems"]).to.eq(2);
          cy.log("Number of messages:", response.body["hydra:totalItems"]);
        });
      });
    });
  });

  describe("User Registration - Negatif Cases", () => {
    it("User can't register with an empty email", () => {
      cy.visit("https://autobahn.security/signup");
      cy.get('input[name="email"]').click();
      cy.get('input[name="password"]').type(password);
      cy.get(".error > .label").should("have.text", "Field cannot be empty");
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").should(
        "not.be.enabled"
      );
    });

    it("User can't register using an invalid email format", () => {
      cy.visit("https://autobahn.security/signup");
      cy.get('input[name="email"]').type("emailtest.com");
      cy.get('input[name="password"]').type(password);
      cy.get(".error > .label").should("have.text", "Must be a valid email");
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").should(
        "not.be.enabled"
      );
    });

    it("User can't register with an empty password", () => {
      cy.visit("https://autobahn.security/signup");
      cy.get('input[name="password"]').click();
      cy.get('input[name="email"]').type(email);
      cy.get("label").should("have.text", "Field cannot be empty");
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").should(
        "not.be.enabled"
      );
    });

    it("User can't register using less than 8 characters on the password", () => {
      cy.visit("https://autobahn.security/signup");
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type("A#1b");
      cy.contains("li", "At least 8 characters").should(
        "not.have.class",
        "is-fulfilled"
      );
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").should(
        "not.be.enabled"
      );
    });

    it("User can't register using space on the password", () => {
      cy.visit("https://autobahn.security/signup");
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type("A# 1bqwe123");
      cy.contains("li", "No empty space").should(
        "not.have.class",
        "is-fulfilled"
      );
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").should(
        "not.be.enabled"
      );
    });

    it("User can't register without uppercase letter on the password", () => {
      cy.visit("https://autobahn.security/signup");
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type("a#1bqwe123");
      cy.contains("li", "One uppercase letter").should(
        "not.have.class",
        "is-fulfilled"
      );
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").should(
        "not.be.enabled"
      );
    });

    it("User can't register without lowercase letter on the password", () => {
      cy.visit("https://autobahn.security/signup");
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type("A#1BQWE123");
      cy.contains("li", "One lowercase letter").should(
        "not.have.class",
        "is-fulfilled"
      );
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").should(
        "not.be.enabled"
      );
    });

    it("User can't register without number on the password", () => {
      cy.visit("https://autobahn.security/signup");
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type("A#AbqweAAA");
      cy.contains("li", "One number").should("not.have.class", "is-fulfilled");
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").should(
        "not.be.enabled"
      );
    });

    it("User can't register without special character on the password", () => {
      cy.visit("https://autobahn.security/signup");
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type("AAAbqwe123");
      cy.contains("li", "One special character").should(
        "not.have.class",
        "is-fulfilled"
      );
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").should(
        "not.be.enabled"
      );
    });

    it("User can't register with an empty first name", () => {
      cy.visit("https://autobahn.security/signup");
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").click();
      cy.get(".spinner > .fa").should("be.visible");
      cy.get('input[name="first-name"]').click();
      cy.get('input[name="last-name"]').type("Autobahn");
      cy.get(".placeholderActive").click();
      cy.get("#item-3").click();
      cy.get(".iti__selected-flag > .iti__flag").click();
      cy.get("#iti-item-id").click();
      cy.get('input[name="phone-number"]').type(`80000${randomNumber}`);
      cy.get(".error > .label").should("have.text", "Field cannot be empty");
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").should(
        "not.be.enabled"
      );
    });

    it("User can't register using symbol on the first name", () => {
      cy.visit("https://autobahn.security/signup");
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").click();
      cy.get(".spinner > .fa").should("be.visible");
      cy.get('input[name="first-name"]').type("S@ya");
      cy.get('input[name="last-name"]').type("Autobahn");
      cy.get(".placeholderActive").click();
      cy.get("#item-3").click();
      cy.get(".iti__selected-flag > .iti__flag").click();
      cy.get("#iti-item-id").click();
      cy.get('input[name="phone-number"]').type(`80000${randomNumber}`);
      cy.get(".error > .label").should(
        "have.text",
        "First name cannot contain symbols"
      );
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").should(
        "not.be.enabled"
      );
    });

    it("User can't register with an empty last name", () => {
      cy.visit("https://autobahn.security/signup");
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").click();
      cy.get(".spinner > .fa").should("be.visible");
      cy.get('input[name="first-name"]').type("Saya");
      cy.get('input[name="last-name"]').click();
      cy.get(".placeholderActive").click();
      cy.get("#item-3").click();
      cy.get(".iti__selected-flag > .iti__flag").click();
      cy.get("#iti-item-id").click();
      cy.get('input[name="phone-number"]').type(`80000${randomNumber}`);
      cy.get("label").should("have.text", "Field cannot be empty");
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").should(
        "not.be.enabled"
      );
    });

    it("User can't register using symbol on the last name", () => {
      cy.visit("https://autobahn.security/signup");
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").click();
      cy.get(".spinner > .fa").should("be.visible");
      cy.get('input[name="first-name"]').type("User");
      cy.get('input[name="last-name"]').type("@uto");
      cy.get(".placeholderActive").click();
      cy.get("#item-3").click();
      cy.get(".iti__selected-flag > .iti__flag").click();
      cy.get("#iti-item-id").click();
      cy.get('input[name="phone-number"]').type(`80000${randomNumber}`);
      cy.get("label").should("have.text", "Last name cannot contain symbols");
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").should(
        "not.be.enabled"
      );
    });

    it("User can't register without choosing an industry", () => {
      cy.visit("https://autobahn.security/signup");
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").click();
      cy.get(".spinner > .fa").should("be.visible");
      cy.get('input[name="first-name"]').type("User");
      cy.get(".placeholderActive").click();
      cy.get('input[name="last-name"]').type("Autobahn");
      cy.get(".iti__selected-flag > .iti__flag").click();
      cy.get("#iti-item-id").click();
      cy.get('input[name="phone-number"]').type(`80000${randomNumber}`);
      cy.get(":nth-child(3) > .label").should(
        "have.text",
        "Field cannot be empty"
      );
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").should(
        "not.be.enabled"
      );
    });

    it("User can't register with an empty phone number", () => {
      cy.visit("https://autobahn.security/signup");
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").click();
      cy.get(".spinner > .fa").should("be.visible");
      cy.get('input[name="first-name"]').type("User");
      cy.get('input[name="last-name"]').type("Autobahn");
      cy.get(".placeholderActive").click();
      cy.get("#item-3").click();
      cy.get('input[name="phone-number"]').click();
      cy.get(".iti__selected-flag > .iti__flag").click();
      cy.get("#iti-item-id").click();
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").should(
        "not.be.enabled"
      );
    });

    it("User can't register with invalid phone number format", () => {
      cy.visit("https://autobahn.security/signup");
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").click();
      cy.get(".spinner > .fa").should("be.visible");
      cy.get('input[name="first-name"]').type("User");
      cy.get('input[name="last-name"]').type("Autobahn");
      cy.get(".placeholderActive").click();
      cy.get("#item-3").click();
      cy.get(".iti__selected-flag > .iti__flag").click();
      cy.get("#iti-item-id").click();
      cy.get('input[name="phone-number"]').type(`10000${randomNumber}`);
      cy.get(".error > .label").should(
        "have.text",
        "Please enter a valid phone number"
      );
      cy.get(".button-wrapper > .custom-button > .btn > .button-text").should(
        "not.be.enabled"
      );
    });
  });
});
