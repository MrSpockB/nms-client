import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, hashHistory, IndexRoute } from 'react-router';


import Login from './components/Login';
import Projects from './components/Projects';
import configureProject from './components/configureProject';

var host = "";

function setHost(newHost)
{
	console.log(newHost);
	host = newHost;
}
function getHost()
{
	return host;
}

const router = (
	<Router history={hashHistory}>
		<Route path="/" component={Login} setHost={setHost} getHost={getHost} />
		<Route path="projects">
				<IndexRoute component={Projects} getHost={getHost} />
				<Route path=":id/configure" component={configureProject} getHost={getHost} />
		</Route>
	</Router>
);

ReactDOM.render(router, document.getElementById('content'));