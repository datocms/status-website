import React from 'react'
import { Link } from '@reach/router'

export default ({ linkLabel, linkUrl }) => (
  <div className="page-footer">
    <div className="page-footer__link">
      <Link to={linkUrl}>{linkLabel}</Link>
    </div>
    <div className="page-footer__other">
      Hosted on Netlify
    </div>
  </div>
);

