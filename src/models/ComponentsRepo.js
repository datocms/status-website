import Component from './Component'

export default class ComponentsRepo {
  constructor(statusUpdates) {
    this.statusUpdates = statusUpdates;
  }

  get all() {
    return ['cda', 'cma', 'imgix', 'backend', 'dns'].map(id => (
      new Component(id, this.statusUpdates.filter(su => (
        su.component === id
      )))
    ));
  }
}


