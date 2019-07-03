import i18n from '../i18n';

export default class Update {
  constructor(data) {
    this.data = data;
  }

  get content() {
    return this.data.content;
  }

  get contentWithStatus() {
    return `**${this.statusLabel}** — ${this.data.content}`;
  }

  get status() {
    return this.data.status;
  }

  get statusLabel() {
    return i18n[`status.${this.status}`];
  }

  get date() {
    return new Date(this.data.date);
  }
}
