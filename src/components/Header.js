import React from 'react';
import { Link } from '@reach/router';
import logo from '../images/logo.svg';
import rss from '../images/rss.svg';
import ClickOutside from 'react-click-outside';

class SubscribeToUpdates extends React.Component {
  state = { isOpen: false };

  handleToggle(isOpen) {
    this.setState({ isOpen });
  }

  render() {
    const { isOpen } = this.state;

    return (
      <div className="subscribe">
        <button
          onClick={this.handleToggle.bind(this, true)}
          className="subscribe__button"
        >
          <img src={rss} />
          Subscribe to Updates
        </button>
        {isOpen && (
          <ClickOutside onClickOutside={this.handleToggle.bind(this, false)}>
            <ul className="subscribe__modal">
              <li>
                <a href="/history.atom" target="_blank">
                  Atom Feed
                </a>
              </li>
              <li>
                <a href="/history.rss" target="_blank">
                  RSS Feed
                </a>
              </li>
              <li>
                <a href="/history.json" target="_blank">
                  JSON Feed
                </a>
              </li>
            </ul>
          </ClickOutside>
        )}
      </div>
    );
  }
}

export default () => (
  <div className="page-header">
    <Link to="/" className="page-header__logo">
      <img src={logo} alt="DatoCMS" />
    </Link>
    <div className="page-header__subscribe">
      <SubscribeToUpdates />
    </div>
  </div>
);
