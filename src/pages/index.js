import React from 'react'
import { withRouteData, Head } from 'react-static'
import { Link } from '@reach/router'
import ReactTooltip from 'react-tooltip'

import IncidentsRepo from '../models/IncidentsRepo'
import ComponentsRepo from '../models/ComponentsRepo'
import SystemMetrics from '../components/SystemMetrics';

import UnresolvedIncident from '../components/UnresolvedIncident';
import ComponentStatus from '../components/ComponentStatus';
import IncidentsDailyOverview from '../components/IncidentsDailyOverview';
import FutureMaintenances from '../components/FutureMaintenances';
import Header from '../components/Header'
import Footer from '../components/Footer'

class Homepage extends React.Component {
  render() {
    const {
      incidents: incidentsData,
      statusUpdates: statusUpdatesData,
      incidentsOverviewDays
    } = this.props;

    const incidents = new IncidentsRepo(incidentsData);
    const components = new ComponentsRepo(statusUpdatesData);

    return (
      <div className="page-container">
        <Head>
          <meta charSet="UTF-8" />
          <title>DatoCMS Status</title>
        </Head>
        <ReactTooltip
          html={true}
          delayShow={100}
          className="tooltip"
        />
        <Header />
        <div className="unresolved-incidents">
          {
            incidents.unresolved.map(incident => (
              <UnresolvedIncident
                key={incident.id}
                incident={incident}
              />
            ))
          }
          {
            incidents.unresolved.length === 0 &&
              <div className="all-systems-operational">
                All Systems Operational
              </div>
          }
        </div>
        <div className="components-status">
          <div className="components-status__title">
            Components Status
          </div>
          <div>
            {
              components.all.map(component => (
                <ComponentStatus
                  key={component.id}
                  component={component}
                />
              ))
            }
          </div>
        </div>
        <SystemMetrics />
        <FutureMaintenances incidents={incidents} />
        <IncidentsDailyOverview
          incidents={incidents}
          daysCount={incidentsOverviewDays}
        />
        <Footer
          linkLabel="Incidents History"
          linkUrl="/history/"
        />
      </div>
    );
  }
}

export default withRouteData(Homepage);
