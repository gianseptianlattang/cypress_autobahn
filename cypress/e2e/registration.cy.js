describe("User Registration", () => {
  let domainName;
  let email;
  let randomNumber;
  let password = "@Test12345abc";
  let token;

  before(() => {
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

  it("User success regist new account using valid data", () => {
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
    cy.get('input[name="phone-number"]').type(`80000${randomNumber}`);
    cy.get(".button-wrapper > .custom-button > .btn > .button-text").click();
    cy.get(".spinner > .fa").should("be.visible");
    cy.get("#join-existing-account-btn > .btn > .button-text").click();
    cy.get(".spinner > .fa").should("be.visible");
    cy.get('p[class="button-text paragraph button-large"]').should(
      "be.visible"
      // cy.get('p[class="button-text paragraph button-large"]').click();
      // cy.get(".spinner > .fa").should("be.visible");
    );
  });

  it("User success verify new account from email", () => {
    cy.wait(10000);
    cy.request({
      method: "POST",
      url: "https://api.mail.tm/token",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        address: email,
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

          function extractVerificationLink(responseBody) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(responseBody, "text/html");
            const anchorElements = doc.querySelectorAll("a");
            for (const anchor of anchorElements) {
              if (anchor.textContent.trim().includes("Verify Account")) {
                return anchor.getAttribute("href");
              }
            }
            console.warn("Verification link not found in email response body.");
            return null; // Or throw an error if this is critical for your test
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
});
