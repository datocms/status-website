import React from 'react';
import SystemMetric from '../components/SystemMetric';

export default class SystemMetrics extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = { period: 'day' };
  }

  handleChangePeriod(period) {
    this.setState({ period });
  }

  render() {
    const { period } = this.state;

    return (
      <div className="system-metrics">
        <div className="system-metrics__header">
          <div className="system-metrics__title">System Metrics</div>
          <div className="system-metrics__period">
            <button
              className={period === 'day' ? 'is-active' : ''}
              onClick={this.handleChangePeriod.bind(this, 'day')}
            >
              Day
            </button>
            <button
              className={period === 'week' ? 'is-active' : ''}
              onClick={this.handleChangePeriod.bind(this, 'week')}
            >
              Week
            </button>
            <button
              className={period === 'month' ? 'is-active' : ''}
              onClick={this.handleChangePeriod.bind(this, 'month')}
            >
              Month
            </button>
          </div>
        </div>

        <SystemMetric
          name="Content Delivery API response time"
          legend="Response time"
          unit="ms"
          graph="cda.responseTime"
          lowY={0}
          highY={500}
          time={period}
        />

        <SystemMetric
          name="API success rate"
          legend="Success rate"
          graph="api.successRate"
          time={period}
          unit="%"
          lowY={90}
          highY={100}
        />
      </div>
    );
  }
}
