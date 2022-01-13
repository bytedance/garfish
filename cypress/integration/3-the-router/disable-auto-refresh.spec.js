/// <reference types="cypress" />

const basename = '/garfish-app';

describe('whole process popstate event', () => {
  beforeEach(() => {
    Cypress.env({
      garfishRunConfig: {
        basename: basename,
        disablePreloadApp: false,
        autoRefreshApp: false, // Don't trigger popstate
      },
    });
  });

  let popstateTriggerTime = 0;
  const popstateCallback = () => (popstateTriggerTime += 1);

  it('Switch to the Vue app', () => {
    const VueHomeTitle = 'Thank you for the vue applications use garfish';
    const ReactHomeTitle = 'Thank you for the react applications use garfish';

    cy.visit('http://localhost:8090');

    cy.window().then((win) => {
      // Monitoring popstate call time
      win.addEventListener('popstate', popstateCallback);

      const TodoListPage = () => {
        // autoRefreshApp is false can't refreshApp
        win.history.pushState({}, 'vue', `${basename}/vue/todo`);
        cy.contains('[data-test=title]', VueHomeTitle);
      };

      const ReactHomePage = () => {
        win.history.pushState({}, 'react', `${basename}/react`);
        cy.contains('[data-test=title]', ReactHomeTitle);
      };

      const ReactLazyComponent = () => {
        // lazy component
        win.history.pushState({}, 'react', `${basename}/react/lazy-component`);
        cy.contains('[data-test=title]', ReactHomeTitle);
      };

      win.history.pushState({}, 'vue', `${basename}/vue`);
      cy.contains('[data-test=title]', VueHomeTitle)
        .then(() => expect(win.Garfish.options.autoRefreshApp).to.equal(false))
        .then(TodoListPage)
        .then(() => expect(popstateTriggerTime).to.equal(0))
        .then(ReactHomePage)
        .then(() => expect(popstateTriggerTime).to.equal(0))
        .then(ReactLazyComponent)
        .then(() => expect(popstateTriggerTime).to.equal(0));
    });
  });
});
