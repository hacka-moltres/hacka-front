import Home from 'components/pages/Home';
import React, { Fragment } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import 'assets/css/global.css';

export default () => (
  <Fragment>
    <Router>
      <Switch>
        <Route path='/' exact component={Home} />
      </Switch>
    </Router>
  </Fragment>
);
