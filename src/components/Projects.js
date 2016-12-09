import React from 'react';
import { Link } from 'react-router';
import Auth from '../module/Auth';

class viewProjects extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			projects: []
		};
	}
	componentDidMount()
	{
		var host = this.props.route.getHost()+'/api/';
		var _this = this;
		$.ajax({
			url: host+'proyects',
			method: "GET",
			headers: {
				'Content-type': 'application/x-www-form-urlencoded',
				'Authorization': 'bearer ' + Auth.getToken(),
			},
			dataType: "json",
			success: function(res)
			{
				_this.setState({
					projects: res
				});
						
			}
		});
	}
	render()
	{
		return(
			<div>
				<h1>Proyectos</h1>
				<table className="ui celled table">
					<thead>
						<tr>
							<th>Proyecto</th>
							<th>Lenguaje</th>
							<th>Usuario</th>
							<th>Configurar proyecto local</th>
						</tr>
					</thead>
					<tbody>
						{this.state.projects.map(function(project){
							return(
								<tr key={project._id}>
									<td>{project.name}</td>
									<td>{project.username}</td>
									<td>{project.language}</td>
									<td>
										<Link to={'/projects/'+project._id+'/configure'} className="ui icon blue button">
											<i className="setting icon"></i>
										</Link>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		)
	}
}
export default viewProjects;