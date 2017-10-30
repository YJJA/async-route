import React from 'react'
import {render} from 'react-dom'
import {BrowserRouter} from 'react-router-dom'
import AsyncRoutes from '../lib/index'
import routes from './routes'

render(
	<BrowserRouter>
		<AsyncRoutes routes={routes} />
	</BrowserRouter>,
	document.getElementById('app')
)