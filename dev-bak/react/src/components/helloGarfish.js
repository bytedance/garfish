import logo from '../assets/logo.svg';
import React from 'react';

export default function HelloGarfish() {
  return (
    <div>
      <h3 data-test="title" style={{ marginTop: '30px', marginBottom: '30px' }}>
        Thank you for the react applications use garfish
      </h3>
      <img src={logo} className="App-logo" alt="logo" />
    </div>
  );
}
