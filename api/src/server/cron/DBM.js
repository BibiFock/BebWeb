import http from 'http';
import Debug from 'debug';
import mongoose from 'mongoose';

import config from '../../../config/app';

import Feeds from '../../model/feeds';

var debug = Debug('worker-DBM');

module.exports = () => {
    http.get('http://www.dragonball-multiverse.com/fr/accueil.html',  function (response) {
        if ( response.statusCode != 200) {
            debug('Url download Failed');
        }

        response.setEncoding('utf8');
        response.on('data', (chunk) => {
            var regExp = /<img src="(\/fr\/pages\/small\/(\d+).png)/;
            if (!regExp.test(chunk)) {
                return false;
            }
            var parse = chunk.match(regExp);
            var img = 'http://www.dragonball-multiverse.com' + parse[1];
            var data = {
                "thumb": img,
                "image": img.replace('small', 'final'),
                "id": parse[2]
            };

            mongoose.connect(config.db);

            Feeds.findOne({
                'format': 'DBM',
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
                    format: 'DBM',
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

