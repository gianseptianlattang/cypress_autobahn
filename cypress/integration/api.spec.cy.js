Cypress.Commands.add("createEmail", () => {
  let randomNumber = Math.floor(Math.random() * 90000) + 10000;
  let password = "@Test12345abc";

  return cy
    .request({
      method: "GET",
      url: "https://api.mail.tm/domains",
    })
    .then((response) => {
      const domainName = response.body["hydra:member"][0].domain;
      cy.log("Domain:", domainName);
      expect(response.status).to.eq(200);

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
          cy.log("Response:", email);
          expect(response.status).to.eq(201);

          return { email, randomNumber, password };
        });
    });
});
