import path from 'path';
import Express from 'express';
import childProcess from 'child_process';
import cron from 'cron';
import mongoose from 'mongoose';

import Debug from 'debug';

import config from '../../config/app';
import Feeds from '../model/feeds';

import DBM from './cron/DBM';
import OPM from './cron/OPM';


var debug = Debug('worker');

var app = Express();

const PATH_STYLES = path.resolve(__dirname, '../client/styles');
const PATH_DIST = path.resolve(__dirname, '../../dist');

app.use('/styles', Express.static(PATH_STYLES));
app.use(Express.static(PATH_DIST));

app.get('/', (req, res) => {
    //childProcess.exec('fortune /home/bbr/config/fortune/quotes', (error, stdout, stderr) => {
        //if (error !== null) {
            //debug('exec ', error);
            //return false;
        //}

        //res.send(stdout);
        //res.end();
    //});
    //
    //const PATH_STYLES = path.resolve(__dirname, '../client/styles');
  res.sendFile(path.resolve(__dirname, '../client/index.html'));
});

app.get('/resume', (req, res) => {
    mongoose.connect(config.db);
    var finish = () =>  {
        mongoose.disconnect();
        res.end();
    };

    var feeds = Feeds.find( {}, null, {
        sort: { format:1, date:-1}
    }, (err, allNews) => {
        if (err) {
            debug ('error', err);
            finish();
            return;
        }

        var formats = {};
        for (var i = 0; i < allNews.length; i++) {
            if ( !formats[allNews[i].format] ) {
                formats[allNews[i].format] = [];
            }
            formats[allNews[i].format].push( JSON.parse( allNews[i].data ) );
        };

        res.json(formats);
        finish();
    });

});

var server = app.listen(config.port || 3000, () => {
  var port = server.address().port;

  debug('Server is listening at %s', port);
});

var crons = [new cron.CronJob({
    cronTime: '00 00 */5 * * *',
    onTick: DBM,
    runOnInit: true
}), new cron.CronJob({
    cronTime: '00 10 */5 * * *',
    onTick: OPM,
    runOnInit: true
})];


