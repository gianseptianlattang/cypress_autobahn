export const Common = {
  visitUrl: (url) => {
    cy.visit(url);
    cy.wait(2000);
  },
};
