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
var server;

app.get('/', (req, res) => {
    childProcess.exec('fortune /home/bbr/config/fortune/quotes', (error, stdout, stderr) => {
        if (error !== null) {
            debug('exec ', error);
            return false;
        }

        res.send(stdout);
        res.end();
    });
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

        res.json(allNews);
        finish();
    });

});

server = app.listen(config.port || 3000, () => {
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


