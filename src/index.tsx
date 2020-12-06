import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { AnimateSharedLayout, AnimatePresence } from "framer-motion";
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import Home from './content/pages/home';
import './styling/scss/index.scss';

ReactDOM.render(
  <React.StrictMode>
    <ReactTooltip />
    <div className="container">
      <AnimateSharedLayout type="crossfade">
        <Router>
          <Route key="home" exact path={["/article/:id", "/"]} component={Home} />
        </Router>
      </AnimateSharedLayout>
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
