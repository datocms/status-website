import React from 'react';
import format from 'date-fns/format';
import subDays from 'date-fns/subDays';
import formatDistance from 'date-fns/formatDistanceStrict';
import addSeconds from 'date-fns/addSeconds';

import i18n from '../i18n';

const generateDatesSince = days => {
  const dates = [];

  for (let i = 0; i < days; i++) {
    dates.push(subDays(new Date(), days - i + 1));
  }

  return dates;
};

export default ({ regions, daysSince }) => (
  <div className="daily-outage">
    <svg
      preserveAspectRatio="none"
      height="34"
      viewBox={`0 0 ${8 * daysSince - 2} 34`}
    >
      {generateDatesSince(daysSince).map((date, i) => {
        const downtimePerRegion = regions.map(({ id, outagesPerDay }) => {
          const day = outagesPerDay.find(
            ({ date: d }) => d === format(date, 'yyyy-MM-dd'),
          );
          return { id, downtime: day ? day.downtime : 0 };
        });

        const totalDowntime = downtimePerRegion.reduce(
          (acc, { downtime }) => acc + downtime,
          0,
        );

        const color = totalDowntime > 0 ? '#f1c40f' : '#2fcc66';

        let message;

        if (totalDowntime === 0) {
          message = 'No downtime reported for this day';
        } else if (regions.length > 1) {
          message = downtimePerRegion
            .filter(({ downtime }) => downtime > 0)
            .map(
              ({ id, downtime }) =>
                `${formatDistance(
                  new Date(),
                  addSeconds(new Date(), downtime),
                )} of outage in ${i18n[`region.${id}`]}`,
            )
            .join('</p><p>');
        } else {
          const time = formatDistance(
            new Date(),
            addSeconds(new Date(), downtimePerRegion[0].downtime),
          );
          message = `${time} of outage`;
        }

        return (
          <rect
            key={date}
            height="34"
            width="7"
            x={8 * i}
            y="0"
            data-tip={`
              <div><strong>${format(date, 'MMMM d')}</strong></div>
              <div><p>${message}</p></div>
            `}
            fill={color}
          />
        );
      })}
    </svg>
  </div>
);
