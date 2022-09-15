import React from 'react';
import DailyOutage from './DailyOutage';
import i18n from '../i18n';

export default ({ loading, id, daysSince, regions, totalDowntime }) => {
  const problematicRegions = loading
    ? []
    : regions.filter(region => region.status !== 'up');

  const status = problematicRegions.length > 0 ? 'down' : 'operational';

  const periodInMs = daysSince * 60 * 60 * 24;

  return (
    <div className={`component-status component-status--status-${status}`}>
      <div className="component-status__header">
        <div className="component-status__name">
          {loading ? 'Loading...' : i18n[`component.${id}`]}
        </div>
        <div className="component-status__status">
          {loading ? '' : i18n[`status.${status}`]}
        </div>
      </div>
      <DailyOutage
        loading={loading}
        regions={loading ? [{ id: 'foo', outagesPerDay: [] }] : regions}
        daysSince={daysSince}
      />
      <div className="component-status__footer">
        <div className="component-status__left">{daysSince} days ago</div>
        <div className="component-status__uptime">
          {loading ? (
            'Loading...'
          ) : (
            <>
              {Math.round(
                ((periodInMs - totalDowntime) / periodInMs) * 100000,
              ) / 1000}
              %&nbsp;uptime
            </>
          )}
        </div>
        <div className="component-status__right">Today</div>
      </div>
    </div>
  );
};
