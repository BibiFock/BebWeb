import http from 'http';
import Debug from 'debug';
import mongoose from 'mongoose';

import config from '../../../config/app';

import Feeds from '../../model/feeds';

var debug = Debug('worker-OPM');

module.exports = () => {
    http.get('http://tonarinoyj.jp/manga/onepanman/',  (response) => {
        if ( response.statusCode != 200) {
            debug('Url download Failed', response.statusCode);
        }
        var body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
            body += chunk.replace(/(\n|\r)/g,'');
            var regExp = /<span>NEW<\/span>/;
            if (!regExp.test(chunk)) {
                return false;
            }

            regExp = /href="([^"]*)"[^>]*> *(\d+) *<span>NEW<\/span>/;
            var parse = body.match(regExp);

            var data = {
                'chapter': parse[2],
                'viewer': parse[1],
            };

            mongoose.connect(config.db);

            Feeds.findOne({
                'format': 'OPM',
                'id': parse[2]
            }, (err, feeds) => {
                if (err) {
                    throw err;
                }
                if (feeds != null) {
                    debug('no new image');
                    mongoose.connection.close();
                    return false;
                }

                debug('new image found', data);
                (new Feeds({
                    format: 'OPM',
                    id: parse[2],
                    data: JSON.stringify( data )
                })).save( (err) => {
                    if (err) {
                        throw err;
                    }
                    mongoose.connection.close();
                });

            });
        });
    });
};

