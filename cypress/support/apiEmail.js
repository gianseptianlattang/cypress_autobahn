const getEmailToken = (validEmail, password) => {
  return cy.request({
    method: "POST",
    url: "https://api.mail.tm/token",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      address: validEmail,
      password: password,
    },
  });
};

const getEmailMessages = (token) => {
  return cy.request({
    method: "GET",
    url: "https://api.mail.tm/messages",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const extractVerificationLink = (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, "text/html");
  const anchorElements = doc.querySelectorAll("a");
  for (const anchor of anchorElements) {
    if (anchor.textContent.trim().includes("Verify Account")) {
      return anchor.getAttribute("href");
    }
  }
  console.warn("Verification link not found in email response body.");
  return null;
};

export const apiEmail = {
  createEmail: (password) => {
    const randomNumber = Math.floor(Math.random() * 90000) + 10000;
    return cy
      .request({
        method: "GET",
        url: "https://api.mail.tm/domains",
      })
      .then((response) => {
        const domainName = response.body["hydra:member"][0].domain;
        return cy
          .request({
            method: "POST",
            url: "https://api.mail.tm/accounts",
            body: {
              address: `autobahn_${randomNumber}@${domainName}`,
              password: password,
            },
          })
          .then((response) => {
            const email = response.body.address;
            return email;
          });
      });
  },

  verifyFromEmail: (validEmail, password) => {
    cy.wait(10000);
    getEmailToken(validEmail, password).then((response) => {
      const token = response.body.token;
      cy.log("Token:", token);
      getEmailMessages(token).then((response) => {
        expect(response.body["hydra:totalItems"]).to.eq(1);
        const url = response.body["hydra:member"][0].downloadUrl;
        cy.log("Number of messages:", response.body["hydra:totalItems"]);
        cy.log("URL", url);
        cy.request({
          method: "GET",
          url: `https://api.mail.tm${url}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((response) => {
          const verificationUrl = extractVerificationLink(response.body);
          if (verificationUrl) {
            cy.log(`Extracted verification URL: ${verificationUrl}`);
            return verificationUrl;
          } else {
            cy.log("Verification URL not found");
            return null;
          }
        });
      });
    });
  },

  assertNumberOfMessage: (resendEmail, password, numberOfMessage) => {
    cy.wait(10000);
    getEmailToken(resendEmail, password).then((response) => {
      const token = response.body.token;
      cy.log("Token:", token);
      getEmailMessages(token).then((response) => {
        expect(response.body["hydra:totalItems"]).to.eq(numberOfMessage);
        cy.log("Number of messages:", response.body["hydra:totalItems"]);
      });
    });
  },
};
