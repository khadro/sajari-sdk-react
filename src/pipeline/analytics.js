import GA from "sajari-react/ui/Analytics/ga";

import './polyfill' // for .startsWith

class Analytics {
  constructor(state, ga = new GA()) {
    window.addEventListener("beforeunload", this.beforeunload);
    this.state = state;
    this.ga = ga;

    this.enabled = false;
    this.body = "";

    this.onChange = this.onChange.bind(this);

    state.registerChangeListener(this.onChange);
  }

  beforeunload() {
    if (this.enabled && this.body) {
      this.ga.onPageClose(this.body);
    }
  }

  onChange() {
    const searchResponse = this.state.getResults();
    // Enable analytics once a successful search has been performed
    if (searchResponse && searchResponse.results) {
      this.enabled = true;
    }

    const values = this.state.getValues();
    const newBody = values["q.used"] || values.q || "";

    if (
      this.enabled &&
      this.body &&
      // This will send unneccesary search analytics
      // events when backspacing from 3 letters to 0
      !newBody.startsWith(this.body.substr(0, 3))
    ) {
      this.ga.onBodyReset(this.body);
    }
    this.body = newBody;
  }

  resultClicked() {
    if (this.enabled && this.body) {
      this.ga.onResultClicked(this.body);
    }
  }
}

export default Analytics