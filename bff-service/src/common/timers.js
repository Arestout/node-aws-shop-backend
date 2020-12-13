class TimersManager {
  constructor() {
    this.timers = [];
    this.maxDuration = 120000;
    this.logs = [];
  }

  add(timer, ...args) {
    this.timers.forEach(addedTimer => {
      if (addedTimer.startName) {
        throw new Error('Timer started');
      }
    });

    const isAdded = this.timers.find(
      thisTimer => thisTimer.name === timer.name
    );
    if (isAdded) {
      throw new Error('Timer already added');
    }

    if (!timer.name || typeof timer.name !== 'string') {
      throw new Error('Wrong name');
    }

    if (!timer.job || typeof timer.job !== 'function') {
      throw new Error('Wrong job');
    }

    if (args.length) {
      timer.job = timer.job.bind(this, ...args);
      timer.jobArgs = [...args];
    }

    this.timers.push(timer);
    this.start(timer);
    return this;
  }

  start(timer) {
    timer.start = new Date().getTime();

    timer.startName = setTimeout(() => {
      timer.job;
      this.remove(timer.startName);
      this._log(timer);
    }, this.maxDuration);
  }

  remove(timerName) {
    clearTimeout(timerName);
    this.timers = this.timers.filter(listTimer => listTimer.name !== timerName);
  }

  killTimer() {
    setTimeout(
      () => this.timers.forEach(timer => clearTimeout(timer.startName)),
      this.maxDuration + 10000
    );
  }

  _log(timer) {
    this.logs.push({
      name: timer.name,
      in: timer.jobArgs,
      out: timer.job(),
      created: new Date()
    });
  }

  print() {
    console.log('this.logs: ', this.logs);
    return this.logs;
  }
}

module.exports = TimersManager;
