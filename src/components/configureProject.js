import React from 'react';
import { Link } from 'react-router';
import Auth from '../module/Auth';
const {ipcRenderer} = require('electron');

class configureProject extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			path:'',
			files: [],
			direcs: [],
			project: {},
			_isMounted: false
		};
	}
	componentDidMount()
	{
		this.state._isMounted = true;
		var host = this.props.route.getHost()+'/api/';
		console.log(host);
		var _this = this;
		var id = this.props.params.id;
		$('#overlay').addClass('active');
		$.ajax({
			url: host+'proyects/view/'+id,
			method: "GET",
			headers: {
				'Content-type': 'application/x-www-form-urlencoded',
				'Authorization': 'bearer ' + Auth.getToken(),
			},
			dataType: "json",
			success: function(res)
			{
				$('#overlay').removeClass('active');
				_this.setState({
					project: res
				});
						
			}
		});

		ipcRenderer.send('get-saved-path', this.props.params.id);
		ipcRenderer.on('sentPath', function(event, arg){
			console.log(arg);
			_this.setState({
				path: arg.path
			});
		});
		ipcRenderer.on('finishedUpload', function(event, arg){
			console.log(arg);
			$('#overlay').removeClass('active');
			var arrayvar = _this.state.files.slice();
			arrayvar.forEach(function(file){
				file.upload = false;
			});
			_this.setState({
				files: arrayvar
			});
			var arrayvar = _this.state.direcs.slice();
			arrayvar.forEach(function(dir){
				dir.upload = false;
			});
			_this.setState({
				direcs: arrayvar
			});
		});
		ipcRenderer.on('obtained-path', function(event, arg){
			console.log(arg);
			_this.setState({
				path: arg
			});
		});
		ipcRenderer.on('file-modified', function(event, path, e){
			if(e === "addDir")
			{
				if(path)
				{
					var arrayvar = _this.state.direcs.slice();
					var obj = {path: path, event: e, upload: true }
					arrayvar.push(obj)
					_this.setState({
						direcs: arrayvar
					});
				}
			}
			else if(e === "add")
			{
				if(path)
				{
					var arrayvar = _this.state.files.slice();
					var obj = {path: path, event: e, upload: true}
					arrayvar.push(obj)
					_this.setState({
						files: arrayvar
					});
				}
			}
		});
	}
	updateAllItems(type, value)
	{
		console.log(type, value);
		var arrayvar;
		var prop;
		if(type === "files")
		{
			arrayvar = this.state.files.slice();
		}
		else
		{
			arrayvar = this.state.direcs.slice();
		}
		arrayvar.forEach(function(item){
			item.upload = value;
		});
		this.setState(
		{
			type: arrayvar
		});
	}
	componentWillUnmount()
	{
		this.state._isMounted = false;
	}
	openDialog()
	{
		ipcRenderer.send('open-dialog', this.props.params.id);
	}
	startWatching()
	{
		ipcRenderer.send('start-watching', this.state.path, this.props.params.id);
	}
	stopWatching()
	{
		ipcRenderer.send('stop-watching');
	}
	sendPaths = () =>
	{
		$('#overlay').addClass('active');
		ipcRenderer.send('sendPaths', { files: this.state.files, direcs: this.state.direcs, localPath: this.state.path, remotePath: this.state.project.route, host: this.props.route.getHost()});
	}
	updateFileStatus = (id, event) =>
	{
		console.log(id, event.target.checked);
		var arr = this.state.files;
		arr[id]["upload"] = event.target.checked;
		this.setState({ files: arr});
	}
	updateDirecStatus = (id, event) =>
	{
		console.log(id, event.target.checked);
		var arr = this.state.direcs;
		arr[id]["upload"] = event.target.checked;
		this.setState({ direcs: arr});
	}
	render()
	{
		return(
			<div className="app ui grid container">
				<aside className="primary-aside four wide column">
					<div className="ui segment">
						<Link to={'projects/'} className="ui blue button">
							Regresar a proyectos
						</Link>
					</div>
				</aside>
				<main className="twelve wide column">
					<div className="ui segment">
						<h1>Configurar Proyecto</h1>
						<div className="ui segments">
							<div className="ui segment">
								<button className="ui blue button" onClick={this.openDialog.bind(this)}>Seleccionar carpeta</button>
								Carpeta local: { this.state.path }
							</div>
							<div className="ui segment">
								<button className="ui green button" onClick={this.startWatching.bind(this)}>Iniciar monitoreo</button>
							</div>
							<div className="ui segment">
								<button className="ui red button" onClick={this.stopWatching.bind(this)}>Detener monitoreo</button>
							</div>
						</div>
						<div className="ui divider"></div>
						<h3>Archivos</h3>
						<div className="ui inverted segment">
							<div className="ui inverted relaxed divided list">
								{this.state.files.map(function(file, index){
									return(
										<div className="item">
											<div className="content">
												<div className="header">{file.path}</div>
												{file.event}
											</div>
											<input type="checkbox" checked={file.upload} onChange={this.updateFileStatus.bind(this,index)} key={index}/>
										</div>
									);
								}, this)}
							</div>
							<button className="ui button" onClick={this.updateAllItems.bind(this, "files", true)}>Seleccionar todos</button>
							<button className="ui button" onClick={this.updateAllItems.bind(this, "files", false)}>Deseleccionar todos</button>
						</div>
						<div className="ui divider"></div>
						<h3>Carpetas</h3>
						<div className="ui inverted segment">
							<div className="ui inverted relaxed divided list">
								{this.state.direcs.map(function(direc, index){
									return(
										<div className="item">
											<div className="content">
												<div className="header">{direc.path}</div>
												{direc.event}
											</div>
											<input type="checkbox" checked={direc.upload} onChange={this.updateDirecStatus.bind(this,index)} key={index}/>
										</div>
									);
								}, this)}
							</div>
						</div>
						<button className="ui button" onClick={this.updateAllItems.bind(this, "direcs", true)}>Seleccionar todos</button>
						<button className="ui button" onClick={this.updateAllItems.bind(this, "direcs", false)}>Deseleccionar todos</button>
						<div className="ui divider"></div>
						<button className="ui button blue" onClick={this.sendPaths}>Subir archivos seleccionados</button>
					</div>
				</main>
			</div>
		)
	}
}
export default configureProject;