import React from 'react/addons';
import Debug from 'debug';
import http from 'http';

import Trigger from 'react-foundation-apps/lib/trigger';
import Modal from 'react-foundation-apps/lib/modal';

var debug = Debug('myApp.OPM')

/*
 * @class OPM
 * @extends React.Component
 */
class OPM extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            chapter:null,
            viewer: null
        };

        debug('construct', this.state);
        this.checkChapter();
    }

    checkChapter() {
        debug('check website');
        http.get('/api/OPM',  (res) => {
            debug(' status: ' + res.statusCode);

            res.on('data', (data) => {
                data = JSON.parse(data);
                debug('new state:' , data);
                this.setState( data );
            });
        });
    }

    /*
     * @method render
     * @returns {JSX}
     */
    render () {
        var nextClass = 'button float-right ';
        if (this.state.currentPos == this.state.id) {
            nextClass += 'disabled';
        }

        return ( <div className="OPM">
            <a target="_blank" href={ this.state.viewer }
                className="success button" > { this.state.chapter } </a>
        </div>);
    }
}

export default OPM;
