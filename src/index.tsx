import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { AnimateSharedLayout, AnimatePresence } from "framer-motion";
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './Content/Pages/Home';
import About from './Content/Pages/About';
import './index.scss';

ReactDOM.render(
  <React.StrictMode>
    <AnimateSharedLayout type="crossfade">
    <Router>
          <AnimatePresence exitBeforeEnter initial={false}>
              <Route exact path="/" component={Home} />
              <Route exact path="/about" component={About} />
          </AnimatePresence>
    </Router>
    </AnimateSharedLayout>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
