import sortBy from 'sort-by';
import addMinutes from 'date-fns/addMinutes';

import Update from './Update';
import i18n from '../i18n';

export default class Incident {
  constructor(data) {
    this.data = data;
  }

  get id() {
    return this.data.path;
  }

  get slug() {
    return this.data.path
      .split('/')
      .pop()
      .replace(/\.json$/, '');
  }

  get date() {
    return this.firstUpdate.date;
  }

  get affectedComponents() {
    return this.data.components.map(id => i18n[`component.${id}`]);
  }

  get scheduledStart() {
    return this.data.scheduledTime && new Date(this.data.scheduledTime);
  }

  get scheduledEnd() {
    return addMinutes(this.scheduledStart, this.data.minutes);
  }

  get name() {
    return this.data.name;
  }

  get isMaintenance() {
    return !!this.scheduledStart;
  }

  get impact() {
    return this.isMaintenance ? 'maintenance' : this.data.impact;
  }

  get isUnresolved() {
    if (this.isMaintenance) {
      return this.status !== 'completed' && this.status !== 'scheduled';
    }

    return this.status !== 'resolved';
  }

  get status() {
    return this.lastUpdate.status;
  }

  get firstUpdate() {
    return this.updates[this.updates.length - 1];
  }

  get lastUpdate() {
    return this.updates[0];
  }

  get updates() {
    const updates = this.data.updates
      .map(data => new Update(data))
      .sort(sortBy('date'))
      .reverse();

    if (this.isMaintenance) {
      updates.push(
        new Update({
          content: this.data.content,
          status: 'scheduled',
          date: this.scheduledStart,
        }),
      );
    }

    return updates;
  }
}
