import React from 'react';
import format from 'date-fns/format';
import parseIso from 'date-fns/parseISO';

export default ({ feeds }) => {
  console.log(feeds);
  return (
    <div className="incidents-daily">
      <div className="incidents-daily__title">Third-Party Components</div>
      {feeds &&
        feeds.map(item => (
          <div
            className={`incidents-daily__incident`}
            key={item.url}
          >
            <h6 className="incidents-daily__incident__title">
              <a href={item.url}>{item.source.name}: {item.title}</a>
            </h6>
            <div className="incidents-daily__incident__update__description">
              <div dangerouslySetInnerHTML={{ __html: item.description }} />
            </div>
            <p className="incidents-daily__incident__update__timestamp">
              {format(parseIso(item.date), 'MMMM d, yyyy')}
            </p>
          </div>
        ))}
    </div>
  );
};
