import mongoose from 'mongoose';

import config from '../../config/app';

var feedsSchema = new mongoose.Schema({
    date: { type: Date, required: true, default:Date.now },
    format: { type:String, required: true, validate: /^(DBM|OPM)$/ },
    id: { type:String, required: true },
    data: String,
    new: { type:Boolean, default:true }
});


module.exports = mongoose.model('Feeds', feedsSchema);

