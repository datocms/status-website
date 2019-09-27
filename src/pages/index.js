import React from 'react';
import { withRouteData, Head } from 'react-static';
import request from 'axios';

import IncidentsRepo from 'models/IncidentsRepo';
import SystemMetrics from 'components/SystemMetrics';

import UnresolvedIncident from 'components/UnresolvedIncident';
import ComponentStatus from 'components/ComponentStatus';
import IncidentsDailyOverview from 'components/IncidentsDailyOverview';
import FutureMaintenances from 'components/FutureMaintenances';
import Header from 'components/Header';
import Footer from 'components/Footer';

const DAYS = 60;

class Homepage extends React.Component {
  state = {
    components: null,
  };

  async componentDidMount() {
    const response = await request.get('/.netlify/functions/componentsStatus', {
      params: { days: DAYS },
    });

    console.log(response.data);

    this.setState({ components: response.data });
  }

  render() {
    const { incidents: incidentsData, incidentsOverviewDays } = this.props;

    const { components } = this.state;

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
          {incidents.unresolved.length === 0 && (
            <div className="all-systems-operational">
              All Systems Operational
            </div>
          )}
        </div>
        <div className="components-status">
          <div className="components-status__title">Components Status</div>
          <div>
            {components &&
              components.map(component => (
                <ComponentStatus
                  key={component.id}
                  id={component.id}
                  regions={component.regions}
                  totalDowntime={component.totalDowntime}
                  daysSince={DAYS}
                />
              ))}
          </div>
        </div>
        <SystemMetrics />
        <FutureMaintenances incidents={incidents} />
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
