// first we import our dependencies…
const express = require('express');
const Hotels = require('../models/hotels_model');

// and create our instances
const router = express.Router();

router.get('/dummy', (req, res) => {
    return res.json({ success: true, data: [] });
});
router.get('/readMe/:editkey', (req, res) => {
    const editkey = req.params.editkey;
    Hotels.findById({ _id: editkey }, (error, hotels) => {
        if (error) return res.json({ success: false, error });
        return res.json({ success: true, data: hotels });
    });
});

router.get('/filterHotel/:hotel', (req, res) => {
    const hotel = req.params.hotel;
    Hotels.findOne({ hotel: hotel }, (error, hotels) => {
        if (error) return res.json({ success: false, error });
        // var xresult = [];
        // if (hotels) {
        //     hotels.room.forEach(element => {
        //         xresult.push({
        //             label: element.name,
        //             value: element.room
        //         });
        //     });
            return res.json({ success: true, data: hotels });
        // }
    });
});
router.get('/filterone/:hotel', (req, res) => {
    const hotel = req.params.hotel;
    Hotels.findOne({ hotel: hotel }, (error, hotels) => {
        if (error) return res.json({ success: false, error });
        return res.json({ success: true, data: hotels });
    });
});
router.get('/filterR/:room', (req, res) => {
    const room = req.params.room;
    Hotels.findOne({ room: room }, (error, rooms) => {
        if (error) return res.json({ success: false, error });
        return res.json({ success: true, data: rooms });
    });
});
router.get('/filter/:hotel', (req, res) => {
    const hotel = req.params.hotel;
    Hotels.findOne({ hotel: hotel }, (error, hotels) => {
        if (error) return res.json({ success: false, error });
        return res.json({ success: true, data: hotels });
    });
});
router.get('/read', (req, res) => {
    Hotels.find((err, hotels) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data: hotels });
    }).sort({ _id: -1 });
});
router.get('/allhotel/:skip', (req, res) => {
    Hotels.find((err, hotels) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data: hotels });
    }).sort({ _id: -1 }).skip(parseInt(req.params.skip)).limit(10);
});
router.get('/search/:searchstring', (req, res) => {
    Hotels.find({ hotelname: { $regex: req.params.searchstring, $options: "i" } }, (error, hotelresult) => {
        if (error) return res.json({ success: false, error: error });
        return res.json({ success: true, data: hotelresult });
    });
});
router.post('/add', (req, res) => {
    const hotelAdd = new Hotels();
    const { hotel, hotelname, goodsCD, cutOffDays, room, created_by, updated_by } = req.body;
    if (!hotel || !room) {
        // we should throw an error. we can do this check on the front end
        return res.json({
            success: false,
            error: 'Provide name of hotel and room'
        });
    }
    hotelAdd.hotel = hotel;
    hotelAdd.hotelname = hotelname;
    hotelAdd.goodsCD = goodsCD;
    hotelAdd.cutOffDays = cutOffDays;
    hotelAdd.room = room;
    hotelAdd.created_by = created_by;
    hotelAdd.updated_by = updated_by;
    hotelAdd.save(err => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true });
    });
});
router.put('/update/:editKey', (req, res) => {
    const { editKey } = req.params;
    if (!editKey) {
        return res.json({ success: false, error: 'No hotel id provided' });
    }
    Hotels.findById(editKey, (error, hotelinfo) => {
        if (error) return res.json({ success: false, error });
        const { hotel, hotelname, goodsCD, cutOffDays, room, } = req.body;
        hotelinfo.hotel = hotel;
        hotelinfo.hotelname = hotelname;
        hotelinfo.goodsCD = goodsCD;
        hotelinfo.cutOffDays = cutOffDays;
        hotelinfo.room = room;

        if (hotel) hotelinfo.hotel = hotel;
        if (room) hotelinfo.room = room;

        hotelinfo.save(error => {
            if (error) return res.json({ success: false, error });
            return res.json({ success: true });
        });
    });
});

router.delete('/delete/:editKey', (req, res) => {
    const { editKey } = req.params;
    if (!editKey) {
        return res.json({ success: false, error: 'No comment id provided' });
    }
    Hotels.remove({ _id: editKey }, (error, hotel) => {
        if (error) return res.json({ success: false, error });
        return res.json({ success: true });
    });
});

module.exports = router;