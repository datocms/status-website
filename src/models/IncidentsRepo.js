import sortBy from 'sort-by';
import startOfDay from 'date-fns/startOfDay';
import isEqual from 'date-fns/isEqual';
import startOfMonth from 'date-fns/startOfMonth';

import Incident from './Incident';

export default class IncidentsRepo {
  constructor(data) {
    this.data = data;
  }

  get unresolved() {
    return this.all.filter(incident => incident.isUnresolved);
  }

  allSince(date) {
    return this.all.filter(incident => incident.date > date);
  }

  get first() {
    return this.all[this.all.length - 1];
  }

  ofMonth(date) {
    return this.all.filter(incident =>
      isEqual(startOfMonth(incident.date), startOfMonth(date)),
    );
  }

  ofDay(date) {
    return this.all.filter(incident => {
      if (isEqual(startOfDay(incident.date), startOfDay(new Date()))) {
        return (
          !incident.isMaintenance &&
          isEqual(startOfDay(incident.date), startOfDay(date))
        );
      }

      return isEqual(startOfDay(incident.date), startOfDay(date));
    });
  }

  get futureMaintenances() {
    return this.all.filter(
      incident => incident.isMaintenance && incident.status === 'scheduled',
    );
  }

  get past() {
    return this.all.filter(incident => incident.date < new Date());
  }

  get all() {
    return this.data
      .map(incidentData => new Incident(incidentData))
      .sort(sortBy('date'))
      .reverse();
  }
}
