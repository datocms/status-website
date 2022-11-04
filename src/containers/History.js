import React from 'react';
import { withRouteData, Head } from 'react-static';
import { Link } from '@reach/router';
import IncidentsRepo from '../models/IncidentsRepo';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import Header from '../components/Header';

import leftIcon from '../images/cheveron-left.svg';
import rightIcon from '../images/cheveron-right.svg';

class History extends React.Component {
  renderIncident(incident) {
    return (
      <div
        className={`history__incident history__incident--impact-${incident.impact}`}
        key={incident.slug}
      >
        <h6 className="history__incident__title">
          <Link to={`/incidents/${incident.slug}/`}>{incident.name}</Link>
        </h6>
        <div className="history__incident__body">
          <div>{incident.lastUpdate.content}</div>
          <div className="history__incident__timestamp">
            {format(incident.firstUpdate.date, 'MMM d, HH:mm')} -{' '}
            {format(incident.lastUpdate.date, 'MMM d, HH:mm OOOO')}
          </div>
        </div>
      </div>
    );
  }

  renderMonth({ month, incidents }) {
    return (
      <div className="history__month" key={month}>
        <h5 className="history__month__title">
          {format(parseISO(month), 'MMMM yyyy')}
        </h5>
        <div>
          {incidents.length === 0 ? (
            <p className="history__month__no-incidents">
              No incidents reported.
            </p>
          ) : (
            new IncidentsRepo(incidents).all.map(this.renderIncident.bind(this))
          )}
        </div>
      </div>
    );
  }

  render() {
    const { incidentsByMonth, nextPath, prevPath } = this.props;

    return (
      <div className="page-container">
        <Head>
          <meta charSet="UTF-8" />
          <title>Incidents History - DatoCMS Status</title>
        </Head>
        <Header />
        <div className="history">
          <div className="history__header">
            <div className="history__header__title">Incidents history</div>
            <div className="history__header__nav">
              {prevPath && (
                <Link
                  to={prevPath}
                  className="history__button history__button--prev"
                >
                  <img src={leftIcon} />
                </Link>
              )}
              <span>
                {format(parseISO(incidentsByMonth[0].month), 'MMMM yyyy')} to{' '}
                {format(
                  parseISO(incidentsByMonth[incidentsByMonth.length - 1].month),
                  'MMMM yyyy',
                )}
              </span>
              {nextPath && (
                <Link
                  to={nextPath}
                  className="history__button history__button--next"
                >
                  <img src={rightIcon} />
                </Link>
              )}
            </div>
          </div>
          {incidentsByMonth.map(this.renderMonth.bind(this))}
        </div>
      </div>
    );
  }
}

export default withRouteData(History);
