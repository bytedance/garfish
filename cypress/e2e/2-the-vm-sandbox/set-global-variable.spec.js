import { getPublicPath } from '../../../dev/util';
/// <reference types="cypress" />

const basename = '/examples';

const sleep = (time = 200) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

describe('whole process vm sandbox set variable', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false);
    Cypress.env({
      garfishRunConfig: {
        basename: basename,
        disablePreloadApp: true,
        sandbox: {
          snapshot: false,
          fixBaseUrl: true,
        },
      },
    });
  });

  it('set global history variable', () => {
    const ProxyVariableTitle = 'vm sandbox';
    cy.visit('http://localhost:8090');

    cy.window().then((win) => {
      win.history.pushState({}, 'react16', `${basename}/react16/vm-sandbox`);
      cy.contains('[data-test=title]', ProxyVariableTitle)
        .then(() => {
          expect(win.history.scrollRestoration).to.equal('auto');
        })
        .then(() => {
          return cy.get('[data-test=click-set-history-proxy-variable]').click();
        })
        .then(() => {
          expect(win.history.scrollRestoration).to.equal('manual');
        });
    });
  });

  it('instanceof', () => {
    cy.visit('http://localhost:8090');

    cy.window().then((win) => {
      win.history.pushState({}, 'react16', `${basename}/react16/vm-sandbox`);
      cy.contains(
        '[data-test=document-instanceof]',
        'document instanceof Document: true',
      );
      cy.contains(
        '[data-test=document-parentNode]',
        'document.body.parentNode?.parentNode: true',
      );
    });
  });

  it('prefix', () => {
    cy.visit('http://localhost:8090');
    const ProxyVariableTitle = 'vm sandbox';

    cy.window().then((win) => {
      win.history.pushState({}, 'react16', `${basename}/react16/vm-sandbox`);
      cy.contains('[data-test=title]', ProxyVariableTitle).then(() => {
        expect(
          win.document
            .querySelector('[data-test=iframe-pre-fix]')
            .getAttribute('src'),
        ).to.equal(`http:${getPublicPath('dev/react16')}iframe`);
        expect(
          win.document
            .querySelector('[data-test=img-pre-fix]')
            .getAttribute('src'),
        ).to.equal(`http:${getPublicPath('dev/react16')}img`);
      });
    });
  });

  it('close-prefix', () => {
    cy.visit('http://localhost:8090/');

    cy.window().then((win) => {
      win.history.pushState({}, 'react17', `${basename}/react17/home`);
      cy.contains('.title', 'This is React17').then(() => {
        expect(
          win.document
            .querySelector('[data-test=iframe-pre-fix-app-17]')
            .getAttribute('src'),
        ).to.equal('/iframe');
        expect(
          win.document
            .querySelector('[data-test=img-pre-fix-app-17]')
            .getAttribute('src'),
        ).to.equal('/img');
      });
    });
  });
});
