import 'material-design-icons-iconfont/dist/material-design-icons.css';
import 'material-design-lite/material.css';
import 'material-design-lite/material.min';
import 'babel-polyfill';

import React , { Component , PropTypes } from 'react';
import ReactDOM from 'react-dom';
import {Provider as StoreProvider} from 'react-redux';
import moment from 'moment';
import {Provider as MetadataProvider} from '../behaviours/metadata';
import {Provider as FieldHelpersProvider} from '../behaviours/field';
import {Provider as MasterDataProvider} from '../behaviours/master-data';
import UserDumbComponent from './components/user-dumb';
import InputComponent from '../components/input';
import DevTools from './containers/dev-tools';
import {loadCivility} from './services/load-civility';
import store from './store';

const definitions = {
    user: {
        uuid: { domain: 'DO_RODRIGO', isRequired: false},
        firstName: { domain: 'DO_RODRIGO', isRequired: false},
        lastName: { domain: 'DO_DON_DIEGO', isRequired: true},
        date: { domain: 'DO_DATE', isRequired: false}
    }
}

const domains = {
    DO_RODRIGO: {
        type: 'text',
        validator: [{
            type: 'string',
            options: {
                maxLength: 50
            }
        }],
        formatter: value => 'LOL MOUSTACHE' + value,
        InputComponent
    },
    DO_DON_DIEGO: {
        type: 'text',
        validator: [{
            type: 'string',
            options: {
                maxLength: 200
            }
        }],
        InputComponent
    },
    DO_DATE : {
        InputComponent,
        formatter: date => date ? moment(date, moment.ISO_8601).format('DD/MM/YYYY hh:mm a') : '',
        format: ['DD/MM/YYYY', 'DD-MM-YYYY', 'D MMM YYYY']
    }
}

const App = () => {
    return (
        <StoreProvider store={store}>
            <MetadataProvider definitions={definitions} domains={domains}>
                <MasterDataProvider configuration={[{name: 'civility', service: loadCivility}]}>
                    <div>
                        <DevTools />
                        <FieldHelpersProvider>
                            <div>
                                <h1>User Dumb</h1>
                                <UserDumbComponent id={1234} />
                            </div>
                        </FieldHelpersProvider>
                    </div>
                </MasterDataProvider>
            </MetadataProvider>
        </StoreProvider>
    )
}

// Create the react component when the DOM is loaded.
document.addEventListener('DOMContentLoaded', (event) => {

    const rootElement = document.querySelector(`.${__ANCHOR_CLASS__}`);
    const PAGE_TITLE = 'Great example page';
    // The child must be wrapped in a function
    // to work around an issue in React 0.13.
    ReactDOM.render(
        <div className='mdl-layout  mdl-layout--fixed-header'>
            <header className='mdl-layout__header'>
                <div className='mdl-layout__header-row'>
                    <span className='mdl-layout-title'>{PAGE_TITLE}</span>
                    <div className='mdl-layout-spacer'></div>
                    <nav className='mdl-navigation mdl-layout--large-screen-only'>
                        <a className='mdl-navigation__link' href=''>Link</a>
                        <a className='mdl-navigation__link' href=''>Link</a>
                        <a className='mdl-navigation__link' href=''>Link</a>
                    </nav>
                </div>
            </header>
            <main className='mdl-layout__content' style={{zIndex: 3}}>
                <App />
            </main>
        </div>,
        rootElement);
    });
