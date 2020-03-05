import React from 'react';
import Chartist from 'chartist';
import request from 'axios';
import format from 'date-fns/format';
import 'chartist-plugin-tooltips';

import Chart from './Chart';

export default class SystemMetric extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  componentDidMount() {
    this.fetchData(this.props);
  }

  componentWillReceiveProps(newProps) {
    this.fetchData(newProps);
  }

  fetchData({ graph, time }) {
    this.setState({ overTime: null, global: null });

    request
      .get('/.netlify/functions/cloudwatch', {
        params: { graph, time },
      })
      .then(response => {
        const { overTime, global } = response.data;
        this.setState({
          overTime: overTime.map(({ t, v }) => ({ x: new Date(t), y: v })),
          global,
        });
      })
      .catch(data => console.log(data));
  }

  render() {
    const { name, lowY, highY, legend, unit, time } = this.props;
    const { overTime, global } = this.state;

    return (
      <div className="system-metric">
        <div className="system-metric__header">
          <div className="system-metric__name">{this.props.name}</div>
          <div className="system-metric__avg">
            {global ? `${global}${unit}` : 'Loading...'}
          </div>
        </div>
        <div className="system-metric__graph">
          {overTime && (
            <Chart
              type="Line"
              data={{
                series: [overTime],
              }}
              options={{
                height: '150px',
                axisY: {
                  showGrid: false,
                  showLine: false,
                  low: lowY,
                  high: highY,
                  labelInterpolationFnc(value) {
                    return `${value}${unit}`;
                  },
                },
                axisX: {
                  showGrid: false,
                  showLine: false,
                  type: Chartist.FixedScaleAxis,
                  divisor: 5,
                  labelInterpolationFnc: value => {
                    if (time === 'day') {
                      return format(new Date(value), 'HH:mm');
                    }

                    return format(new Date(value), 'MMM d');
                  },
                },
                chartPadding: {
                  top: 15,
                  right: 0,
                  bottom: 0,
                  left: 15,
                },
                fullWidth: true,
                plugins: [
                  Chartist.plugins.tooltip({
                    tooltipFnc: (_, meta) => {
                      const [timestamp, value] = meta.split(/,/);

                      return `
                          <p class='chartist-tooltip-timestamp'>
                            ${format(
                              new Date(parseInt(timestamp)),
                              'EEEE, MMM d, HH:mm',
                            )}
                          </p>
                          <p class='chartist-tooltip-value'>
                            ${legend}: <strong>${value}${unit}</strong>
                          </p>
                        `;
                    },
                  }),
                ],
              }}
            />
          )}
        </div>
      </div>
    );
  }
}
