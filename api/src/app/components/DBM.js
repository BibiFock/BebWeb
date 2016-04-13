import React from 'react/addons';
import Debug from 'debug';
import http from 'http';

import Trigger from 'react-foundation-apps/lib/trigger';
import Modal from 'react-foundation-apps/lib/modal';

var debug = Debug('myApp.DBM')

/*
 * @class DBM
 * @extends React.Component
 */
class DBM extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            lastDownloadTime: null,
            thumb:null,
            image:null,
            id:null,
            currentImg: null,
            currentPos: null
        };

        debug('DBM construct', this.state);
        this.checkImg();
    }

    checkImg() {
        debug('DBM check website');
        http.get('/api/DBM',  (res) => {
            debug(' status: ' + res.statusCode);

            res.on('data', (data) => {
                data = JSON.parse(data);
                data.id = parseInt(data.id);
                data.currentImg = data.image;
                data.currentPos = data.id;

                debug('new state:' , data);
                this.setState.lastDownloadTime = Date.now();
                this.setState( data );
            });
        });
    }

    /*
     * @method shouldComponentUpdate
     * @returns {Boolean}
     */
    shouldComponentUpdate () {
        var results = React.addons.PureRenderMixin.shouldComponentUpdate.apply(this, arguments);
        return results;
    }

    updateImg(iteration) {
        this.setState({
            currentImg: this.state.currentImg.replace(
                this.state.currentPos,
                iteration + this.state.currentPos
            ),
            currentPos: iteration + this.state.currentPos
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

        return ( <div className="DBM">
            <Trigger open="DBMModal">
                <img src={ this.state.thumb } className="cursor-pointer" />
            </Trigger>
            <Modal id="DBMModal" overlay={true} overlayClose={true}>
                <Trigger close="">
                    <a href="#" className="close-button">&times;</a>
                </Trigger>
                <div className="grid-block vertical ">
                    <img src={ this.state.currentImg  } />
                    <div className="clearfix">
                    <a onClick={ this.updateImg.bind(this, -1) } className="button">Prev</a>
                    <a onClick={ this.updateImg.bind(this, 1) } className={ nextClass }>Next</a>
                    </div>
                </div>
            </Modal>
        </div>);
    }
}

export default DBM;
