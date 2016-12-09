import React from 'react';
import { Link, hashHistory } from 'react-router';
import Auth from '../module/Auth';
const {ipcRenderer} = require('electron');

class Login extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state =
		{
			errorMessage: '',
			errors: {},
			host: '',
			email: ''
		};
	}
	componentDidMount()
	{
		var _this = this;
		ipcRenderer.send('get-login-data');
		ipcRenderer.on('sentLoginData', function(event, arg){
			console.log(arg);
			if(arg)
			{
				_this.setState({
					host: arg.host,
					email: arg.email
				});
			}
		});
	}
	processForm(event) {
		$('#overlay').addClass('active');
		event.preventDefault();
		this.props.route.setHost(this.state.host);
		let self = this;
		let data = { email: this.state.email, password: this.refs.pass.value };
		$.ajax({
			url: self.props.route.getHost()+'/login',
			method: 'POST',
			data: data,
			timeout: 15000
		})
		.done(function(data)
		{
			ipcRenderer.send("set-login-data", { host: self.props.route.getHost(), email: self.state.email });
			console.log(data);
			self.setState({
				errorMessage: '',
				errors: {}
			});
			$('#overlay').removeClass('active');
			Auth.authenticateUser(data.token);
			hashHistory.push('/projects');
		})
		.fail(function(data)
		{
			$('#overlay').removeClass('active');
			console.log(data);
			self.setState({
				errorMessage: data.responseJSON.message,
				errors: data.responseJSON.errors
			});
		 });
	}
	updateHost = (e) =>
	{
		this.setState({ host: e.target.value });
	}
	updateEmail = (e) =>
	{
		this.setState({ email: e.target.value });
	}
	render()
	{
		return (
			<div className="ui middle aligned center aligned grid login">
				<div className="column">
			    	<h2 className="ui black image header">
				    	<div className="content">
				    		NMS
				    	</div>
				    </h2>
				    <form action="/services" className="ui large form" onSubmit={this.processForm.bind(this)}>
				    	<div className="ui stacked segment">
				    		<div className="field">
				    			<div className="ui left icon input">
				    				<i className="server icon"></i>
				    				<input type="text" name="host" placeholder="IP o host del servidor" value={this.state.host} onChange={this.updateHost}/>
				    			</div>
				    		</div>
				    		<div className="field">
				    			<div className="ui left icon input">
				    				<i className="user icon"></i>
				    				<input type="text" name="email" placeholder="E-mail address" value={this.state.email} onChange={this.updateEmail}/>
				    			</div>
				    		</div>
				    		<div className="field">
				    			<div className="ui left icon input">
				    				<i className="lock icon"></i>
				    				<input type="password" name="password" placeholder="Password" ref="pass"/>
				    			</div>
				    		</div>
				    		<input type="submit" value="Acceder" className="ui fluid large teal submit button" />
				    	</div>
				    </form>
				    {this.state.errorMessage && <p className="ui error message">{this.state.errorMessage}</p>}
				</div>
			</div>
		);
	}
}

export default Login;