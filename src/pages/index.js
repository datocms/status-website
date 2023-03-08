import React from 'react';
import { withRouteData, Head } from 'react-static';
import request from 'axios';

import IncidentsRepo from 'models/IncidentsRepo';
import SystemMetrics from 'components/SystemMetrics';

import UnresolvedIncident from 'components/UnresolvedIncident';
import ComponentStatus from 'components/ComponentStatus';
import DailyOutage from 'components/DailyOutage';
import IncidentsDailyOverview from 'components/IncidentsDailyOverview';
import ThirdPartyComponents from 'components/ThirdPartyComponents';
import Header from 'components/Header';
import Footer from 'components/Footer';

const DAYS = 60;

class Homepage extends React.Component {
  state = {
    components: null,
    feeds: null,
  };

  componentDidMount() {
    request
      .get('/.netlify/functions/component-status', {
        params: { days: DAYS },
      })
      .then(({ data }) => this.setState({ components: data }));

    request
      .get('/.netlify/functions/feeds')
      .then(({ data }) => this.setState({ feeds: data }));
  }

  render() {
    const { incidents: incidentsData, incidentsOverviewDays } = this.props;

    const { components, feeds } = this.state;

    const incidents = new IncidentsRepo(incidentsData);

    return (
      <div className="page-container">
        <Head>
          <meta charSet="UTF-8" />
          <title>DatoCMS Status</title>
        </Head>
        <Header />
        <div className="unresolved-incidents">
          {incidents.unresolved.map(incident => (
            <UnresolvedIncident key={incident.id} incident={incident} />
          ))}
          {incidents.futureMaintenances.map(incident => (
            <UnresolvedIncident key={incident.id} incident={incident} />
          ))}
        </div>
        <div className="components-status">
          <div className="components-status__title">Components Status</div>
          <div>
            {(components || Array.from(Array(6).keys())).map((component, i) => (
              <ComponentStatus
                key={i}
                daysSince={DAYS}
                {...(typeof component === 'object'
                  ? {
                    id: component.id,
                    regions: component.regions,
                    totalDowntime: component.totalDowntime,
                  }
                  : { loading: true })}
              />
            ))}
          </div>
        </div>
        <SystemMetrics />
        <ThirdPartyComponents feeds={feeds} />
        <IncidentsDailyOverview
          incidents={incidents}
          daysCount={incidentsOverviewDays}
        />
        <Footer linkLabel="Incidents History" linkUrl="/history/" />
      </div>
    );
  }
}

export default withRouteData(Homepage);
