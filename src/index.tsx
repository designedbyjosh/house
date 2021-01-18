import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { AnimateSharedLayout } from "framer-motion";
import { BrowserRouter as Router, Route } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import Home from './content/pages/home';
import './styling/scss/index.scss';
import { Provider } from 'react-redux';
import store from './store';

ReactDOM.render(
  <React.StrictMode>
    <ReactTooltip />
    <div className="container">
      <Provider store={store}>
        <AnimateSharedLayout type="crossfade">
          <Router>
            <Route key="home" exact path={["/article/:id", "/"]} component={Home} />
          </Router>
        </AnimateSharedLayout>
      </Provider>
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
